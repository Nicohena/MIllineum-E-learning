/* eslint-disable react/prop-types */
import { Card } from './Card';
import { Button } from './Button';
import { 
  Construction, 
  AlertCircle, 
  FileQuestion, 
  WifiOff, 
  Lock, 
  RefreshCw,
  Home,
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  BookOpen,
  Video,
  Users,
  Loader2,
  Smile,
  Frown
} from 'lucide-react';

export const PagePlaceholder = ({ 
  title, 
  description,
  variant = 'construction',
  action,
  actionText = 'Go Back',
  onAction,
  secondaryAction,
  secondaryActionText,
  onSecondaryAction,
  icon: CustomIcon,
  illustration,
  fullScreen = false,
  compact = false,
  className = '',
  ...props 
}) => {
  
  const variants = {
    // Under construction / Building
    construction: {
      icon: Construction,
      title: title || 'Under Construction',
      description: description || "We're currently building this module to bring you a premium educational experience.",
      color: 'primary',
      gradient: 'from-amber-500 to-orange-500',
    },
    // Page not found (404)
    notFound: {
      icon: FileQuestion,
      title: title || 'Page Not Found',
      description: description || "The page you're looking for doesn't exist or has been moved.",
      color: 'warning',
      gradient: 'from-slate-500 to-slate-600',
    },
    // No data / Empty state
    empty: {
      icon: Search,
      title: title || 'No Results Found',
      description: description || "We couldn't find any data matching your criteria. Try adjusting your filters.",
      color: 'info',
      gradient: 'from-blue-500 to-cyan-500',
    },
    // No access / Unauthorized
    unauthorized: {
      icon: Lock,
      title: title || 'Access Denied',
      description: description || "You don't have permission to access this area. Please contact your administrator.",
      color: 'danger',
      gradient: 'from-red-500 to-rose-500',
    },
    // No internet connection
    offline: {
      icon: WifiOff,
      title: title || 'No Internet Connection',
      description: description || "Please check your internet connection and try again.",
      color: 'warning',
      gradient: 'from-gray-500 to-slate-500',
    },
    // Coming soon
    comingSoon: {
      icon: Calendar,
      title: title || 'Coming Soon',
      description: description || "This feature is on its way! We're working hard to launch it soon.",
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
    },
    // Maintenance mode
    maintenance: {
      icon: Clock,
      title: title || 'Under Maintenance',
      description: description || "We're currently performing scheduled maintenance. Please check back shortly.",
      color: 'warning',
      gradient: 'from-yellow-500 to-amber-500',
    },
    // Error state
    error: {
      icon: AlertCircle,
      title: title || 'Something Went Wrong',
      description: description || "An unexpected error occurred. Our team has been notified.",
      color: 'danger',
      gradient: 'from-red-500 to-red-600',
    },
    // Success state
    success: {
      icon: Smile,
      title: title || 'Success!',
      description: description || "Operation completed successfully.",
      color: 'success',
      gradient: 'from-emerald-500 to-teal-500',
    },
  };

  const variantConfig = variants[variant] || variants.construction;
  const Icon = CustomIcon || variantConfig.icon;
  
  const iconColors = {
    primary: 'text-indigo-600 bg-indigo-50',
    warning: 'text-amber-600 bg-amber-50',
    danger: 'text-red-600 bg-red-50',
    info: 'text-blue-600 bg-blue-50',
    success: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm' 
    : compact 
    ? 'p-4' 
    : 'p-6 md:p-10 max-w-7xl mx-auto';

  const cardClasses = compact ? 'max-w-sm' : 'max-w-md';

  // Animated dots
  const AnimatedDots = () => (
    <div className="flex gap-2 mt-6">
      <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
    </div>
  );

  // Animated pulse ring
  const PulseRing = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
    </div>
  );

  // Illustrations based on variant
  const renderIllustration = () => {
    if (illustration) {
      return <img src={illustration} alt="" className="w-40 h-40 object-contain" />;
    }
    
    switch(variant) {
      case 'empty':
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Search size={48} className="text-blue-400" strokeWidth={1} />
            </div>
          </div>
        );
      case 'offline':
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <WifiOff size={48} className="text-gray-400" strokeWidth={1} />
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <Frown size={48} className="text-red-400" strokeWidth={1} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${containerClasses} ${className}`} {...props}>
      <Card 
        variant="glass" 
        className={`${cardClasses} w-full flex flex-col items-center text-center relative overflow-hidden ${compact ? 'p-8' : 'p-12'}`}
      >
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${variantConfig.gradient} opacity-5`}></div>
        
        {/* Pulse Ring for certain variants */}
        {(variant === 'construction' || variant === 'comingSoon') && <PulseRing />}
        
        {/* Icon Container with Animation */}
        <div className={`
          relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6
          ${iconColors[variantConfig.color]}
          animate-float
        `}>
          <Icon size={40} strokeWidth={1.5} />
        </div>

        {/* Illustration (optional) */}
        {renderIllustration()}

        {/* Title */}
        <h2 className={`text-2xl font-bold text-slate-800 mb-3 ${compact ? 'text-xl' : 'text-2xl'}`}>
          {variantConfig.title}
        </h2>
        
        {/* Description */}
        <p className={`text-slate-500 mb-6 max-w-sm ${compact ? 'text-sm' : 'text-base'}`}>
          {variantConfig.description}
        </p>

        {/* Error Details (optional for error variant) */}
        {variant === 'error' && props.errorDetails && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg text-left w-full">
            <p className="text-xs text-red-600 font-mono break-all">
              {props.errorDetails}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 z-10">
          {action !== false && (
            <Button
              variant={variant === 'success' ? 'success' : 'primary'}
              leftIcon={variant === 'offline' ? <RefreshCw /> : <ArrowLeft />}
              onClick={onAction || (() => window.history.back())}
            >
              {actionText}
            </Button>
          )}
          
          {secondaryAction !== false && (
            <Button
              variant="secondary"
              leftIcon={<Home />}
              onClick={onSecondaryAction || (() => window.location.href = '/dashboard')}
            >
              {secondaryActionText || 'Go to Dashboard'}
            </Button>
          )}
        </div>

        {/* Animated Dots (only for construction/comingSoon) */}
        {(variant === 'construction' || variant === 'comingSoon') && <AnimatedDots />}

        {/* Loading Spinner for error retry */}
        {variant === 'error' && props.onRetry && (
          <button
            onClick={props.onRetry}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
      </Card>
    </div>
  );
};

// Preset components for common use cases
export const UnderConstruction = (props) => (
  <PagePlaceholder variant="construction" {...props} />
);

export const NotFound = (props) => (
  <PagePlaceholder variant="notFound" {...props} />
);

export const EmptyState = (props) => (
  <PagePlaceholder variant="empty" {...props} />
);

export const Unauthorized = (props) => (
  <PagePlaceholder variant="unauthorized" {...props} />
);

export const Offline = (props) => (
  <PagePlaceholder variant="offline" {...props} />
);

export const ComingSoon = (props) => (
  <PagePlaceholder variant="comingSoon" {...props} />
);

export const Maintenance = (props) => (
  <PagePlaceholder variant="maintenance" {...props} />
);

export const ErrorState = ({ onRetry, ...props }) => (
  <PagePlaceholder variant="error" onAction={onRetry} actionText="Try Again" {...props} />
);

export const SuccessState = (props) => (
  <PagePlaceholder variant="success" {...props} />
);

// Loading placeholder component
export const LoadingPlaceholder = ({ message = "Loading...", fullScreen = false }) => (
  <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'p-12'}`}>
    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
    <p className="text-slate-500">{message}</p>
  </div>
);

// Feature-specific placeholders
export const NoCoursesPlaceholder = () => (
  <PagePlaceholder 
    variant="empty"
    title="No Courses Enrolled"
    description="You haven't enrolled in any courses yet. Browse our catalog and start learning!"
    icon={BookOpen}
    actionText="Browse Courses"
    onAction={() => window.location.href = '/courses'}
  />
);

export const NoAssignmentsPlaceholder = () => (
  <PagePlaceholder 
    variant="empty"
    title="No Assignments"
    description="Great job! You've completed all your assignments. Check back later for new tasks."
    icon={Calendar}
    actionText="View Completed"
    secondaryAction={false}
  />
);

export const NoMessagesPlaceholder = () => (
  <PagePlaceholder 
    variant="empty"
    title="No Messages"
    description="Your inbox is empty. Start a conversation with your teachers or classmates."
    icon={Users}
    actionText="Start Chat"
    onAction={() => window.location.href = '/messages/new'}
  />
);

export const NoLiveClassesPlaceholder = () => (
  <PagePlaceholder 
    variant="comingSoon"
    title="No Live Classes Scheduled"
    description="There are no upcoming live classes. Check your schedule or contact your teacher."
    icon={Video}
    actionText="View Schedule"
    onAction={() => window.location.href = '/schedule'}
  />
);

export default PagePlaceholder;