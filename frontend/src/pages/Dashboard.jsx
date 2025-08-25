import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  GraduationCap,
  LogOut,
  Briefcase,
  TrendingUp,
  BookOpen,
  Star,
  Award,
  ChevronRight,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth.jsx";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedCareer, setSelectedCareer] = useState(null); // State for modal content
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({
    totalBites: 0,
    completedBites: 0,
    progressPercentage: 0,
  });

  // If auth is loading or no user, redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);

            // Get courses and calculate progress
            const resources = data.recommendations?.resources || [];
            setCourses(resources);

            const totalBites = resources.length;
            const completedBites = resources.filter(
              (resource) => resource.completed
            ).length;
            const progressPercentage =
              totalBites > 0 ? (completedBites / totalBites) * 100 : 0;

            setUserProgress({
              totalBites,
              completedBites,
              progressPercentage,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setFirestoreLoading(false);
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const displayName = userData?.fullName || user?.displayName || "Explorer";
  const avatar =
    user?.photoURL ||
    `https://placehold.co/100x100/A78BFA/ffffff?text=${displayName
      .charAt(0)
      .toUpperCase()}`;

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: { scale: 1.03, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const handleOpenModal = (career) => {
    setSelectedCareer(career);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCareer(null);
  };

  // Display a loading state while fetching data
  if (authLoading || firestoreLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const recommendedCareers = [
    {
      title: "AI & Machine Learning Engineer",
      skills: ["Python", "TensorFlow", "PyTorch", "NLP"],
      icon: <BrainCircuit className="w-8 h-8 text-blue-600" />,
      details: {
        description:
          "Specializes in developing algorithms and models that enable machines to learn from data, make predictions, and automate tasks. This role is at the forefront of technological innovation.",
        responsibilities: [
          "Design and build machine learning systems.",
          "Run machine learning tests and experiments.",
          "Implement appropriate ML algorithms.",
          "Develop ML applications according to requirements.",
        ],
        roadmap: [
          "Master Python and key libraries (NumPy, Pandas).",
          "Learn fundamental ML concepts (supervised, unsupervised learning).",
          "Study deep learning frameworks (TensorFlow, PyTorch).",
          "Gain experience with NLP and computer vision.",
          "Build a portfolio of projects.",
        ],
      },
    },
    {
      title: "Cloud Solutions Architect",
      skills: ["AWS", "Azure", "GCP", "Kubernetes"],
      icon: <Briefcase className="w-8 h-8 text-green-600" />,
      details: {
        description:
          "Designs and manages an organization's cloud computing architecture. They work with stakeholders to ensure the cloud infrastructure meets the business's needs for security, scalability, and performance.",
        responsibilities: [
          "Develop cloud adoption plans.",
          "Evaluate and select cloud technologies.",
          "Oversee cloud migration efforts.",
          "Manage cloud infrastructure and security.",
        ],
        roadmap: [
          "Understand core cloud concepts (IaaS, PaaS, SaaS).",
          "Get certified in a major cloud provider (AWS, Azure, or GCP).",
          "Learn containerization with Docker and Kubernetes.",
          "Gain experience with networking, security, and databases.",
          "Develop a strong understanding of cost management.",
        ],
      },
    },
    {
      title: "Data Scientist",
      skills: ["R", "Python", "SQL", "Statistics"],
      icon: <TrendingUp className="w-8 h-8 text-yellow-600" />,
      details: {
        description:
          "Analyzes and interprets complex data to help organizations make informed decisions. They combine statistics, programming, and business knowledge to uncover insights and solve challenging problems.",
        responsibilities: [
          "Clean and preprocess raw data.",
          "Develop predictive models and machine learning algorithms.",
          "Communicate findings to technical and non-technical teams.",
          "Create data visualizations and dashboards.",
        ],
        roadmap: [
          "Build a strong foundation in statistics and linear algebra.",
          "Learn a programming language like Python or R.",
          "Master SQL for database querying.",
          "Study data visualization tools (Tableau, Power BI).",
          "Practice with real-world datasets and Kaggle competitions.",
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800 relative overflow-x-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.gif" alt="" className="h-15 w-15" />
          <span className="text-3xl font-bold text-indigo-700">SkillBite</span>
        </div>

        <nav className="hidden sm:flex gap-6 text-indigo-700 font-medium">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-indigo-500 transition duration-200"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/about")}
            className="hover:text-indigo-500 transition duration-200"
          >
            About
          </button>
          <button
            onClick={() => navigate("/guide")}
            className="hover:text-indigo-500 transition duration-200"
          >
            AI Guide
          </button>
          <button
            onClick={() => navigate("/courses")}
            className="hover:text-indigo-500 transition duration-200"
          >
            Courses
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"></div>
          <Button
            onClick={handleLogout}
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
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
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
          </a>
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
          {/* Banner Section */}
          <motion.section
            className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 md:p-12 mb-12 shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="absolute inset-0 opacity-10">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="currentColor"
                  opacity="0.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="20"
                  fill="currentColor"
                  opacity="0.5"
                />
                <rect
                  x="10"
                  y="70"
                  width="15"
                  height="15"
                  rx="5"
                  fill="currentColor"
                  opacity="0.5"
                />
                <path
                  d="M50 0 L100 50 L50 100 L0 50 Z"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
                  Hello, {displayName}
                </h2>
                <p className="text-lg md:text-xl opacity-90">
                  Your journey to skill mastery begins here.
                </p>
                {/* User Progress Bar */}
                <div className="mt-6">
                  <p className="text-lg md:text-xl font-semibold opacity-90 mb-4">
                    Ready to learn? Jump back into your course.
                  </p>
                  <Button
                    onClick={() => navigate("/courses")}
                    className="bg-green-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-300 transition-colors flex items-center"
                  >
                    <Zap size={20} className="mr-2" /> Start Learning
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </div>
          </motion.section>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white border border-indigo-200 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/guide")}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <BrainCircuit className="text-indigo-600 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-indigo-800">
                  AI Career Guide
                </h3>
              </div>
              <p className="text-slate-600 text-base mb-4">
                Get personalized career paths by entering your current skills
                and future goals. Our AI Career Guide will generate a role guide
                with learning plans.
              </p>
              <Button className="bg-indigo-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Get Guidance <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white border border-pink-200 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/courses")}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <GraduationCap className="text-pink-600 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-pink-800">
                  Course Viewer
                </h3>
              </div>
              <p className="text-slate-600 text-base mb-4">
                Explore curated bite-sized courses generated from your AI guide.
                Watch, track, and complete lessons easily.
              </p>
              <Button className="bg-pink-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                View Courses <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* About SkillBite Section */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-16 border border-gray-100"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
              About SkillBite: Your Micro-Learning Partner
            </h2>
            <p className="text-lg text-slate-700 text-center mb-6 max-w-3xl mx-auto">
              SkillBite is designed to revolutionize how you learn and grow. We
              leverage advanced AI to deliver personalized, bite-sized learning
              resources that fit seamlessly into your busy life.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
                  <BookOpen className="mr-2" /> Our Mission
                </h3>
                <p className="text-slate-600">
                  To empower professionals and students to efficiently identify
                  and fill skill gaps, fostering continuous growth in
                  fast-evolving fields.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
                  <Star className="mr-2" /> Why Choose Us?
                </h3>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Personalized AI recommendations</li>
                  <li>Bite-sized, actionable content</li>
                  <li>Progress tracking and next steps</li>
                  <li>Adaptable to your schedule</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Recommended Careers Section (with dynamic content in mind) */}
          <motion.section
            className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-8 md:p-10 border border-blue-200"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
              Your Recommended Career Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedCareers.map((career, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-md border border-blue-100 flex flex-col"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{
                    translateY: -5,
                    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="mr-3 p-2 bg-gray-100 rounded-full">
                      {career.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {career.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Key Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full text-indigo-600 border-indigo-300 hover:bg-indigo-50 transition-colors"
                    onClick={() => handleOpenModal(career)} // <-- Updated onClick handler
                  >
                    Learn More <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <motion.button
                className="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 font-semibold text-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/guide")}
              >
                Get Your Personalized Career Path
              </motion.button>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6 md:px-12">
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

      {/* Career Path Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCareer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    {selectedCareer.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {selectedCareer.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  {selectedCareer.details.description}
                </p>

                <div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">
                    Key Responsibilities
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedCareer.details.responsibilities.map(
                      (item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 mt-2 mr-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">
                    Suggested Learning Roadmap
                  </h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedCareer.details.roadmap.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 font-bold text-indigo-500">
                          {index + 1}.
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleCloseModal}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
