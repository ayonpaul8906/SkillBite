import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from "react-router-dom";
import { Rocket, Brain, TrendingUp, Sparkles, Menu, X, Lightbulb, Zap, CheckCircle } from 'lucide-react'; // Added more icons for flexibility

// Main App component
const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);
  const navigate = useNavigate();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);

    // Sticky navbar logic
    const handleScroll = () => {
      if (window.scrollY > 50) { // Adjust threshold as needed
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Framer Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen text-slate-800 font-inter relative overflow-x-hidden">
      {/* Header/Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`flex items-center justify-between px-6 md:px-12 py-4 h-20 z-50 transition-all duration-300 ${
          isSticky ? 'fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg rounded-b-xl' : 'relative bg-white/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.gif" alt="" className='h-15 w-15'/>
          <span className="text-3xl font-bold text-indigo-700">SkillBite</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#home" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 relative group">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 relative group">
            How it Works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition duration-300 relative group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* Sign Up Button */}
        <div className="hidden md:block">
          <motion.a
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 font-semibold"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/register" > Register</Link>
            
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-indigo-600 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 bg-white/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
        >
          <a href="#home" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#features" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
          <a href="#contact" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          <motion.a
            className="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 font-semibold text-xl mt-8"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link to="/register"> Sign Up </Link>
          </motion.a>
        </motion.div>
      )}

      <main>
        {/* Hero Section */}
        <section id="home" className="relative text-center py-20 md:py-32 px-4 md:px-8 overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          ></motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 12, delay: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          ></motion.div>

          <motion.div
            className="max-w-6xl mx-auto relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-block px-6 py-3 bg-indigo-100 text-indigo-700 font-medium rounded-full text-sm mb-4 shadow-sm animate-pulse">
              <Sparkles className="inline-block w-4 h-4 mr-2" /> Learn Smarter, Not Harder
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 mb-6"
            >
              Unlock Your Potential with SkillBite
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10"
            >
              An AI-powered micro-learning companion to guide your upskilling journey, personalized just for you.
            </motion.p>

            <motion.a
              className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full shadow-xl hover:bg-indigo-700 transition duration-300 font-semibold text-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link to="/register"> Start Your Journey </Link>
            </motion.a>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-20 px-4 md:px-8 rounded-t-3xl shadow-inner mt-[-20px] relative z-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              Features Designed for Your Growth
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Lightbulb className="w-12 h-12 text-indigo-500" />,
                  title: "AI-Powered Paths",
                  desc: "Leverage Google's Gemini to build your personalized skill plan in seconds.",
                },
                {
                  icon: <Zap className="w-12 h-12 text-pink-500" />,
                  title: "Micro-Learning Focus",
                  desc: "Get 5-minute tutorials, articles, and videos for rapid real-world knowledge.",
                },
                {
                  icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                  title: "Visual Progress",
                  desc: "See your journey through progress bars, milestones, and intelligent insights.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center border border-indigo-100"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="mb-6 bg-indigo-50 p-4 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 md:px-8 bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              Your Path to Mastery: How SkillBite Works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector Lines for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-indigo-200 transform -translate-y-1/2 z-0"></div>
              <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-1 bg-indigo-200 transform -translate-y-1/2 z-0"></div>
              <div className="hidden md:block absolute top-1/2 left-2/3 w-1/3 h-1 bg-indigo-200 transform -translate-y-1/2 z-0"></div>

              {[
                {
                  step: 1,
                  title: "Define Your Goals",
                  desc: "Input your current skills, career aspirations, and what you want to learn.",
                  icon: <Brain className="w-10 h-10 text-white" />,
                },
                {
                  step: 2,
                  title: "Get AI-Curated Bites",
                  desc: "Our Gemini AI instantly generates personalized, bite-sized learning resources.",
                  icon: <Rocket className="w-10 h-10 text-white" />,
                },
                {
                  step: 3,
                  title: "Learn & Track Progress",
                  desc: "Engage with content, complete challenges, and watch your skills grow.",
                  icon: <TrendingUp className="w-10 h-10 text-white" />,
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="relative z-10 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center border border-purple-100"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: i * 0.2 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-full text-2xl font-bold mb-6 shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 px-4 md:px-8 bg-indigo-700 text-white text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of learners who are rapidly closing their skill gaps with personalized, AI-driven micro-lessons.
            </p>
            <motion.a
              className="inline-block bg-white text-indigo-700 px-12 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition duration-300 font-bold text-xl"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link to="/register"> Get Started Free </Link>
            </motion.a>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12 px-6 md:px-12">
        <div className="container mx-auto text-center md:flex md:justify-between md:items-center">
          <p className="mb-4 md:mb-0 text-sm">&copy; {new Date().getFullYear()} SkillBite. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-white transition duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-white transition duration-300">Terms of Service</a>
            <a href="#" className="hover:text-white transition duration-300">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
