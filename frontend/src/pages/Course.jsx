import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Zap,
  Lightbulb,
  ChevronRight,
  ChevronsRight,
  X,
  Menu,
  LogOut,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { signOut } from 'firebase/auth';
import { useAuth } from "../hooks/useAuth.jsx";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

const getYouTubeThumbnail = (url) => {
  const videoIdMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/|embed\/))([\w-]{11})/
  );
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
  }
  return null;
};

// Function to get the embed URL for YouTube videos
const getYouTubeEmbedUrl = (url) => {
  const videoIdMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/|embed\/))([\w-]{11})/
  );
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  return url;
};

const CourseViewer = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State for data, loading, and the floating modal
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Fetches user-specific courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.recommendations && userData.recommendations.resources) {
            const coursesWithThumbnails =
              userData.recommendations.resources.map((resource) => {
                const youtubeThumbnail = getYouTubeThumbnail(resource.link);
                return {
                  ...resource,
                  imageUrl:
                    youtubeThumbnail ||
                    `https://placehold.co/400x200/5B21B6/ffffff?text=${encodeURIComponent(
                      resource.title.replace(/\s/g, "_")
                    )}`,
                };
              });
            setCourses(coursesWithThumbnails);
          } else {
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses from Firestore:", error);
        setErrorMessage(
          "Failed to fetch courses from Firebase. Please check your connection or try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  // Handles opening the floating modal
  const openModal = (url) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    setCurrentUrl(embedUrl);
    setModalOpen(true);
  };

  // Handles closing the modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentUrl("");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: { scale: 1.05, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const slideInFromTop = {
    initial: { y: "-100vh", opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-lg text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

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
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-0 bg-white/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-8 sm:hidden"
        >
          <a
            href="#home"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="#features"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#how-it-works"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            AI Guide
          </a>
          <a
            href="#contact"
            className="text-3xl text-gray-800 hover:text-indigo-600 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Courses
          </a>
        </motion.div>
      )}

      {/* Main content container */}
      <main className="flex-1 px-6 md:px-12 py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Your Personalized Learning Path
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Explore the bite-sized courses recommended by your AI guide and
              start your journey to skill mastery.
            </p>
          </div>

          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-8 mx-auto max-w-lg"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{errorMessage}</span>
            </div>
          )}

          {courses && courses.length > 0 ? (
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Recommended Courses
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover="hover"
                    onClick={() => openModal(course.link)}
                    className="relative flex-none w-80 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden cursor-pointer flex flex-col group"
                  >
                    <div className="relative z-10">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-40 object-cover shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                      {course.imageUrl.includes("youtube.com") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300">
                          <PlayCircle className="text-white w-16 h-16 opacity-80" />
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {course.title}
                        </h3>
                      </div>
                      <Button className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                        Watch Now <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                No Courses Found
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                It looks like you haven't generated a learning path yet.
              </p>
              <Button
                onClick={() => navigate("/guide")}
                className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              >
                Go to AI Guide <ChevronsRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Floating Video Modal */}
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-[100]"
        >
          <motion.div className="relative w-[90vw] h-[90vh] bg-white rounded-xl shadow-2xl p-4 md:p-6">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 md:-top-12 md:right-0 text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors duration-200 z-50"
            >
              <X size={28} />
            </button>
            <iframe
              src={currentUrl}
              title="Course Resource"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseViewer;
