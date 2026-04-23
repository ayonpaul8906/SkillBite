// register.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Google sign up successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 relative">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-50/50 blur-3xl" />
        <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-cream-50 blur-3xl opacity-40" style={{ backgroundColor: '#fffcf0' }} />
      </div>

      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 w-full max-w-md text-slate-800"
      >
        <h2 className="text-3xl font-semibold mb-2 text-center text-slate-800">Create Account</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Join us and start your journey</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-600 ml-1">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="example@mail.com"
              className="w-full px-4 py-3 mt-1 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 ml-1">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-300"
                required
              />
              <div
                className="absolute right-4 top-3.5 cursor-pointer text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 shadow-md shadow-blue-100 transition-all active:scale-[0.98]"
          >
            Create Account
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-300 text-xs uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-600"
          >
            <FcGoogle className="text-xl" /> Sign up with Google
          </button>

          <p className="text-sm mt-6 text-center text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-600 underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
