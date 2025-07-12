import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserPlus, Calendar, TrendingUp, Users, Zap } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Add New Employee",
      icon: UserPlus,
      url: createPageUrl("Employees"),
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      title: "Request Leave",
      icon: Calendar,
      url: createPageUrl("LeaveManagement"),
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-50"
    },
    {
      title: "Schedule Review",
      icon: TrendingUp,
      url: createPageUrl("Performance"),
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50"
    },
    {
      title: "View Directory",
      icon: Users,
      url: createPageUrl("Employees"),
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50"
    }
  ];

  return (
    <Card className="gemini-card hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-2xl font-bold gemini-title flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.url}>
              <div className={`group p-4 rounded-xl bg-gradient-to-r ${action.bgGradient} hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                      {action.title}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-gray-600">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}