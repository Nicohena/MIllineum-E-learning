/* eslint-disable react/prop-types */
import { ChevronRight } from 'lucide-react';

export const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  footer, 
  className = '', 
  variant = 'glass',
  hover = true,
  clickable = false,
  onClick,
  badge,
  badgeColor = 'primary',
  actions,
  coverImage,
  coverHeight = 'h-48',
  loading = false,
  bordered = true,
  shadow = 'sm',
  padding = 'md',
  ...props 
}) => {
  
  const variants = {
    // Glassmorphism (default for modern look)
    glass: 'bg-white/80 backdrop-blur-xl border-white/40',
    // Clean white card
    white: 'bg-white',
    // Dark theme card
    dark: 'bg-slate-900 text-white border-slate-800',
    // Gradient card
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
    // Primary colored card
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white',
    // Success card
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    // Warning card
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    // Danger card
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
    // Transparent card
    transparent: 'bg-transparent backdrop-blur-none',
  };

  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    hover: 'hover:shadow-xl transition-shadow duration-300',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverEffects = {
    true: 'hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer',
    false: '',
  };

  const borderClasses = bordered ? 'border' : 'border-0';
  const clickableClass = clickable || onClick ? 'cursor-pointer' : '';
  const hoverClass = hover ? hoverEffects[true] : '';

  const badgeColors = {
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    dark: 'bg-slate-800 text-white',
  };

  const handleClick = () => {
    if ((clickable || onClick) && onClick) {
      onClick();
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div 
        className={`rounded-2xl ${paddings[padding]} ${variants[variant]} ${borderClasses} ${shadows[shadow]} ${className} animate-pulse`}
        {...props}
      >
        {coverImage && (
          <div className={`${coverHeight} bg-slate-200 rounded-t-2xl -mt-6 -mx-6 mb-4`}></div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        rounded-2xl 
        ${paddings[padding]} 
        ${variants[variant]} 
        ${borderClasses} 
        ${shadows[shadow]} 
        ${hoverClass}
        ${clickableClass}
        transition-all 
        duration-300 
        relative
        ${className}
      `}
      onClick={handleClick}
      role={clickable || onClick ? "button" : "article"}
      tabIndex={clickable || onClick ? 0 : undefined}
      onKeyDown={clickable || onClick ? (e) => e.key === 'Enter' && handleClick() : undefined}
      {...props}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className={`${coverHeight} -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-2xl`}>
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Header with Title, Subtitle, Icon, and Badge */}
      {(title || subtitle || Icon || badge || actions) && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-start gap-3 flex-1">
            {Icon && (
              <div className={`
                p-2.5 rounded-xl flex-shrink-0
                ${variant === 'glass' || variant === 'white' 
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600' 
                  : 'bg-white/20 text-white'}
              `}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {title && (
                  <h3 className={`
                    text-lg font-bold leading-tight
                    ${variant === 'dark' || variant.includes('gradient') || variant === 'primary' 
                      ? 'text-white' 
                      : 'text-slate-800'}
                  `}>
                    {title}
                  </h3>
                )}
                {badge && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColors[badgeColor]}`}>
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${
                  variant === 'dark' || variant.includes('gradient') || variant === 'primary'
                    ? 'text-white/70'
                    : 'text-slate-400'
                }`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`mt-6 pt-6 ${
          variant === 'glass' || variant === 'white'
            ? 'border-t border-slate-100'
            : variant === 'dark'
            ? 'border-t border-slate-800'
            : 'border-t border-white/20'
        }`}>
          {footer}
        </div>
      )}

      {/* Click Indicator for Clickable Cards */}
      {clickable && !onClick && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} className="text-slate-400" />
        </div>
      )}
    </div>
  );
};

// Preset Card Components
export const StatsCard = ({ title, value, icon: Icon, trend, trendValue, variant = 'white', ...props }) => {
  return (
    <Card variant={variant} padding="lg" {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl">
          <Icon size={32} className="text-indigo-600" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
};

export const CourseCard = ({ title, instructor, progress, thumbnail, students, rating, ...props }) => {
  return (
    <Card variant="white" hover coverImage={thumbnail} coverHeight="h-40" {...props}>
      <div className="space-y-3">
        <div>
          <h4 className="font-bold text-slate-800 line-clamp-1">{title}</h4>
          <p className="text-sm text-slate-500 mt-1">by {instructor}</p>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-semibold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>👨‍🎓 {students}+</span>
            <span>⭐ {rating}</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </div>
    </Card>
  );
};

export const AssignmentCard = ({ title, dueDate, status, grade, ...props }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-emerald-100 text-emerald-700',
    late: 'bg-red-100 text-red-700',
  };

  return (
    <Card variant="glass" padding="md" hover {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500 mt-1">Due: {dueDate}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {grade && <p className="text-sm font-bold text-indigo-600 mt-2">Grade: {grade}</p>}
        </div>
      </div>
    </Card>
  );
};

export const MetricCard = ({ metric, value, change, icon: Icon, ...props }) => {
  const isPositive = change > 0;
  return (
    <Card variant="white" padding="md" {...props}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-50">
          <Icon size={24} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500">{metric}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {change && (
              <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Card;