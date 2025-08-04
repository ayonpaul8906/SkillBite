import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuth.jsx';
import Home from './pages/Home'
import  Login  from "./pages/Auth/login";
import  Register  from "./pages/Auth/register";
import Dashboard from './pages/Dashboard';
import AIGuide from './pages/AIGuide';


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
      </Routes>
    {/* </Router> */}
    </AuthProvider>
    </>
  )
}

export default App
