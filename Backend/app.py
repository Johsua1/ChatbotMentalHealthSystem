from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from therapy_service import ChatService
import bcrypt

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['therapy_db']
users_collection = db['users']
conversations_collection = db['conversations']
mood_collection = db['moods']
feedback_collection = db['feedback']
chat_service = ChatService()

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
    
    user = {
        'fullname': data['fullname'],
        'email': data['email'],
        'password': hashed_password,
        'gender': data['gender'],
        'birthdate': data['birthdate'],
        'joinDate': datetime.utcnow(),
        'isAdmin': False,
        'settings': {
            'language': 'English',
            'theme': 'light'
        },
        'security': {
            'twoFactor': False,
            'lastPasswordChange': datetime.utcnow()
        }
    }
    
    users_collection.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        user['_id'] = str(user['_id'])
        user.pop('password', None)
        return jsonify(user), 200
    
    return jsonify({'error': 'Invalid password'}), 401

@app.route('/api/users/check-email', methods=['POST'])
def check_email():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'error': 'Email not found'}), 404
    
    return jsonify({'message': 'Email found'}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    user = users_collection.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data['newPassword'].encode('utf-8'), salt)
    
    users_collection.update_one(
        {'email': data['email']},
        {
            '$set': {
                'password': hashed_password,
                'security.lastPasswordChange': datetime.utcnow()
            }
        }
    )
    
    return jsonify({'message': 'Password reset successfully'}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    user_id = data.get('userId')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
        
    try:
        response = chat_service.handle_message(user_message, user_id)
        return jsonify({'response': response}), 200
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': 'Failed to process message'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    users = list(users_collection.find())
    for user in users:
        user['_id'] = str(user['_id'])
        user.pop('password', None)
    return jsonify(users)

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user['_id'] = str(user['_id'])
    user.pop('password', None)
    return jsonify(user)

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    if 'password' in data:
        salt = bcrypt.gensalt()
        data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
    
    users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': data}
    )
    return jsonify({'message': 'User updated'}), 200

@app.route('/api/users/<user_id>/settings', methods=['PUT'])
def update_user_settings(user_id):
    data = request.json
    users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'settings': data}}
    )
    return jsonify({'message': 'Settings updated'}), 200

@app.route('/api/users/<user_id>/security', methods=['PUT'])
def update_user_security(user_id):
    data = request.json
    if 'currentPassword' in data:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not bcrypt.checkpw(data['currentPassword'].encode('utf-8'), user['password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        if 'newPassword' in data:
            salt = bcrypt.gensalt()
            data['password'] = bcrypt.hashpw(data['newPassword'].encode('utf-8'), salt)
            data.pop('currentPassword')
            data.pop('newPassword')
    
    users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'security': data.get('security', {}),
            'password': data.get('password', None)
        }}
    )
    return jsonify({'message': 'Security settings updated'}), 200

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    users_collection.delete_one({'_id': ObjectId(user_id)})
    conversations_collection.delete_many({'userId': user_id})
    mood_collection.delete_many({'userId': user_id})
    feedback_collection.delete_many({'userId': user_id})
    return jsonify({'message': 'User and related data deleted'}), 200

@app.route('/api/conversations/<user_id>', methods=['GET'])
def get_conversations(user_id):
    conversations = list(conversations_collection.find({'userId': user_id}))
    for conv in conversations:
        conv['_id'] = str(conv['_id'])
    return jsonify(conversations)

@app.route('/api/conversations', methods=['POST'])
def save_conversation():
    data = request.json
    if '_id' in data:
        data.pop('_id')  # Remove any existing ID to let MongoDB generate a new one
    result = conversations_collection.insert_one(data)
    return jsonify({'message': 'Conversation saved', 'id': str(result.inserted_id)}), 201

@app.route('/api/conversations/<conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    try:
        data = request.json
        # Remove any existing ID fields to avoid conflicts
        if '_id' in data:
            data.pop('_id')
        
        # Update or insert the conversation
        result = conversations_collection.update_one(
            {'id': conversation_id},
            {'$set': data},
            upsert=True
        )
        
        return jsonify({'message': 'Conversation updated', 'id': conversation_id}), 200
    except Exception as e:
        print(f"Error updating conversation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    try:
        # Create an index on the id field if it doesn't exist
        conversations_collection.create_index('id')
        
        # First try to delete by ObjectId
        try:
            obj_id = ObjectId(conversation_id)
            result = conversations_collection.delete_one({'$or': [
                {'_id': obj_id},
                {'id': conversation_id}
            ]})
        except:
            # If conversion to ObjectId fails, try with the original string ID
            result = conversations_collection.delete_one({'id': conversation_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Conversation not found'}), 404
            
        return jsonify({'message': 'Conversation deleted'}), 200
    except Exception as e:
        print(f"Error deleting conversation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/<user_id>', methods=['GET'])
def get_mood_history(user_id):
    moods = list(mood_collection.find({'userId': user_id}))
    for mood in moods:
        mood['_id'] = str(mood['_id'])
    
    # Get AI insight for the mood data
    insight = chat_service.analyze_mood_trend(moods)
    
    return jsonify({
        'moods': moods,
        'insight': insight
    })

@app.route('/api/mood', methods=['POST'])
def save_mood():
    data = request.json
    mood_collection.insert_one(data)
    return jsonify({'message': 'Mood saved'}), 201

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    feedback = list(feedback_collection.find())
    for f in feedback:
        f['_id'] = str(f['_id'])
    return jsonify(feedback)

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    feedback_collection.insert_one(data)
    return jsonify({'message': 'Feedback saved'}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)