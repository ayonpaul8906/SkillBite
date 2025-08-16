import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Zap,
    Lightbulb,
    ChevronRight,
    ChevronsRight,
    X,
    Loader2,
    LogOut,
    PlayCircle,
    CheckCircle,
    ArrowRightCircle,
    Video,
    Menu,
    ExternalLink,
    Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { signOut } from 'firebase/auth';

// Helper to check if a URL is a YouTube link
const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+$/.test(url);
};

// Helper to get YouTube embed URL
const getYouTubeEmbedUrl = (url) => {
    if (!isYouTubeLink(url)) return url;

    try {
        const parsedUrl = new URL(url);
        let videoId = "";

        if (parsedUrl.hostname === "youtu.be") {
            videoId = parsedUrl.pathname.slice(1);
        } else if (
            parsedUrl.hostname.includes("youtube.com") ||
            parsedUrl.hostname.includes("m.youtube.com")
        ) {
            if (parsedUrl.pathname === "/watch") {
                videoId = parsedUrl.searchParams.get("v");
            } else if (parsedUrl.pathname.startsWith("/embed/")) {
                videoId = parsedUrl.pathname.split("/embed/")[1];
            } else if (parsedUrl.pathname.startsWith("/v/")) {
                videoId = parsedUrl.pathname.split("/v/")[1];
            }
        }

        if (videoId && videoId.length === 11) {
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return url;
    } catch (e) {
        console.error("Invalid YouTube URL:", url);
        return url;
    }
};

// Helper to check if URL can be embedded (only YouTube for now)
const canBeEmbedded = (url) => {
    return isYouTubeLink(url);
};

const CourseViewer = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
    const [completedResources, setCompletedResources] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [videoProgress, setVideoProgress] = useState({});

useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
        // Check if we have courses and valid current course
        const currentCourse = courses[currentCourseIndex];
        if (currentCourse && isYouTubeLink(currentCourse.link)) {
            initializeYouTubePlayer();
        }
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
        const currentCourse = courses[currentCourseIndex];
        if (currentCourse && isYouTubeLink(currentCourse.link)) {
            initializeYouTubePlayer();
        }
    }

    return () => {
        // Cleanup
        if (window.youtubePlayer) {
            try {
                window.youtubePlayer.destroy();
            } catch (e) {
                console.log('Error destroying YouTube player:', e);
            }
        }
    };
}, [currentCourseIndex, courses]);

    const initializeYouTubePlayer = () => {
        if (!currentCourse || !window.YT || !window.YT.Player) return;

        try {
            const videoId = getVideoIdFromUrl(currentCourse.link);
            if (!videoId) return;

            // Destroy existing player
            if (window.youtubePlayer) {
                window.youtubePlayer.destroy();
            }

            // Create new player
            window.youtubePlayer = new window.YT.Player(`youtube-player-${currentCourseIndex}`, {
                events: {
                    onStateChange: onPlayerStateChange,
                },
            });
        } catch (error) {
            console.error('Error initializing YouTube player:', error);
        }
    };

    const getVideoIdFromUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname === "youtu.be") {
                return parsedUrl.pathname.slice(1);
            } else if (parsedUrl.hostname.includes("youtube.com")) {
                return parsedUrl.searchParams.get("v");
            }
        } catch (e) {
            console.error("Error parsing video ID:", e);
        }
        return null;
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            startProgressTracking();
        } else {
            stopProgressTracking();
        }
    };

    const startProgressTracking = () => {
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
        }

        window.progressInterval = setInterval(() => {
            if (window.youtubePlayer && typeof window.youtubePlayer.getCurrentTime === 'function') {
                try {
                    const currentTime = window.youtubePlayer.getCurrentTime();
                    const duration = window.youtubePlayer.getDuration();
                    
                    if (duration > 0) {
                        const progress = currentTime / duration;
                        handleVideoProgress(currentCourse.link, progress);
                    }
                } catch (error) {
                    console.log('Error tracking progress:', error);
                }
            }
        }, 1000); // Update every second
    };

    const stopProgressTracking = () => {
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
            window.progressInterval = null;
        }
    };

    // Fetch user-specific courses and their completion status from Firestore
    useEffect(() => {
        const fetchCoursesAndProgress = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const recommendations = userData.recommendations || {};
                    const resources = recommendations.resources || [];

                    const processedCourses = resources.map(resource => ({
                        ...resource,
                        completed: resource.completed || false,
                    }));
                    setCourses(processedCourses);

                    const initialCompleted = {};
                    processedCourses.forEach(course => {
                        if (course.completed) {
                            initialCompleted[course.link] = true;
                        }
                    });
                    setCompletedResources(initialCompleted);

                    const firstUncompletedIndex = processedCourses.findIndex(course => !course.completed);
                    setCurrentCourseIndex(firstUncompletedIndex !== -1 ? firstUncompletedIndex : 0);

                } else {
                    setCourses([]);
                }
            } catch (error) {
                console.error("Error fetching courses from Firestore:", error);
                setErrorMessage("Failed to fetch courses. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchCoursesAndProgress();
        }
    }, [user]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (window.progressInterval) {
                clearInterval(window.progressInterval);
            }
            if (window.youtubePlayer) {
                try {
                    window.youtubePlayer.destroy();
                } catch (e) {
                    console.log('Cleanup error:', e);
                }
            }
        };
    }, []);

    // Function to update course completion status in Firestore
    const markCourseAsCompleted = async (courseLink, isCompleted) => {
        if (!user || !courses.length) return;

        // Optimistically update UI
        setCompletedResources(prev => ({ ...prev, [courseLink]: isCompleted }));
        const updatedCourses = courses.map(c => c.link === courseLink ? { ...c, completed: isCompleted } : c);
        setCourses(updatedCourses);

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentRecommendations = userSnap.data().recommendations || {};
                const currentResources = currentRecommendations.resources || [];
                
                const updatedFirestoreResources = currentResources.map(resource =>
                    resource.link === courseLink ? { ...resource, completed: isCompleted } : resource
                );

                await updateDoc(userRef, {
                    'recommendations.resources': updatedFirestoreResources
                });
            }
        } catch (error) {
            console.error("Error updating course completion in Firestore:", error);
            setErrorMessage("Failed to save progress. Please try again.");
            // Revert UI on failure
            setCompletedResources(prev => ({ ...prev, [courseLink]: !isCompleted }));
            const revertedCourses = courses.map(c => c.link === courseLink ? { ...c, completed: !isCompleted } : c);
            setCourses(revertedCourses);
        }
    };

    // Handle iframe load: mark as completed only for non-video content
    const handleContentLoad = () => {
        if (courses.length > 0) {
            const currentCourse = courses[currentCourseIndex];
            // Only auto-complete non-YouTube content
            if (currentCourse && !completedResources[currentCourse.link] && !isYouTubeLink(currentCourse.link)) {
                markCourseAsCompleted(currentCourse.link, true);
            }
        }
    };

    // Handle YouTube video completion tracking
    const handleVideoProgress = (courseLink, progress) => {
        setVideoProgress(prev => ({ ...prev, [courseLink]: progress }));
        
        // Mark as completed if user watched 90% or more of the video
        if (progress >= 0.9 && !completedResources[courseLink]) {
            markCourseAsCompleted(courseLink, true);
        }
    };

    // Handle external link opening
    const handleExternalLinkOpen = (url, title) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        // Mark as completed when opened for non-YouTube links
        if (courses.length > 0) {
            const currentCourse = courses[currentCourseIndex];
            if (currentCourse && !completedResources[currentCourse.link] && !isYouTubeLink(currentCourse.link)) {
                markCourseAsCompleted(currentCourse.link, true);
            }
        }
    };

    // Handle navigation to the next course
    const handleNextCourse = () => {
        if (currentCourseIndex < courses.length - 1) {
            setCurrentCourseIndex(prevIndex => prevIndex + 1);
        }
    };
    
    // Handle sidebar item click
    const handleSidebarItemClick = (index) => {
        setCurrentCourseIndex(index);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate('/');
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };

    // Calculate completion count
    const completedCount = Object.values(completedResources).filter(Boolean).length;
    const totalCourses = courses.length;
    const allCoursesCompleted = totalCourses > 0 && completedCount === totalCourses;

    // Loading State
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                    className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
                <p className="mt-4 text-lg text-gray-600">Loading your learning path...</p>
            </div>
        );
    }

    // Redirect if not logged in
    if (!user) {
        navigate("/");
        return null;
    }

    const currentCourse = courses[currentCourseIndex];
    const isCurrentCourseEmbeddable = currentCourse && canBeEmbedded(currentCourse.link);

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

        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-20">
                 <h1 className="text-xl font-bold text-indigo-600">SkillBite</h1>
                 <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="ghost" size="icon">
                     <Menu className="w-6 h-6" />
                 </Button>
            </header>
            
            {/* Sidebar */}
            <AnimatePresence>
            {(sidebarOpen || window.innerWidth >= 768) && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    className="fixed md:static top-0 left-0 h-full w-72 md:w-1/4 md:max-w-xs bg-white shadow-lg p-6 flex flex-col z-30 md:z-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Your Path</h3>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800">
                            <X size={24}/>
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-6">
                        <p>Progress: <span className="font-semibold">{completedCount}/{totalCourses} completed</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                        {courses.length > 0 ? (
                            courses.map((course, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSidebarItemClick(index)}
                                    className={`flex items-center p-3 rounded-lg mb-3 cursor-pointer transition-all duration-200 border-l-4
                                        ${index === currentCourseIndex ? 'bg-indigo-100 border-indigo-500 text-indigo-800 font-semibold shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-700'}`
                                    }
                                >
                                    <span className="mr-4">
                                        {completedResources[course.link] ? (
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                        ) : isYouTubeLink(course.link) ? (
                                            <Video className="text-red-500 w-5 h-5" />
                                        ) : (
                                            <Globe className="text-blue-500 w-5 h-5" />
                                        )}
                                    </span>
                                    <span className="flex-1 text-sm">{course.title}</span>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No courses available.</p>
                        )}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col">
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{errorMessage}</span>
                    </div>
                )}

                {currentCourse ? (
                    <motion.div
                        key={currentCourseIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex-1 flex flex-col"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {currentCourse.title}
                        </h2>

                        {/* Content Display Area */}
                        <div className="relative w-full overflow-hidden mb-4 flex-1 min-h-[300px] sm:min-h-[450px] md:min-h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                           {isCurrentCourseEmbeddable ? (
                               // Embeddable content (YouTube)
                               <div className="relative w-full h-full">
                                   <iframe
                                       key={`${currentCourse.link}-${currentCourseIndex}`}
                                       src={`${getYouTubeEmbedUrl(currentCourse.link)}?enablejsapi=1`}
                                       title={currentCourse.title}
                                       className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                       allowFullScreen
                                       onLoad={handleContentLoad}
                                       id={`youtube-player-${currentCourseIndex}`}
                                   />
                                   {/* Video Progress Indicator */}
                                   {videoProgress[currentCourse.link] && videoProgress[currentCourse.link] > 0 && videoProgress[currentCourse.link] < 0.9 && (
                                       <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-sm flex items-center">
                                           <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                                           Progress: {Math.round(videoProgress[currentCourse.link] * 100)}%
                                       </div>
                                   )}
                                   {/* Completion Indicator */}
                                   {completedResources[currentCourse.link] && (
                                       <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full text-sm flex items-center">
                                           <CheckCircle className="w-4 h-4 mr-1" />
                                           Completed!
                                       </div>
                                   )}
                               </div>
                           ) : (
                               // Non-embeddable content (Articles, other websites)
                               <div className="text-center p-8 max-w-lg">
                                   <div className="mb-6">
                                       <Globe className="w-20 h-20 text-indigo-400 mx-auto mb-4" />
                                       <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                           External Learning Resource
                                       </h3>
                                       <p className="text-gray-600 mb-6">
                                           This content will open in a new tab for the best learning experience.
                                       </p>
                                   </div>
                                   
                                   <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                       <h4 className="font-semibold text-gray-800 mb-2">What you'll learn:</h4>
                                       <p className="text-gray-600 text-sm">{currentCourse.summary}</p>
                                       {currentCourse.duration && (
                                           <p className="text-gray-500 text-xs mt-2">⏱️ Duration: {currentCourse.duration}</p>
                                       )}
                                   </div>

                                   <Button
                                       onClick={() => handleExternalLinkOpen(currentCourse.link, currentCourse.title)}
                                       className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto text-lg"
                                   >
                                       Open Learning Resource
                                       <ExternalLink className="ml-3 w-5 h-5" />
                                   </Button>
                                   
                                   <p className="text-xs text-gray-500 mt-4">
                                       Click the button above to start learning. The resource will be marked as completed when opened.
                                   </p>
                               </div>
                           )}
                        </div>

                        {/* Bottom Navigation */}
                        <div className="flex justify-between items-center mt-auto pt-4">
                             {allCoursesCompleted ? (
                                 <div className="flex items-center">
                                     <CheckCircle className="w-6 h-6 mr-2 text-green-500"/>
                                     <span className="text-green-600 font-semibold text-lg">
                                         🎉 All content completed! Great job!
                                     </span>
                                 </div>
                             ) : (
                                 <div className="text-sm text-gray-500">
                                     Progress: {completedCount} of {totalCourses} completed
                                 </div>
                             )}
                            
                            {currentCourseIndex < courses.length - 1 && (
                                <Button
                                    onClick={handleNextCourse}
                                    className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center ml-auto"
                                >
                                    Next Content <ArrowRightCircle className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-lg">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Learning Path Found</h3>
                            <p className="text-lg text-slate-600 mb-6">
                                It looks like you haven't generated a personalized learning path yet.
                            </p>
                            <Button onClick={() => navigate("/guide")} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                                Go to AI Guide <ChevronsRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    
                )}
            </main>
        </div>
    </div>
    );
};

export default CourseViewer;