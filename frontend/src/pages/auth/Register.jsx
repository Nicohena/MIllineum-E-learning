import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, User, UserPlus, GraduationCap, School, 
  Sparkles, CheckCircle, ArrowRight, Eye, EyeOff,
  Shield, Award, BookOpen, Users, Calendar, Star,
  Fingerprint
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 4));
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    checkPasswordStrength(newPassword);
  };

  const getStrengthColor = () => {
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#10b981'];
    return colors[passwordStrength];
  };

  const getStrengthText = () => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[passwordStrength];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.fullName.length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setError('Self-registration is currently disabled. Please contact an administrator to create your account.');
    }, 600);
  };

  const benefits = [
    { icon: BookOpen, text: "Access to 1000+ premium resources" },
    { icon: Users, text: "Connect with expert educators" },
    { icon: Award, text: "Earn recognized certificates" },
    { icon: Calendar, text: "Self-paced learning schedule" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="max-w-6xl w-full relative z-10 animate-fadeInUp">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/50">
          
          {/* Left Side - Premium Benefits Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-10 text-white flex flex-col justify-between relative overflow-hidden group">
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Floating Particles */}
            <div className="absolute top-20 right-10 w-2 h-2 bg-white/40 rounded-full animate-float"></div>
            <div className="absolute bottom-32 left-10 w-3 h-3 bg-white/30 rounded-full animate-float delay-300"></div>
            <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-white/50 rounded-full animate-float delay-700"></div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-12 group/logo">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg group-hover/logo:scale-110 transition-transform duration-300">
                  🚀
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight block">Millennium</span>
                  <span className="text-xs text-white/70 tracking-wider">ACADEMY</span>
                </div>
              </div>
              
              {/* Headline */}
              <div className="space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>Join 5000+ Active Learners</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Start Your Learning
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Journey Today
                  </span>
                </h2>
                <p className="text-teal-100 text-base leading-relaxed">
                  Join a thriving community of learners and educators dedicated to academic excellence and professional growth.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-teal-100 p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                    <benefit.icon size={16} className="text-yellow-300 flex-shrink-0" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative z-10 mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Star size={20} className="text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">&ldquo;Best decision for my career!&rdquo;</p>
                  <p className="text-xs text-teal-200">— Sarah Johnson, Alumni</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/3 -right-20 w-48 h-48 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full blur-3xl opacity-20"></div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:w-1/2 p-8 lg:p-10 bg-white/50 backdrop-blur-sm overflow-y-auto max-h-[90vh] lg:max-h-full">
            <div className="mb-6 text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h3>
              <p className="text-slate-500 text-sm">
                Join the Millennium community and start learning
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {success && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded-xl animate-slideIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span className="font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 text-red-700 text-sm rounded-xl animate-shake">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-500 font-bold text-xs">!</span>
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'student'})}
                    className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                      formData.role === 'student' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap size={18} />
                    Student
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'teacher'})}
                    className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                      formData.role === 'teacher' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <School size={18} />
                    Teacher
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="block w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-slate-700 bg-white/50"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-slate-700 bg-white/50"
                    placeholder="student@millennium.edu"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className="block w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-slate-700 bg-white/50"
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((level) => (
                        <div 
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: level < passwordStrength ? getStrengthColor() : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: getStrengthColor() }}>
                      Password Strength: {getStrengthText()}
                    </p>
                    <p className="text-xs text-slate-400">
                      Min. 6 characters with letters & numbers
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="block w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-slate-700 bg-white/50"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  I agree to the{' '}
                  <a href="#" className="text-emerald-600 font-semibold hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-emerald-600 font-semibold hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-slate-400 uppercase tracking-wider font-semibold">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Registration */}
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 text-sm group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 text-sm group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#DB4437" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 text-sm group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-all inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Fingerprint size={12} />
              <span>Your data is encrypted and secure</span>
              <Shield size={12} />
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
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
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

export default Register;
