import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Target,
  Zap,
  Calendar,
  Clock
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const Dashboard = ({ stats, recentActivity, quickActions }) => {
  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'primary', subtitle }) => (
    <Card className="hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {subtitle && (
                <Badge variant="outline" size="sm">
                  {subtitle}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-3">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <div className="flex items-center">
              {changeType === 'increase' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : changeType === 'decrease' ? (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 
                changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change}% from last month
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
            color === 'primary' ? 'bg-orange-100 group-hover:bg-orange-200' : 
            color === 'success' ? 'bg-green-100 group-hover:bg-green-200' : 
            color === 'info' ? 'bg-blue-100 group-hover:bg-blue-200' : 
            color === 'warning' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
            'bg-purple-100 group-hover:bg-purple-200'
          }`}>
            <Icon className={`w-7 h-7 ${
              color === 'primary' ? 'text-orange-600' : 
              color === 'success' ? 'text-green-600' : 
              color === 'info' ? 'text-blue-600' : 
              color === 'warning' ? 'text-yellow-600' :
              'text-purple-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ActivityItem = ({ title, description, time, status, type, metadata }) => (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${
          status === 'completed' ? 'bg-green-500' : 
          status === 'processing' ? 'bg-orange-500 animate-pulse' : 
          status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
        }`}></div>
        {status === 'processing' && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-orange-500 animate-ping opacity-75"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
          {title}
        </p>
        <p className="text-sm text-gray-600 truncate">{description}</p>
        {metadata && (
          <div className="flex items-center space-x-2 mt-1">
            {metadata.locations && (
              <span className="text-xs text-gray-600">
                📍 {metadata.locations} locations
              </span>
            )}
            {metadata.accuracy && (
              <span className="text-xs text-green-600">
                ✓ {metadata.accuracy}% accuracy
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end space-y-1">
        <Badge 
          variant={
            status === 'completed' ? 'success' : 
            status === 'processing' ? 'primary' : 
            status === 'failed' ? 'error' : 'default'
          } 
          size="sm"
        >
          {status}
        </Badge>
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'primary', badge }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full h-auto p-4 justify-start hover:bg-gray-50 border border-gray-200 hover:border-orange-300 group"
    >
      <div className="flex items-center space-x-3 w-full">
        <div className={`p-2 rounded-lg transition-colors ${
          color === 'primary' ? 'bg-orange-100 group-hover:bg-orange-200' : 
          color === 'success' ? 'bg-green-100 group-hover:bg-green-200' : 
          color === 'info' ? 'bg-blue-100 group-hover:bg-blue-200' : 
          'bg-purple-100 group-hover:bg-purple-200'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'primary' ? 'text-orange-600' : 
            color === 'success' ? 'text-green-600' : 
            color === 'info' ? 'text-blue-600' : 
            'text-purple-600'
          }`} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{title}</p>
            {badge && (
              <Badge variant="primary" size="sm">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
      </div>
    </Button>
  )

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest searches and analytics activities
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" className="w-full">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Usage */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump into your most-used features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions && quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>This month's activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">API Calls</span>
                    <span className="text-sm text-gray-600">8,547 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">85% of monthly limit</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-gray-600">2.1 GB / 5 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">42% of storage limit</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Comparisons</span>
                    <span className="text-sm text-gray-600">156 / 200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">78% of monthly limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
