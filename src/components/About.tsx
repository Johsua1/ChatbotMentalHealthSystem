import { Link } from 'react-router-dom';
import { Brain, Heart, Shield, BookOpen } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Johsua Nambio',
      role: 'Project Manager/Programmer',
      isLead: true,
      image: 'img/1.jpg'
    },
    {
      name: 'Michael Anjao Jr.',
      role: 'Programmer/Database Designer',
      isLead: true,
      image: 'img/2.jpg'
    },
    {
      name: 'Rico Aliah Samantha',
      role: 'Spokesperson/Documentation',
      isLead: false,
      image: 'img/3.jpg'
    },
    {
      name: 'N/A',
      role: 'Secret Weapon #1',
      isLead: false,
      image: '4.png'
    },
    {
      name: 'N/A',
      role: 'Secret Weapon #2',
      isLead: false,
      image: '5.png'
    },
    {
      name: 'N/A',
      role: 'Secret Weapon #3',
      isLead: false,
      image: '6.png'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-[#7CC5E3] rounded-3xl p-12">
        <h1 className="text-4xl font-bold text-white mb-8">
          Welcome to SAM1 — your personal mental wellness companion
        </h1>
        
        <p className="text-white/90 text-lg mb-12">
          SAM1 is designed to provide accessible and personalized psychological support, 
          offering a safe space for users to express their thoughts and emotions. Using 
          advanced AI and natural language processing, SAM1 engages in empathetic 
          conversations to help you manage stress, track your mood, and access helpful 
          mental health resources.
        </p>

        <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
        <p className="text-white/90 text-lg mb-12">
          At SAM1, we believe that mental health support should be available to everyone. 
          Our goal is to bridge the gap between individuals and mental health resources 
          by offering an easy-to-use platform that provides immediate support.
        </p>

        <h2 className="text-2xl font-bold text-white mb-6">Our Team</h2>
        <div className="bg-white/10 p-8 rounded-xl mb-12">
          <div className="flex flex-col items-center">
            {/* Top Level - Team Leads */}
            <div className="flex justify-center gap-20 mb-12">
              {teamMembers.filter(member => member.isLead).map((leader, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <img 
                      src={leader.image} 
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white font-semibold text-center">{leader.name}</h3>
                  <p className="text-white/80 text-sm text-center">{leader.role}</p>
                </div>
              ))}
            </div>

            {/* Connecting Lines */}
            <div className="w-px h-12 bg-white/30 mb-4"></div>
            <div className="w-3/4 h-px bg-white/30 mb-8"></div>

            {/* Bottom Level - Team Members */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {teamMembers.filter(member => !member.isLead).map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white/70 font-semibold text-center">{member.name}</h3>
                  <p className="text-white/60 text-sm text-center">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">How SAM1 Can Help You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Mood Tracking</h3>
            </div>
            <p className="text-white/90">
              Keep track of your emotional well-being over time with our intuitive mood tracking system.
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-white" />
              <h3 className="text-xl font-semibold text-white">CBT Exercises</h3>
            </div>
            <p className="text-white/90">
              Engage in evidence-based Cognitive Behavioral Therapy techniques to manage stress and negative thoughts.
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Crisis Support</h3>
            </div>
            <p className="text-white/90">
              Access immediate resources and guidance during difficult times.
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Psychoeducation</h3>
            </div>
            <p className="text-white/90">
              Learn about mental health topics through tailored information and insights.
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
          <p className="text-white/90 text-lg">
            While SAM1 is not a replacement for professional mental health care, it serves
            as a valuable first step in understanding and managing your mental health. If
            you ever feel the need for further support, SAM1 will provide guidance on how
            to seek professional help.
          </p>
        </div>

        <div className="text-center">
          <p className="text-white/90 text-lg mb-6">
            Take the first step towards better mental health today.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Chat with SAM1 and discover the support you deserve
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;