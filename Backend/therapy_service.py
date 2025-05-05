from sentence_transformers import SentenceTransformer
from langchain_ollama import OllamaLLM
import faiss
import numpy as np
from pymongo import MongoClient
import datetime
import json
import re
from typing import List, Dict

class ChatService:
    def __init__(self):
        # Initialize FAISS index
        self.index = faiss.read_index("Backend/faiss_index.index")

        # Load datasets
        with open("Backend/datasets.json", "r", encoding="utf-8") as f:
            self.datasets = json.load(f)

        # Extract questions and responses
        self.questions = [entry['question'] for entry in self.datasets]
        self.responses = [entry['response'] for entry in self.datasets]

        # Initialize models
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = OllamaLLM(model="llama3.1")

        # MongoDB setup
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client.get_database("therapy_db")
        
        # Memory for conversation context
        self.conversation_memory = {}

    def _get_user_context(self, user_id: str) -> Dict:
        """Retrieve user context from MongoDB"""
        user = self.db.users.find_one({"email": user_id})
        if not user:
            return {}
        
        return {
            "name": user.get("fullname", ""),
            "gender": user.get("gender", ""),
            "age": self._calculate_age(user.get("birthdate", "")),
            "join_date": user.get("joinDate", "")
        }

    def _get_recent_conversations(self, user_id: str, limit: int = 5) -> List[Dict]:
        """Retrieve recent conversations from MongoDB"""
        conversations = list(self.db.conversations.find(
            {"userId": user_id},
            sort=[("date", -1)],
            limit=limit
        ))
        return conversations

    def _calculate_age(self, birthdate: str) -> int:
        if not birthdate:
            return 0
        birth_date = datetime.datetime.fromisoformat(birthdate)
        today = datetime.datetime.now()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    def _create_context_aware_prompt(self, user_input: str, user_id: str, retrieved_text: str) -> str:
        """Create a prompt that includes user context and conversation history"""
        user_context = self._get_user_context(user_id)
        recent_conversations = self._get_recent_conversations(user_id)
        
        conversation_history = ""
        if recent_conversations:
            conversation_history = "\nRecent conversations:\n"
            for conv in recent_conversations:
                if "messages" in conv:
                    for msg in conv["messages"][-3:]:  # Last 3 messages of each conversation
                        conversation_history += f"{msg['sender']}: {msg['text']}\n"

        prompt = f"""
You are an empathetic AI therapist helping users process emotions.

User Context:
- Name: {user_context.get('name', 'User')}
- Gender: {user_context.get('gender', 'Unknown')}
- Age: {user_context.get('age', 'Unknown')}
- User since: {user_context.get('join_date', 'Unknown')}

Previous Context:
{conversation_history}

Relevant Information:
\"\"\"{retrieved_text}\"\"\"

Current message:
\"\"\"{user_input}\"\"\"

Use ONLY the following format:
Answer: <empathetic response that acknowledges user context and history>

Do not include Q: or anything outside the format."""

        return prompt.strip()

    def handle_message(self, user_input: str, user_id: str = "default") -> str:
        previous_context = self.conversation_memory.get(user_id, '')
        full_input = f"{previous_context}\nUser: {user_input}"

        # Generate embedding and search FAISS index
        query_embedding = self.embedder.encode([full_input])
        _, idx = self.index.search(np.array(query_embedding), k=1)

        retrieved_text = "I couldn't find helpful context right now. Let's focus on how you're feeling."
        if len(idx[0]) > 0:
            relevant_question = self.questions[idx[0][0]]
            retrieved_text = self.responses[idx[0][0]].strip()

            if self._is_similar(user_input, relevant_question):
                return retrieved_text

        # Create context-aware prompt
        prompt = self._create_context_aware_prompt(user_input, user_id, retrieved_text)

        try:
            raw_response = self.model.invoke(prompt)
        except Exception:
            return "I'm having trouble forming a proper response right now. Please try again later."

        answer = self._extract_answer(raw_response)
        
        # Save the conversation
        self.save_conversation(user_input, answer, user_id)
        
        # Update memory
        self.conversation_memory[user_id] = (
            f"{previous_context}\nUser: {user_input}\nBot: {answer}"
        )

        return answer.strip()

    def analyze_mood_trend(self, moods: List[Dict]) -> str:
        if not moods:
            return "No mood data available for analysis."

        sorted_moods = sorted(moods, key=lambda x: x['date'])
        mood_values = [m['mood'] for m in sorted_moods]
        
        avg_mood = sum(mood_values) / len(mood_values)
        latest_mood = mood_values[-1]
        mood_trend = latest_mood - mood_values[0] if len(mood_values) > 1 else 0

        trend_description = "improving" if mood_trend > 0 else "declining" if mood_trend < 0 else "stable"

        prompt = f"""
You are analyzing mood data for a therapy user. Create a brief, empathetic insight based on these statistics:
- Average mood: {avg_mood:.1f}/10
- Latest mood: {latest_mood}/10
- Overall trend: {trend_description}

Use ONLY the following format:
Answer: <2-3 sentences of empathetic insight>
"""

        try:
            raw_insight = self.model.invoke(prompt)
            insight = self._extract_answer(raw_insight)
            return insight
        except Exception:
            return f"Your average mood has been {avg_mood:.1f}/10, and I notice a {trend_description} trend. Keep tracking your moods to better understand your emotional patterns."

    def save_conversation(self, user_input: str, answer: str, user_id: str) -> None:
        if self.db is not None:
            conversation_collection = self.db['conversations']
            conversation_data = {
                "userId": user_id,
                "messages": [
                    {
                        "sender": "user",
                        "text": user_input,
                        "timestamp": datetime.datetime.utcnow()
                    },
                    {
                        "sender": "bot",
                        "text": answer,
                        "timestamp": datetime.datetime.utcnow()
                    }
                ],
                "date": datetime.datetime.utcnow()
            }
            conversation_collection.insert_one(conversation_data)

    def _extract_answer(self, raw_response: str) -> str:
        answer_match = re.search(r"(?i)^answer:\s*(.+)", raw_response, re.MULTILINE)
        if answer_match:
            return answer_match.group(1).strip()

        lines = raw_response.strip().split("\n")
        return lines[0].strip() if lines else "I'm here for you, can you tell me more?"

    def _is_similar(self, user_input: str, relevant_question: str) -> bool:
        user_input_embedding = self.embedder.encode([user_input])
        question_embedding = self.embedder.encode([relevant_question])
        
        similarity = np.dot(user_input_embedding, question_embedding.T) / (
            np.linalg.norm(user_input_embedding) * np.linalg.norm(question_embedding)
        )
        return similarity > 0.7