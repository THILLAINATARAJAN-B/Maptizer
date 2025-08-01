import React from 'react'

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}
    {...props}
  />
))

const CardHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 border-b border-gray-100 ${className}`}
    {...props}
  />
))

const CardTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  />
))

const CardDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-600 mt-1 ${className}`}
    {...props}
  />
))

const CardContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 ${className}`}
    {...props}
  />
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
