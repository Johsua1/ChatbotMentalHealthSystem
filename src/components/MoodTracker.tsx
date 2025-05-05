import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Brain } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MoodEntry {
  userId: string;
  mood: number;
  date: string;
  note?: string;
}

const MoodTracker = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [averageMood, setAverageMood] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const user = JSON.parse(currentUser);
    loadMoodData(user.email);
  }, [navigate, selectedPeriod]);

  const loadMoodData = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await api.getMoodHistory(userId);
      const moodHistory = response.moods;
      setAiInsight(response.insight);
      
      // Sort mood entries by date
      const sortedMoodHistory = moodHistory.sort(
        (a: MoodEntry, b: MoodEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate date range based on selected period
      const today = new Date();
      const periodStart = new Date();
      if (selectedPeriod === 'week') {
        periodStart.setDate(today.getDate() - 7);
      } else {
        periodStart.setMonth(today.getMonth() - 1);
      }

      // Filter mood entries within the selected period
      const filteredMoodHistory = sortedMoodHistory.filter((entry: MoodEntry) => 
        new Date(entry.date) >= periodStart && new Date(entry.date) <= today
      );

      setMoodData(filteredMoodHistory);

      // Calculate average mood
      if (filteredMoodHistory.length > 0) {
        const avg = filteredMoodHistory.reduce((sum: number, entry: MoodEntry) => sum + entry.mood, 0) / filteredMoodHistory.length;
        setAverageMood(Number(avg.toFixed(1)));
      }
    } catch (err) {
      setError('Failed to load mood data. Please try again later.');
      console.error('Error loading mood data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    const days = selectedPeriod === 'week' ? 7 : 30;
    const labels = Array.from({ length: days }).map((_, i) => {
      return format(subDays(new Date(), days - 1 - i), 'MMM d');
    });

    const dataPoints = labels.map(label => {
      const entry = moodData.find(d => 
        format(new Date(d.date), 'MMM d') === label
      );
      return entry ? entry.mood : null;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Mood Level',
          data: dataPoints,
          backgroundColor: dataPoints.map(mood => {
            if (!mood) return 'rgba(229, 231, 235, 0.5)';
            if (mood <= 3) return 'rgba(239, 68, 68, 0.5)';
            if (mood <= 7) return 'rgba(249, 115, 22, 0.5)';
            return 'rgba(34, 197, 94, 0.5)';
          }),
          borderColor: dataPoints.map(mood => {
            if (!mood) return 'rgb(209, 211, 215)';
            if (mood <= 3) return 'rgb(239, 68, 68)';
            if (mood <= 7) return 'rgb(249, 115, 22)';
            return 'rgb(34, 197, 94)';
          }),
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            if (value === null) return 'No data';
            return `Mood: ${value}/10`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Your Wellness Journey</h1>

          <div className="flex gap-2 mb-6">
            <Link to="/history" className="flex-1 bg-[#BAE6F2]/50 py-2 rounded-lg text-center">
              Conversations
            </Link>
            <button className="flex-1 bg-[#BAE6F2] py-2 rounded-lg relative text-center">
              Mood Tracker
              <Star className="w-5 h-5 text-green-500 absolute right-4 top-1/2 transform -translate-y-1/2" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-lg ${
                  selectedPeriod === 'week' ? 'bg-[#7CC5E3] text-white' : 'bg-gray-100'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg ${
                  selectedPeriod === 'month' ? 'bg-[#7CC5E3] text-white' : 'bg-gray-100'
                }`}
              >
                Last 30 Days
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Average Mood:</span>
              <span className="font-semibold">{averageMood}/10</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="h-[400px] w-full">
              <Bar data={getChartData()} options={chartOptions} />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm">Low (1-3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm">Medium (4-7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">High (8-10)</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-[#7CC5E3]" />
              <h3 className="font-semibold">AI Generated Insight</h3>
            </div>
            <p className="text-gray-700">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;