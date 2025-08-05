import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuth.jsx';
import Home from './pages/Home'
import  Login  from "./pages/Auth/login";
import  Register  from "./pages/Auth/register";
import Dashboard from './pages/Dashboard';
import AIGuide from './pages/AIGuide';
import About from './pages/About';
import Course from './pages/Course';


function App() {


  return (
    <>
     <AuthProvider>
      {/* <Router> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guide" element={<AIGuide />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Course />} />
      </Routes>
    {/* </Router> */}
    </AuthProvider>
    </>
  )
}

export default App
