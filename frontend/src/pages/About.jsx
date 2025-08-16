import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Eye,
  Target,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { signOut } from 'firebase/auth';

const About = ({ handleNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const teamVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  const teamMembers = [
    {
      name: 'Ayon Paul',
      title: 'Frontend Developer',
    //   bio: 'Jane is a visionary leader with over a decade of experience in EdTech. She is passionate about creating accessible and engaging learning experiences for everyone.',
      image: 'https://placehold.co/400x400/A78BFA/ffffff?text=Jane',
      socials: {
        linkedin: 'https://www.linkedin.com/in/ayon2407s/',
        github: 'https://twitter.com/',
      },
    },
    {
      name: 'Arnab Ghosh',
      title: 'Backend Developer',
    //   bio: 'John is an AI and machine learning expert, dedicated to using technology to personalize education. He leads our technical team in developing cutting-edge learning tools.',
      image: 'https://placehold.co/400x400/A78BFA/ffffff?text=John',
      socials: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/',
      },
    },
    {
      name: 'Alolika Gupta',
      title: 'Cloud Engineer',
    //   bio: 'Emily is a master storyteller and curriculum developer. She ensures that every bite-sized lesson is both informative and enjoyable, making learning stick.',
      image: 'https://placehold.co/400x400/A78BFA/ffffff?text=Emily',
      socials: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/',
      },
    },
     {
      name: 'Anshu Kashyap',
      title: 'Cloud Engineer',
    //   bio: 'Emily is a master storyteller and curriculum developer. She ensures that every bite-sized lesson is both informative and enjoyable, making learning stick.',
      image: 'https://placehold.co/400x400/A78BFA/ffffff?text=Emily',
      socials: {
        linkedin: 'https://linkedin.com/',
        twitter: 'https://twitter.com/',
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800 relative overflow-x-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-600"
          >
            <path
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 12L2 7M12 12L22 7M12 12V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M7 9L12 12L17 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-2xl font-bold text-indigo-700">SkillBite</h1>
        </div>

        <nav className="hidden sm:flex gap-6 text-indigo-700 font-medium">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-indigo-500 transition duration-200"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/about')}
            className="hover:text-indigo-500 transition duration-200"
          >
            About
          </button>
          <button
            onClick={() => navigate('/guide')}
            className="hover:text-indigo-500 transition duration-200"
          >
            AI Guide
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="hover:text-indigo-500 transition duration-200"
          >
            Courses
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => handleNavigate('login')}
            className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 shadow-md"
          >
            <LogOut size={16} /> Logout
          </Button>
          <button
            className="sm:hidden text-gray-700 hover:text-indigo-600 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-0 bg-white/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-8 sm:hidden"
        >
          <a
            href="/dashboard"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="/about"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <a
            href="/guide"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            AI Guide
          </a >
          <a
            href="/courses"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Courses
          </a>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.section
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              We're dedicated to your growth.
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
              At SkillBite, we believe that learning should be a continuous,
              enjoyable, and personalized journey. We are on a mission to
              democratize access to high-quality education.
            </p>
          </motion.section>

          {/* Mission & Vision Section */}
          <motion.section
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-200">
              <div className="flex items-center text-indigo-600 mb-4">
                <Target size={40} className="mr-4" />
                <h3 className="text-3xl font-bold">Our Mission</h3>
              </div>
              <p className="text-lg text-slate-600">
                To empower professionals and students to efficiently identify
                and fill skill gaps, fostering continuous growth in
                fast-evolving fields through bite-sized, actionable content.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-200">
              <div className="flex items-center text-purple-600 mb-4">
                <Eye size={40} className="mr-4" />
                <h3 className="text-3xl font-bold">Our Vision</h3>
              </div>
              <p className="text-lg text-slate-600">
                To be the leading platform for personalized micro-learning,
                where every user can easily access the knowledge they need to
                achieve their career aspirations, anytime, anywhere.
              </p>
            </div>
          </motion.section>

          {/* Meet the Team Section */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-16 border border-gray-100"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
              Meet the Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200"
                  custom={index}
                  variants={teamVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mb-4 border-4 border-indigo-300"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4">
                    {member.title}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    {member.bio}
                  </p>
                  <div className="flex gap-4">
                    <a
                      href={member.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-indigo-600 transition"
                    >
                      <Linkedin size={24} />
                    </a>
                    <a
                      href={member.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-indigo-600 transition"
                    >
                      <Github size={24} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-700 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <p className="mb-4 sm:mb-0 text-sm">
            &copy; {new Date().getFullYear()} SkillBite. Empowering
            microlearning.
          </p>
          <div className="flex gap-6 mt-2 sm:mt-0">
            <a
              href="/about"
              className="hover:text-gray-900 transition duration-300 text-sm"
            >
              About Us
            </a>
            <a
              href="/contact"
              className="hover:text-gray-900 transition duration-300 text-sm"
            >
              Contact
            </a>
            <a
              href="https://github.com/your-skillbite-project"
              className="hover:text-gray-900 transition duration-300 text-sm"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
