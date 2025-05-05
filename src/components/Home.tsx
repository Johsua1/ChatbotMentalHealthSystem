import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Heart, Shield, MessageCircle, TrendingUp } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const fullText = "Your AI Mental Wellness Companion";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setUserName(userData.fullname || 'User');
      
      // Redirect admin users to dashboard
      if (userData.isAdmin) {
        navigate('/admin');
      }
    } else {
      setIsAuthenticated(false);
      setUserName('');
      // Reset text animation when user signs out
      setText('');
      setCurrentIndex(0);
    }
  }, [navigate, localStorage.getItem('currentUser')]);

  useEffect(() => {
    if (!isAuthenticated && currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isAuthenticated]);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Support",
      description: "24/7 emotional support and guidance tailored to your needs"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Mood Tracking",
      description: "Monitor and understand your emotional well-being over time"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Private & Secure",
      description: "Your data is encrypted and stored securely"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Personalized Chat",
      description: "Natural conversations that adapt to your unique situation"
    }
  ];

  return (
    <div className="min-h-screen wave-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {isAuthenticated ? `Welcome back, ${userName}!` : text}
              {!isAuthenticated && <span className="animate-pulse">|</span>}
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-fade-in delay-500">
              {isAuthenticated 
                ? "Continue your wellness journey with personalized support and guidance."
                : "Experience personalized mental wellness support powered by advanced AI. Your companion for emotional well-being, available 24/7."}
            </p>
            <div className="flex gap-4 animate-fade-in delay-700">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="bg-white text-[#7CC5E3] px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                {isAuthenticated ? (
                  <>
                    Continue Chat
                    <MessageCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Get Started
                    <span className="text-xl">→</span>
                  </>
                )}
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/history"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  View History
                </Link>
              ) : (
                <Link
                  to="/about"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex-1 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7CC5E3]/30 to-transparent rounded-full animate-pulse"></div>
              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center">
                  <Brain className="w-24 h-24 text-[#7CC5E3] mb-6" />
                  <div className="space-y-4 w-full">
                    <div className="bg-gray-100 rounded-full h-2 w-full">
                      <div className="bg-[#7CC5E3] h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 w-full">
                      <div className="bg-[#7CC5E3] h-2 rounded-full w-1/2 animate-pulse delay-100"></div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 w-full">
                      <div className="bg-[#7CC5E3] h-2 rounded-full w-2/3 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <>
          <div className="bg-white py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
                Why Choose SAM1?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-lg card-hover"
                  >
                    <div className="w-16 h-16 bg-[#BAE6F2] rounded-full flex items-center justify-center mb-4 text-[#7CC5E3]">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#7CC5E3]/10 py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#111111] mb-2">24/7</div>
                  <div className="text-gray-600">Available Support</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#111111] mb-2">100%</div>
                  <div className="text-gray-600">Private & Secure</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#111111] mb-2">
                    <TrendingUp className="w-10 h-10 inline-block" />
                  </div>
                  <div className="text-gray-600">Continuous Learning</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have found support and guidance through SAM1.
                Your mental wellness journey begins here.
              </p>
              <Link
                to="/signup"
                className="bg-[#7CC5E3] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#6BB4D2] transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions Section - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Link
                to="/mood-tracker"
                className="bg-white p-6 rounded-xl shadow-lg card-hover text-center"
              >
                <div className="w-16 h-16 bg-[#BAE6F2] rounded-full flex items-center justify-center mb-4 text-[#7CC5E3] mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Mood</h3>
                <p className="text-gray-600">Monitor your emotional well-being</p>
              </Link>
              
              <Link
                to="/chat"
                className="bg-white p-6 rounded-xl shadow-lg card-hover text-center"
              >
                <div className="w-16 h-16 bg-[#BAE6F2] rounded-full flex items-center justify-center mb-4 text-[#7CC5E3] mx-auto">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Chat</h3>
                <p className="text-gray-600">Begin a new conversation</p>
              </Link>
              
              <Link
                to="/history"
                className="bg-white p-6 rounded-xl shadow-lg card-hover text-center"
              >
                <div className="w-16 h-16 bg-[#BAE6F2] rounded-full flex items-center justify-center mb-4 text-[#7CC5E3] mx-auto">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">View History</h3>
                <p className="text-gray-600">Review past conversations</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;