const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async signup(userData: any) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }
    return response.json();
  },

  async signin(credentials: any) {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }
    return response.json();
  },

  async resetPassword(email: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }
    return response.json();
  },

  async sendChatMessage(message: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
  },

  async getConversations(userId: string) {
    const response = await fetch(`${API_BASE_URL}/conversations/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    const conversations = await response.json();
    return conversations.map((conv: any) => ({
      ...conv,
      id: conv._id || conv.id || crypto.randomUUID()
    }));
  },

  async saveConversation(conversationData: any) {
    const { _id, id, ...dataToSave } = conversationData;
    const uniqueId = _id || id || crypto.randomUUID();
    
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dataToSave,
        id: uniqueId
      })
    });
    if (!response.ok) throw new Error('Failed to save conversation');
    return response.json();
  },

  async updateConversation(conversationData: any) {
    const { _id, id, ...dataToSave } = conversationData;
    const uniqueId = _id || id || crypto.randomUUID();
    
    const response = await fetch(`${API_BASE_URL}/conversations/${uniqueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dataToSave,
        id: uniqueId
      })
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    return response.json();
  },

  async deleteConversation(conversationId: string) {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete conversation');
    }
    
    return response.json();
  },

  async getMoodHistory(userId: string) {
    const response = await fetch(`${API_BASE_URL}/mood/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch mood history');
    return response.json();
  },

  async saveMood(moodData: any) {
    const response = await fetch(`${API_BASE_URL}/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moodData)
    });
    if (!response.ok) throw new Error('Failed to save mood');
    return response.json();
  },

  async getFeedback() {
    const response = await fetch(`${API_BASE_URL}/feedback`);
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async saveFeedback(feedbackData: any) {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    if (!response.ok) throw new Error('Failed to save feedback');
    return response.json();
  },

  async getUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  async updateUserSettings(userId: string, settings: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update user settings');
    return response.json();
  },

  async updateUserSecurity(userId: string, securityData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securityData)
    });
    if (!response.ok) throw new Error('Failed to update security settings');
    return response.json();
  }
};