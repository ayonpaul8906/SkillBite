import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  BookOpen,
  Lightbulb,
  Zap,
  ChevronRight,
  ChevronsRight,
  Loader2,
  LogOut,
  Menu,
  X,
  Layers, // Added for new animation
  Sparkles, // Added for new animation
  Briefcase, // Icon for Future Scope
  TrendingUp, // Icon for Job Probability
} from "lucide-react";
import { signOut } from 'firebase/auth';
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

const AIGuide = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State for form inputs, loading, and results
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Animation variants
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
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" },
  };

  // API call function with structured response
  const getGeminiRecommendations = async (userPrompt) => {
    // Here we make the API call to your Flask backend
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/recommend`;

    const payload = {
      userId: user.uid,
      skills: userPrompt.skills,
      goal: userPrompt.goal,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API call failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setErrorMessage(error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!user || !skills || !goal) {
      setErrorMessage("Please log in and fill out both fields.");
      return;
    }

    setIsGenerating(true);
    setRecommendations(null);

    const recommendationsData = await getGeminiRecommendations({
      skills,
      goal,
    });

    if (recommendationsData) {
      const resourcesWithIcons = recommendationsData.resources.map(
        (resource) => ({
          ...resource,
          icon:
            resource.icon === "BookOpen" ? (
              <BookOpen />
            ) : resource.icon === "Zap" ? (
              <Zap />
            ) : (
              <Lightbulb />
            ),
        })
      );
      setRecommendations({
        ...recommendationsData,
        resources: resourcesWithIcons,
      });
    }

    setIsGenerating(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (authLoading) {
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

  if (!user) {
    navigate("/");
    return null;
  }

  const displayName = user?.displayName || "Explorer";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800 relative overflow-x-hidden">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.gif" alt="" className='h-15 w-15'/>
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

      {/* Main Content Card */}
      <main className="flex-1 px-6 md:px-12 py-10 flex items-center justify-center">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white rounded-3xl p-8 md:p-16 shadow-2xl border border-gray-100 relative overflow-hidden"
          >
            {/* Floating animated icon */}
            <motion.div
              className="absolute top-1/4 left-1/4 text-indigo-100 opacity-50 z-0"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <Layers size={100} />
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 text-purple-100 opacity-50 z-0"
              animate={{
                y: [0, 20, 0],
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={80} />
            </motion.div>
            <div className="relative z-10 flex flex-col items-center text-center mb-10">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-4 rounded-full mb-4 shadow-lg">
                <BrainCircuit className="text-white w-12 h-12" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                AI-Powered Career Guide
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl">
                Tell us about your skills and goals, and we'll craft a
                personalized micro-learning path just for you.
              </p>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                  className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
                <p className="mt-6 text-lg font-medium text-gray-600">
                  Generating your personalized path...
                </p>
              </div>
            ) : recommendations ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12"
              >
                <motion.div variants={itemVariants}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                    <ChevronsRight className="text-indigo-500 w-8 h-8 mr-2" />
                    Career Summary
                  </h3>
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-lg text-lg text-slate-700 shadow-sm">
                    <p>{recommendations.career_summary}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="text-green-500 w-8 h-8 mr-2" />
                    Future Scope & Job Probability
                  </h3>
                  <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg text-lg text-slate-700 shadow-sm">
                    <p className="mb-2">
                      **Future Scope:** {recommendations.future_scope}
                    </p>
                    <p>
                      **Job Success Probability:**{" "}
                      <span className="font-bold">
                        {recommendations.job_success_probability}
                      </span>
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="text-pink-500 w-8 h-8 mr-2" />
                    Bite-Sized Resources
                  </h3>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid gap-8 md:grid-cols-2"
                  >
                    {recommendations.resources &&
                      recommendations.resources.map((resource, index) => (
                        <motion.a
                          key={index}
                          href={resource.link} // Changed to 'link' to match backend data
                          target="_blank"
                          rel="noopener noreferrer"
                          variants={cardVariants}
                          whileHover="hover"
                          initial="initial"
                          animate="animate"
                          className="bg-white border-2 border-transparent rounded-2xl p-6 shadow-lg flex items-start space-x-4 cursor-pointer hover:border-indigo-400 transition-all duration-300"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-full">
                              {resource.icon}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xl font-semibold text-gray-800">
                              {resource.recommended_next_step}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              Duration: {resource.duration} minutes
                            </p>
                            <div className="mt-4 inline-flex items-center text-indigo-600 font-medium">
                              Start Learning
                              <ChevronRight className="ml-1 w-4 h-4" />
                            </div>
                          </div>
                        </motion.a>
                      ))}
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                  <Button
                    onClick={() => setRecommendations(null)}
                    className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Start Again <Zap className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {errorMessage && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
                    role="alert"
                  >
                    <strong className="font-bold">Oops!</strong>
                    <span className="block sm:inline ml-2">{errorMessage}</span>
                  </div>
                )}
                <motion.div
                  variants={itemVariants}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="skills"
                      className="text-lg font-semibold text-gray-700"
                    >
                      My Current Skills
                    </label>
                    <textarea
                      id="skills"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g., 'I know basic JavaScript, Python fundamentals, and some HTML/CSS.'"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="goal"
                      className="text-lg font-semibold text-gray-700"
                    >
                      My Career Goal
                    </label>
                    <input
                      id="goal"
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g., 'Become a Full-Stack Web Developer.'"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate My AI Guide 
                  </motion.button>
                </motion.div>
              </form>
            )}
          </motion.div>
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
              className="hover:text-white transition duration-300 text-sm"
            >
              About Us
            </a>
            <a
              href="/contact"
              className="hover:text-white transition duration-300 text-sm"
            >
              Contact
            </a>
            <a
              href="https://github.com/your-skillbite-project"
              className="hover:text-white transition duration-300 text-sm"
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

export default AIGuide;
