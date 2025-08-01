import React from 'react'
import { cn } from '../../utils/cn'

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  hint,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const inputId = React.useId()
  
  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        
        {/* Input Field */}
        <input
          id={inputId}
          type={type}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400 sm:text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {/* Hint Text */}
      {hint && !error && (
        <p className="text-sm text-text-secondary">
          {hint}
        </p>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
