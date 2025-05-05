import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Smile, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { api } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  userId: string;
  date: string;
  topic: string;
  messages: Message[];
}

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mood, setMood] = useState<string>('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [isMoodRated, setIsMoodRated] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    // Check for existing conversation
    const savedConversation = localStorage.getItem('currentConversation');
    if (savedConversation) {
      const conversation = JSON.parse(savedConversation);
      // Convert string timestamps back to Date objects
      const parsedMessages = conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
      setCurrentConversation({
        ...conversation,
        messages: parsedMessages
      });
      setChatTitle(conversation.topic || 'New Chat');
      setIsMoodRated(true);
      localStorage.removeItem('currentConversation');
    } else if (messages.length === 0) {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: "Hello! How are you feeling today? Please rate your mood:",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([botMessage]);
    }

    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [navigate]);

  useEffect(() => {
    if (messages.length > 1) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Generate title from conversation content
      const titleText = generateTitle(messages);
      
      const conversation: Conversation = {
        id: currentConversation?.id || crypto.randomUUID(),
        userId: currentUser.email,
        date: new Date().toISOString(),
        topic: titleText,
        messages
      };

      setChatTitle(titleText);
      
      // Only save if we have a new message
      if (!currentConversation || messages.length > currentConversation.messages.length) {
        api.updateConversation(conversation)
          .then(() => setCurrentConversation(conversation))
          .catch(console.error);
      }
    }
  }, [messages]);

  const generateTitle = (messages: Message[]) => {
    if (messages.length <= 1) return 'New Chat';

    // Get the first user message and first bot response
    const userMessage = messages.find(m => m.sender === 'user')?.text || '';

    // Extract key phrases
    let title = '';
    if (userMessage.length <= 30) {
      title = userMessage;
    } else {
      // Take first sentence or first 30 characters
      title = userMessage.split(/[.!?]/)[0];
      if (title.length > 30) {
        title = title.substring(0, 30) + '...';
      }
    }

    // If it's a mood rating, create a more descriptive title
    if (!isNaN(Number(userMessage)) && Number(userMessage) >= 1 && Number(userMessage) <= 10) {
      title = `Mood Check: ${userMessage}/10`;
    }

    return title;
  };

  useEffect(() => {
    if (mood && !isMoodRated) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const moodData = {
        userId: currentUser.email,
        mood: parseInt(mood),
        date: new Date().toISOString(),
        note: messages[messages.length - 1]?.text || ''
      };

      api.saveMood(moodData)
        .then(() => setIsMoodRated(true))
        .catch(console.error);
    }
  }, [mood, messages, isMoodRated]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const onEmojiClick = (emojiObject: any) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSpeechRecognitionError = (error: any) => {
    setIsRecording(false);
    let errorMessage = '';

    switch (error.error) {
      case 'not-allowed':
        errorMessage = 'Microphone access was denied. Please enable microphone access in your browser settings.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Speech recognition service is not available in your browser.';
        break;
      case 'network':
        errorMessage = 'Network error occurred. Please check your internet connection.';
        break;
      case 'no-speech':
        errorMessage = 'No speech was detected. Please try again.';
        break;
      case 'aborted':
        return;
      default:
        errorMessage = 'An error occurred with speech recognition. Please try again.';
    }

    const botMessage: Message = {
      id: crypto.randomUUID(),
      text: errorMessage,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const startSpeechRecognition = () => {
    if (!isMoodRated) return;
    
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: 'Speech recognition is not supported in your browser. Please try using Chrome.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript.trim());
      };

      recognition.onerror = handleSpeechRecognitionError;

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      setTimeout(() => {
        if (recognition && isRecording) {
          recognition.stop();
        }
      }, 30000);

      recognition.start();
    } catch (error) {
      console.error('Speech recognition initialization error:', error);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: 'Failed to initialize speech recognition. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleMoodSelection = (selectedMood: string) => {
    setMood(selectedMood);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: selectedMood,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const response = `Thank you for sharing. I see your mood is ${selectedMood}/10. `;
    const followUp = Number(selectedMood) < 5 
      ? "I'm here to support you. Would you like to talk about what's bothering you?"
      : "That's great! Would you like to share what's making you feel good today?";

    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response + followUp,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isMoodRated) return;

    const inputMessage = message;
    setMessage('');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);
    try {
      const response = await api.sendChatMessage(inputMessage, currentUser.email);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 3) return 'bg-red-500 hover:bg-red-600';
    if (moodValue <= 7) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex items-center p-4 border-b">
          <h2 className="font-semibold">
            {chatTitle}
          </h2>
        </div>

        <div ref={chatAreaRef} className="h-[500px] p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.sender === 'user' ? 'flex justify-end' : ''}`}
            >
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  msg.sender === 'user' ? 'bg-[#BAE6F2]' : 'bg-gray-100'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {!isMoodRated && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleMoodSelection(value.toString())}
                  className={`${getMoodColor(value)} text-white px-4 py-2 rounded-full transition-colors`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
          {isProcessing && (
            <div className="flex gap-2 items-center text-gray-500">
              <div className="animate-bounce">●</div>
              <div className="animate-bounce [animation-delay:0.2s]">●</div>
              <div className="animate-bounce [animation-delay:0.4s]">●</div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                className={`p-2 hover:bg-gray-100 rounded-full ${showEmojiPicker ? 'bg-gray-100' : ''} ${!isMoodRated ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isMoodRated && setShowEmojiPicker(!showEmojiPicker)}
                disabled={!isMoodRated}
              >
                <Smile className="w-6 h-6 text-gray-500" />
              </button>
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-12 left-0 z-50"
                >
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isMoodRated ? "Write your message..." : "Please rate your mood first"}
              className="flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#BAE6F2]"
              disabled={!isMoodRated}
            />
            <button 
              className={`p-2 hover:bg-gray-100 rounded-full ${isRecording ? 'bg-red-100' : ''} ${!isMoodRated ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={startSpeechRecognition}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              disabled={!isMoodRated}
            >
              <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500' : 'text-gray-500'}`} />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={isProcessing || !isMoodRated}
              className={`p-2 hover:bg-gray-100 rounded-full ${!isMoodRated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;