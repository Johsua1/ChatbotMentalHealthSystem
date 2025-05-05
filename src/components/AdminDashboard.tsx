import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Users, MessageCircle, TrendingUp, Activity, Calendar,
  ArrowUpRight, ArrowDownRight, UserPlus, Loader2
} from 'lucide-react';
import { api } from '../services/api';

interface FeedbackData {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface UserData {
  _id: string;
  email: string;
  fullname: string;
  gender: string;
  birthdate: string;
  joinDate: string;
}

interface ChatData {
  _id: string;
  userId: string;
  date: string;
  messages: any[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [chats, setChats] = useState<ChatData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser || !JSON.parse(currentUser).isAdmin) {
          navigate('/signin');
          return;
        }

        setIsLoading(true);
        const [feedbackData, userData, conversationsData] = await Promise.all([
          api.getFeedback(),
          api.getAllUsers(),
          api.getConversations('all')
        ]);

        // Sort feedbacks by date in descending order
        const sortedFeedbacks = feedbackData.sort((a: FeedbackData, b: FeedbackData) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setFeedbacks(sortedFeedbacks);

        // Sort users by join date in descending order
        const sortedUsers = userData.sort((a: UserData, b: UserData) => 
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        );
        setUsers(sortedUsers);

        setChats(conversationsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const getStats = () => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
    }

    const newUsers = users.filter(user => new Date(user.joinDate) >= periodStart);
    const newChats = chats.filter(chat => new Date(chat.date) >= periodStart);
    const periodFeedbacks = feedbacks.filter(feedback => new Date(feedback.date) >= periodStart);
    
    const averageRating = periodFeedbacks.length
      ? periodFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / periodFeedbacks.length
      : 0;

    return {
      newUsers: newUsers.length,
      totalUsers: users.length,
      newChats: newChats.length,
      totalChats: chats.length,
      averageRating: averageRating.toFixed(1),
      totalFeedbacks: periodFeedbacks.length
    };
  };

  const stats = getStats();

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">Users</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-sm text-green-500 flex items-center">
                <UserPlus className="w-4 h-4 mr-1" />
                +{stats.newUsers} new
              </p>
            </div>
            <div className="h-16 w-24">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm text-gray-500">Chats</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">{stats.totalChats}</h3>
              <p className="text-sm text-purple-500 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                {stats.newChats} active
              </p>
            </div>
            <div className="h-16 w-24">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-sm text-gray-500">Avg Rating</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">{stats.averageRating}/5</h3>
              <p className="text-sm text-yellow-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {stats.totalFeedbacks} reviews
              </p>
            </div>
            <div className="h-16 w-24">
              {Number(stats.averageRating) >= 4 ? (
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-500" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-gray-500">Engagement</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {((stats.totalChats / stats.totalUsers) || 0).toFixed(1)}
              </h3>
              <p className="text-sm text-green-500">Chats per user</p>
            </div>
            <div className="h-16 w-24">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{user.fullname}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(user.joinDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {feedbacks.slice(0, 5).map((feedback, index) => (
              <div key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{feedback.userName}</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{feedback.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(feedback.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Gender</th>
              <th className="text-left py-3 px-4">Birthdate</th>
              <th className="text-left py-3 px-4">Join Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.fullname}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.gender}</td>
                <td className="py-3 px-4">{new Date(user.birthdate).toLocaleDateString()}</td>
                <td className="py-3 px-4">{new Date(user.joinDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFeedbackTab = () => (
    <div className="space-y-4">
      {feedbacks.map((feedback, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{feedback.userName}</h3>
              <p className="text-sm text-gray-500">{new Date(feedback.date).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-700">{feedback.comment}</p>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#7CC5E3] mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#7CC5E3] text-white px-6 py-2 rounded-lg hover:bg-[#6BB4D2]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7CC5E3]"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-b-2 border-[#7CC5E3] text-[#7CC5E3] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'users'
                ? 'border-b-2 border-[#7CC5E3] text-[#7CC5E3] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'feedback'
                ? 'border-b-2 border-[#7CC5E3] text-[#7CC5E3] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Feedback
          </button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'feedback' && renderFeedbackTab()}
    </div>
  );
};

export default AdminDashboard;