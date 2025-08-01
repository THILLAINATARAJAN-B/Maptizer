import React from 'react'
import { TrendingUp, MapPin, Users, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
// ✅ Use default imports
import Badge from '../ui/Badge'


const StatsCards = ({ customStats = null }) => {
  const defaultStats = [
    {
      title: "Active Searches",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Locations Analyzed", 
      value: "1,654",
      change: "+8.2%",
      changeType: "positive",
      icon: MapPin,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Demographics Points",
      value: "892",
      change: "-2.4%", 
      changeType: "negative",
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "AI Insights",
      value: "341",
      change: "+15.8%",
      changeType: "positive", 
      icon: Activity,
      color: "bg-orange-100 text-orange-600"
    }
  ]

  const stats = customStats || defaultStats

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsCards
