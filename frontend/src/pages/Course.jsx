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
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
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

    // All user courses
    const [allCourses, setAllCourses] = useState([]);
    // Selected course id (Firestore doc id)
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Resource navigation within selected course
    const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
    const [completedResources, setCompletedResources] = useState({});
    const [videoProgress, setVideoProgress] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch all courses for the user
    useEffect(() => {
        const fetchAllCourses = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const coursesCol = collection(db, "users", user.uid, "courses");
                const snapshot = await getDocs(coursesCol);

                if (snapshot.empty) {
                console.log("No courses found for user"); // Debug log
                setAllCourses([]);
                setIsLoading(false);
                return;
            }

                const courseDocs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllCourses(courseDocs);

                // Select the first course by default
                if (courseDocs.length > 0) {
                    setSelectedCourseId(courseDocs[0].id);
                }
            } catch (error) {
                 console.error("Error fetching courses:", error); // Detailed error logging
            setErrorMessage(`Failed to fetch courses: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchAllCourses();
    }, [user]);

    // Reset resource index and completion state when course changes
    useEffect(() => {
        setCurrentResourceIndex(0);
        setCompletedResources({});
        setVideoProgress({});
    }, [selectedCourseId]);

    // Get selected course and its resources
    const selectedCourse = allCourses.find(c => c.id === selectedCourseId);
    const resources = selectedCourse?.resources || [];
    const currentResource = resources[currentResourceIndex];

    // Track completed resources for the selected course
    useEffect(() => {
        if (!selectedCourse) return;
        const initialCompleted = {};
        (selectedCourse.resources || []).forEach(resource => {
            if (resource.completed) {
                initialCompleted[resource.link] = true;
            }
        });
        setCompletedResources(initialCompleted);
        // Jump to first uncompleted resource
        const firstUncompletedIndex = (selectedCourse.resources || []).findIndex(r => !r.completed);
        setCurrentResourceIndex(firstUncompletedIndex !== -1 ? firstUncompletedIndex : 0);
    }, [selectedCourse]);

    // YouTube API logic (per resource)
    useEffect(() => {
        if (!currentResource) return;
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        window.onYouTubeIframeAPIReady = () => {
            if (currentResource && isYouTubeLink(currentResource.link)) {
                initializeYouTubePlayer();
            }
        };
        if (window.YT && window.YT.Player) {
            if (currentResource && isYouTubeLink(currentResource.link)) {
                initializeYouTubePlayer();
            }
        }
        return () => {
            if (window.youtubePlayer) {
                try {
                    window.youtubePlayer.destroy();
                } catch (e) {}
            }
        };
        // eslint-disable-next-line
    }, [currentResourceIndex, selectedCourseId, resources]);

    const initializeYouTubePlayer = () => {
        if (!currentResource || !window.YT || !window.YT.Player) return;
        try {
            const videoId = getVideoIdFromUrl(currentResource.link);
            if (!videoId) return;
            if (window.youtubePlayer) {
                window.youtubePlayer.destroy();
            }
            window.youtubePlayer = new window.YT.Player(`youtube-player-${currentResourceIndex}`, {
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
                        handleVideoProgress(currentResource.link, progress);
                    }
                } catch (error) {}
            }
        }, 1000);
    };

    const stopProgressTracking = () => {
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
            window.progressInterval = null;
        }
    };

    // Mark resource as completed in Firestore
    const markResourceAsCompleted = async (resourceLink, isCompleted) => {
    if (!user || !selectedCourse) return;

    // Update local state immediately
    const newCompletedResources = {
        ...completedResources,
        [resourceLink]: isCompleted
    };
    setCompletedResources(newCompletedResources);

    // Update resources array with completion status
    const updatedResources = resources.map(r =>
        r.link === resourceLink ? { ...r, completed: isCompleted } : r
    );

    // Update Firestore
    try {
        const courseRef = doc(db, "users", user.uid, "courses", selectedCourse.id);
        
        // Update document with new resources array
        await updateDoc(courseRef, {
            resources: updatedResources,
            completed: updatedResources.every(r => r.completed || newCompletedResources[r.link])
        });

        // Update allCourses state to reflect changes
        setAllCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === selectedCourse.id
                    ? { ...course, resources: updatedResources }
                    : course
            )
        );
    } catch (error) {
        console.error('Error updating completion status:', error);
        // Revert local state if Firestore update fails
        setCompletedResources(prev => ({ ...prev, [resourceLink]: !isCompleted }));
        setErrorMessage("Failed to save progress. Please try again.");
    }
};

    // Handle iframe load: mark as completed only for non-video content
    const handleContentLoad = () => {
    if (resources.length > 0) {
        const current = resources[currentResourceIndex];
        if (current && !completedResources[current.link] && !isYouTubeLink(current.link)) {
            markResourceAsCompleted(current.link, true);
        }
    }
};

    // Handle YouTube video completion tracking
    const handleVideoProgress = (resourceLink, progress) => {
    setVideoProgress(prev => ({ ...prev, [resourceLink]: progress }));
    
    // Mark as completed if progress is >= 90% and not already completed
    if (progress >= 0.9 && !completedResources[resourceLink]) {
        markResourceAsCompleted(resourceLink, true);
    }
};

    // Handle external link opening
    const handleExternalLinkOpen = (url, title) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        if (resources.length > 0) {
            const current = resources[currentResourceIndex];
            if (current && !completedResources[current.link] && !isYouTubeLink(current.link)) {
                markResourceAsCompleted(current.link, true);
            }
        }
    };

    // Handle navigation to the next resource
    const handleNextResource = () => {
        if (currentResourceIndex < resources.length - 1) {
            setCurrentResourceIndex(prevIndex => prevIndex + 1);
        }
    };

    useEffect(() => {
    if (selectedCourse?.resources) {
        const completed = {};
        selectedCourse.resources.forEach(resource => {
            if (resource.completed) {
                completed[resource.link] = true;
            }
        });
        setCompletedResources(completed);
    }
}, [selectedCourse?.resources]);

    // Handle sidebar item click
    const handleSidebarItemClick = (index) => {
        setCurrentResourceIndex(index);
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

    // Progress calculation
    const completedCount = resources.filter(r => r.completed).length;
    const totalResources = resources.length;
    const allResourcesCompleted = totalResources > 0 && completedCount === totalResources;

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

    // --- UI ---
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 font-inter text-slate-800 relative overflow-x-hidden">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.gif" alt="" className='h-15 w-15'/>
                    <span className="text-3xl font-bold text-indigo-700">SkillBite</span>
                </div>
                <nav className="hidden sm:flex gap-6 text-indigo-700 font-medium">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-500 transition duration-200">Home</button>
                    <button onClick={() => navigate('/about')} className="hover:text-indigo-500 transition duration-200">About</button>
                    <button onClick={() => navigate('/guide')} className="hover:text-indigo-500 transition duration-200">AI Guide</button>
                    <button onClick={() => navigate('/courses')} className="hover:text-indigo-500 transition duration-200">Courses</button>
                </nav>
                <div className="flex items-center gap-4">
                    <Button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 shadow-md">
                        <LogOut size={16} /> Logout
                    </Button>
                    <button className="sm:hidden text-gray-700 hover:text-indigo-600 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
                    <a href="/dashboard" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                    <a href="/about" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                    <a href="/guide" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>AI Guide</a>
                    <a href="/courses" className="text-3xl text-gray-800 hover:text-indigo-600 font-bold" onClick={() => setIsMobileMenuOpen(false)}>Courses</a>
                </motion.div>
            )}

            {/* --- Course Carousel --- */}
            {allCourses.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-6 pt-6">
                    {allCourses.map((course) => (
                        <div
                            key={course.id}
                            className={`min-w-[220px] cursor-pointer rounded-xl shadow-md p-4 transition border-2 ${
                                selectedCourseId === course.id
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-gray-200 bg-white hover:bg-indigo-50"
                            }`}
                            onClick={() => {
                                setSelectedCourseId(course.id);
                                setCurrentResourceIndex(0);
                            }}
                        >
                            <h3 className="text-lg font-bold text-indigo-700 mb-2">{course.course_name || course.goal || "Untitled Course"}</h3>
                            <p className="text-gray-500 text-sm">{course.skills}</p>
                            <div className="mt-2 text-xs text-gray-400">
                                {(course.resources?.filter(r => r.completed).length || 0)} / {(course.resources?.length || 0)} completed
                            </div>
                        </div>
                    ))}
                </div>
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
                            <p>Progress: <span className="font-semibold">{completedCount}/{totalResources} completed</span></p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${totalResources > 0 ? (completedCount / totalResources) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                            {resources.length > 0 ? (
                                resources.map((resource, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleSidebarItemClick(index)}
                                        className={`flex items-center p-3 rounded-lg mb-3 cursor-pointer transition-all duration-200 border-l-4
                                            ${index === currentResourceIndex ? 'bg-indigo-100 border-indigo-500 text-indigo-800 font-semibold shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-700'}`
                                        }
                                    >
                                        <span className="mr-4">
                                            {completedResources[resource.link] ? (
                                                <CheckCircle className="text-green-500 w-5 h-5" />
                                            ) : isYouTubeLink(resource.link) ? (
                                                <Video className="text-red-500 w-5 h-5" />
                                            ) : (
                                                <Globe className="text-blue-500 w-5 h-5" />
                                            )}
                                        </span>
                                        <span className="flex-1 text-sm">{resource.title}</span>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No resources available.</p>
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

                    {currentResource ? (
                        <motion.div
                            key={currentResourceIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex-1 flex flex-col"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                {currentResource.title}
                            </h2>
                            {/* Content Display Area */}
                            <div className="relative w-full overflow-hidden mb-4 flex-1 min-h-[300px] sm:min-h-[450px] md:min-h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                {canBeEmbedded(currentResource.link) ? (
                                    <div className="relative w-full h-full">
                                        <iframe
                                            key={`${currentResource.link}-${currentResourceIndex}`}
                                            src={`${getYouTubeEmbedUrl(currentResource.link)}?enablejsapi=1`}
                                            title={currentResource.title}
                                            className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            onLoad={handleContentLoad}
                                            id={`youtube-player-${currentResourceIndex}`}
                                        />
                                        {/* Video Progress Indicator */}
                                        {videoProgress[currentResource.link] && videoProgress[currentResource.link] > 0 && videoProgress[currentResource.link] < 0.9 && (
                                            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-sm flex items-center">
                                                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                                                Progress: {Math.round(videoProgress[currentResource.link] * 100)}%
                                            </div>
                                        )}
                                        {/* Completion Indicator */}
                                        {completedResources[currentResource.link] && (
                                            <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full text-sm flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Completed!
                                            </div>
                                        )}
                                    </div>
                                ) : (
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
                                            <p className="text-gray-600 text-sm">{currentResource.summary}</p>
                                            {currentResource.duration && (
                                                <p className="text-gray-500 text-xs mt-2">⏱️ Duration: {currentResource.duration}</p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleExternalLinkOpen(currentResource.link, currentResource.title)}
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
                                {allResourcesCompleted ? (
                                    <div className="flex items-center">
                                        <CheckCircle className="w-6 h-6 mr-2 text-green-500"/>
                                        <span className="text-green-600 font-semibold text-lg">
                                            🎉 All content completed! Great job!
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        Progress: {completedCount} of {totalResources} completed
                                    </div>
                                )}
                                {currentResourceIndex < resources.length - 1 && (
                                    <Button
                                        onClick={handleNextResource}
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