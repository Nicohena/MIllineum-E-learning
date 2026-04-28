import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, Lock, LogIn,
  Eye, EyeOff, Sparkles, ArrowRight, 
  Shield, Users, BookOpen, CheckCircle,
  Fingerprint
} from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Load saved login identifier if "Remember Me" was checked
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('rememberedLoginIdentifier') || localStorage.getItem('rememberedEmail');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Enhanced validation
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await login(identifier, password);

      if (rememberMe) {
        localStorage.setItem('rememberedLoginIdentifier', identifier);
        localStorage.removeItem('rememberedEmail');
      } else {
        localStorage.removeItem('rememberedLoginIdentifier');
        localStorage.removeItem('rememberedEmail');
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid login ID or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { icon: Users, value: "5,000+", label: "Active Students" },
    { icon: BookOpen, value: "150+", label: "Expert Courses" },
    { icon: Shield, value: "99.9%", label: "Uptime Guarantee" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="max-w-5xl w-full relative z-10 animate-fadeInUp">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 hover:shadow-3xl transition-all duration-500">
          
          {/* Left Side - Premium Branding Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 text-white flex flex-col justify-between relative overflow-hidden group">
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Floating Particles */}
            <div className="absolute top-20 right-10 w-2 h-2 bg-white/40 rounded-full animate-float"></div>
            <div className="absolute bottom-32 left-10 w-3 h-3 bg-white/30 rounded-full animate-float delay-300"></div>
            <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-white/50 rounded-full animate-float delay-700"></div>
            
            <div className="relative z-10">
              {/* Logo with Animation */}
              <div className="flex items-center gap-3 mb-12 group/logo">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg group-hover/logo:scale-110 transition-transform duration-300">
                  🎓
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight block">Millennium</span>
                  <span className="text-xs text-white/70 tracking-wider">ACADEMY</span>
                </div>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>AI-Powered Learning Platform</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Where Knowledge
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Meets Innovation
                  </span>
                </h2>
                <p className="text-indigo-100 text-base leading-relaxed">
                  Experience the future of digital education with interactive classes, 
                  real-time collaboration, and personalized learning paths.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 mt-8">
                {[
                  "Live Interactive Classes",
                  "AI-Powered Progress Tracking",
                  "24/7 Learning Access",
                  "Global Community Network"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle size={16} className="text-green-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="relative z-10 mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4">
                {stats.map((Stat, idx) => (
                  <div key={idx} className="text-center group/stat">
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                        <Stat.icon size={18} />
                      </div>
                    </div>
                    <p className="text-xl font-bold">{Stat.value}</p>
                    <p className="text-xs text-indigo-200">{Stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/3 -right-20 w-48 h-48 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full blur-3xl opacity-20"></div>
          </div>

          {/* Right Side - Enhanced Form Section */}
          <div className="md:w-1/2 p-8 lg:p-12 bg-white/50 backdrop-blur-sm">
            <div className="mb-8 text-center md:text-left">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h3>
              <p className="text-slate-500 text-sm">
                Enter your credentials to access your personalized dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Enhanced Error Message */}
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 text-red-700 text-sm rounded-xl animate-shake">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-500 font-bold">!</span>
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Login ID Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email or Student ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} />
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-slate-700 bg-white/50 placeholder:text-slate-400"
                    placeholder="STU-G10-0007 or teacher@school.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1">
                    Forgot Password?
                    <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-slate-700 bg-white/50 placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Terms */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <div className="flex items-center gap-1">
                  <Fingerprint size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Secure login</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl py-4 font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-slate-400 uppercase tracking-wider font-semibold">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-600 text-sm group"
                >
                  <Mail size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Google</span>
                </button>
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-600 text-sm group"
                >
                  <Shield size={18} className="group-hover:scale-110 transition-transform" />
                  <span>GitHub</span>
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link 
                to="/register" 
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-all inline-flex items-center gap-1 group"
              >
                Sign up for free
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>

            {/* Demo Credentials Hint */}
            <div className="mt-6 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-xs text-center text-indigo-600">
                <span className="font-semibold">Login Tip:</span> Students use Student ID (example: STU-G10-0007); teachers/admins use email.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Login;
