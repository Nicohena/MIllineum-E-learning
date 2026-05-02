/* eslint-disable react/prop-types */
import { cloneElement } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  onClick,
  type = 'button',
  loadingText = 'Loading...',
  ...props 
}) => {
  
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    // Primary brand button
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-indigo-800 focus:ring-indigo-500',
    
    // Secondary outline button
    secondary: 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400',
    
    // Outline button
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-700 focus:ring-indigo-500',
    
    // Ghost button (no background)
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    
    // Danger/Delete button
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 hover:shadow-red-300 hover:from-red-600 hover:to-red-700 focus:ring-red-500',
    
    // Success button
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500',
    
    // Warning button
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:from-amber-600 hover:to-orange-700 focus:ring-amber-500',
    
    // Dark button
    dark: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-200 hover:shadow-slate-300 hover:from-slate-800 hover:to-slate-900 focus:ring-slate-700',
    
    // Glass morphism button
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus:ring-white/50',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3.5 text-lg gap-2.5',
    xl: 'px-10 py-4 text-xl gap-3',
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabled = isLoading || isDisabled;

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  // Render loading spinner or left icon
  const renderLeftContent = () => {
    if (isLoading) {
      return <Loader2 size={iconSizes[size]} className="animate-spin" />;
    }
    if (leftIcon) {
      return cloneElement(leftIcon, { size: iconSizes[size] });
    }
    return null;
  };

  const renderRightContent = () => {
    if (!isLoading && rightIcon) {
      return cloneElement(rightIcon, { size: iconSizes[size] });
    }
    return null;
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-busy={isLoading}
      aria-disabled={disabled}
      {...props}
    >
      {renderLeftContent()}
      
      {isLoading && loadingText ? loadingText : children}
      
      {renderRightContent()}
    </button>
  );
};

// Preset button components for common use cases
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;

// Icon button component (circular, no text)
export const IconButton = ({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  className = '',
  label,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  return (
    <Button
      variant={variant}
      className={`rounded-full ${sizeClasses[size]} ${className}`}
      aria-label={label}
      {...props}
    >
      {cloneElement(icon, { size: iconSizes[size] })}
    </Button>
  );
};

// Button group component
export const ButtonGroup = ({ 
  children, 
  orientation = 'horizontal', 
  className = '',
  ...props 
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-2',
    vertical: 'flex flex-col space-y-2',
  };

  return (
    <div 
      className={`${orientationClasses[orientation]} ${className}`}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};

export default Button;