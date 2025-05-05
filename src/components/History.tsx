import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Trash2, Loader2, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, X
} from 'lucide-react';
import { api } from '../services/api';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string | Date;
}

interface ChatHistory {
  id: string;
  userId: string;
  date: string;
  topic: string;
  messages: Message[];
}

const History = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingSingle, setIsDeletingSingle] = useState<string | null>(null);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    loadConversations(JSON.parse(currentUser).email);
  }, [navigate]);

  const loadConversations = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userConversations = await api.getConversations(userId);
      
      const typedConversations = userConversations as ChatHistory[];
      
      const uniqueConversations = Array.from(
        new Map(typedConversations.map(conv => [conv.id, conv])).values()
      );
      
      const sortedConversations = [...uniqueConversations].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setConversations(sortedConversations);
    } catch (err) {
      setError('Failed to load conversations. Please try again later.');
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      setIsDeletingSingle(id);
      setError(null);
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      setShowDeleteModal(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation. Please try again.');
    } finally {
      setIsDeletingSingle(null);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      setIsDeletingAll(true);
      setError(null);
      await Promise.all(conversations.map(conv => api.deleteConversation(conv.id)));
      setConversations([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history. Please try again.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const DeleteAllModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4 text-red-500">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Delete All Conversations</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete all conversations? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteAllModal(false)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClearAllHistory}
            disabled={isDeletingAll}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isDeletingAll ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete All'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteConversationModal = ({ conversationId }: { conversationId: string }) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Delete Conversation</h3>
            </div>
            <button 
              onClick={() => setShowDeleteModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this conversation?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{conversation.topic}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(conversation.date), 'PPP')} • {conversation.messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteConversation(conversationId)}
              disabled={isDeletingSingle === conversationId}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isDeletingSingle === conversationId ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const toggleConversation = (id: string) => {
    setExpandedConversation(expandedConversation === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getPreviewText = (messages: Message[]) => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
    
    return {
      user: lastUserMessage ? (lastUserMessage.text.length > 50 ? lastUserMessage.text.substring(0, 50) + '...' : lastUserMessage.text) : '',
      bot: lastBotMessage ? (lastBotMessage.text.length > 50 ? lastBotMessage.text.substring(0, 50) + '...' : lastBotMessage.text) : ''
    };
  };

  const groupConversationsByDate = () => {
    const grouped: { [key: string]: ChatHistory[] } = {};
    conversations
      .filter(conv => !selectedDate || new Date(conv.date).toISOString().split('T')[0] === selectedDate)
      .forEach(conv => {
        const dateKey = formatDate(conv.date);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(conv);
      });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={`loading-${i}`} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Wellness Journey</h1>
            {conversations.length > 0 && (
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BAE6F2]"
                />
                <button 
                  onClick={() => setShowDeleteAllModal(true)}
                  disabled={isDeletingAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All History
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button className="flex-1 bg-[#BAE6F2] py-2 rounded-lg relative">
              Conversations
              <Star className="w-5 h-5 text-green-500 absolute right-4 top-1/2 transform -translate-y-1/2" />
            </button>
            <Link to="/mood-tracker" className="flex-1 bg-[#BAE6F2]/50 py-2 rounded-lg text-center">
              Mood Tracker
            </Link>
          </div>

          <div className="space-y-8">
            {Object.entries(groupConversationsByDate()).map(([date, convs], dateIndex) => (
              <div key={`date-group-${dateIndex}-${date}`}>
                <h3 className="text-lg font-semibold mb-4">{date}</h3>
                <div className="space-y-4">
                  {convs.map((conv, convIndex) => {
                    const preview = getPreviewText(conv.messages);
                    const uniqueKey = `conv-${dateIndex}-${convIndex}-${conv.id}`;
                    const isExpanded = expandedConversation === conv.id;

                    return (
                      <div
                        key={uniqueKey}
                        className="group bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative"
                      >
                        <div className="flex justify-between items-start">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleConversation(conv.id)}
                          >
                            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#7CC5E3]" />
                              {conv.topic}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </h3>
                            {!isExpanded && (
                              <div className="space-y-1">
                                {preview.user && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">You:</span> {preview.user}
                                  </p>
                                )}
                                {preview.bot && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">SAM1:</span> {preview.bot}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setShowDeleteModal(conv.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                            title="Delete Chat"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            {conv.messages.map((message, index) => (
                              <div
                                key={`message-${index}`}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`rounded-lg p-3 max-w-[80%] ${
                                    message.sender === 'user' 
                                      ? 'bg-[#BAE6F2] text-gray-800' 
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  <p className="text-sm">{message.text}</p>
                                  <span className="text-xs text-gray-500 mt-1 block">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <span>{format(new Date(conv.date), 'h:mm a')}</span>
                          <span>•</span>
                          <span>{conv.messages.length} messages</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No conversations yet</p>
                <Link
                  to="/chat"
                  className="inline-flex items-center bg-[#BAE6F2] text-black px-6 py-3 rounded-full hover:bg-[#A5D5E1] transition-colors"
                >
                  Start a New Chat
                  <span className="ml-2">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteAllModal && <DeleteAllModal />}
      {showDeleteModal && <DeleteConversationModal conversationId={showDeleteModal} />}
    </div>
  );
};

export default History;