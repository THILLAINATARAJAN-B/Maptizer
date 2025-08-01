import React from 'react'

const Badge = ({ 
  variant = 'default', 
  size = 'md',
  className = '', 
  children,
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'bg-transparent border border-gray-200 text-gray-700',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }
  
  const classes = `inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export default Badge
