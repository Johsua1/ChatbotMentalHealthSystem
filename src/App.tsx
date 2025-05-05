import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Home from './components/Home.tsx';
import About from './components/About.tsx';
import SignIn from './components/SignIn.tsx';
import SignUp from './components/SignUp.tsx';
import Chat from './components/Chat.tsx';
import History from './components/History.tsx';
import MoodTracker from './components/MoodTracker.tsx';
import Profile from './components/Profile.tsx';
import Feedback from './components/Feedback.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import ForgotPassword from './components/ForgotPassword.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#BAE6F2]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;