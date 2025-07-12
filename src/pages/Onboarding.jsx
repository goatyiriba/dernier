
import React, { useState, useEffect } from "react";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserCheck, 
  CheckCircle, 
  Clock, 
  User,
  FileText,
  Building2,
  Key,
  Monitor,
  Coffee
} from "lucide-react";
import { motion } from "framer-motion";

import OnboardingTaskCard from "../components/onboarding/OnboardingTaskCard";
import NewEmployeeCard from "../components/onboarding/NewEmployeeCard";

const onboardingTasks = [
  {
    id: 1,
    title: "Complete Employment Forms",
    description: "Fill out I-9, W-4, and other required employment documents",
    icon: FileText,
    category: "Documentation",
    estimated_time: "30 minutes",
    mandatory: true
  },
  {
    id: 2,
    title: "Setup Workspace",
    description: "Get assigned desk, chair, and basic office supplies",
    icon: Building2,
    category: "Workspace",
    estimated_time: "15 minutes",
    mandatory: true
  },
  {
    id: 3,
    title: "IT Account Setup",
    description: "Receive company email, laptop, and system access credentials",
    icon: Key,
    category: "IT Setup",
    estimated_time: "45 minutes",
    mandatory: true
  },
  {
    id: 4,
    title: "Equipment Training",
    description: "Learn to use company software, tools, and equipment",
    icon: Monitor,
    category: "Training",
    estimated_time: "2 hours",
    mandatory: true
  },
  {
    id: 5,
    title: "Team Introduction",
    description: "Meet team members and understand team structure",
    icon: User,
    category: "Social",
    estimated_time: "1 hour",
    mandatory: false
  },
  {
    id: 6,
    title: "Office Tour & Culture",
    description: "Tour the office, learn about company culture and values",
    icon: Coffee,
    category: "Culture",
    estimated_time: "45 minutes",
    mandatory: false
  }
];

export default function Onboarding() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
    const intervalId = setInterval(loadEmployees, 15000); // Refresh data every 15 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await Employee.list("-start_date");
      // Get recent employees (started within last 30 days)
      const recentEmployees = data.filter(emp => {
        const startDate = new Date(emp.start_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return startDate >= thirtyDaysAgo && emp.status === "Active";
      });
      setEmployees(recentEmployees);
      if (recentEmployees.length > 0) {
        setSelectedEmployee(prevSelected => {
          // If the previously selected employee is still in the list, keep them selected.
          // Otherwise, select the first employee.
          const currentSelectedExists = recentEmployees.some(emp => emp.id === prevSelected?.id);
          return currentSelectedExists ? prevSelected : recentEmployees[0];
        });
      } else {
        setSelectedEmployee(null); // No recent employees, clear selection
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (employeeId, taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [taskId]: !prev[employeeId]?.[taskId]
      }
    }));
  };

  const getEmployeeProgress = (employeeId) => {
    const employeeTasks = completedTasks[employeeId] || {};
    const completedCount = Object.values(employeeTasks).filter(Boolean).length;
    return Math.round((completedCount / onboardingTasks.length) * 100);
  };

  const getCompletedTasksCount = (employeeId) => {
    const employeeTasks = completedTasks[employeeId] || {};
    return Object.values(employeeTasks).filter(Boolean).length;
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Employee Onboarding
            </h1>
            <p className="text-slate-600">
              Welcome new team members and track their onboarding progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {employees.length} New Employees
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">New Employees</p>
                  <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Progress</p>
                  <p className="text-2xl font-bold text-green-600">
                    {employees.length > 0 
                      ? Math.round(employees.reduce((sum, emp) => sum + getEmployeeProgress(emp.id), 0) / employees.length)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-purple-600">{onboardingTasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
            </CardContent>
          </Card>
        ) : employees.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No New Employees
              </h3>
              <p className="text-slate-600">
                New employees who started within the last 30 days will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Employee List */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    New Employees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employees.map((employee) => (
                    <NewEmployeeCard
                      key={employee.id}
                      employee={employee}
                      progress={getEmployeeProgress(employee.id)}
                      completedTasks={getCompletedTasksCount(employee.id)}
                      totalTasks={onboardingTasks.length}
                      isSelected={selectedEmployee?.id === employee.id}
                      onSelect={() => setSelectedEmployee(employee)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Onboarding Tasks */}
            <div className="lg:col-span-2">
              {selectedEmployee && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </CardTitle>
                        <p className="text-slate-600">
                          {selectedEmployee.position} • {selectedEmployee.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-600">Progress:</span>
                          <span className="font-semibold text-slate-900">
                            {getEmployeeProgress(selectedEmployee.id)}%
                          </span>
                        </div>
                        <Progress 
                          value={getEmployeeProgress(selectedEmployee.id)} 
                          className="w-32"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Onboarding Checklist
                      </h3>
                      <div className="space-y-3">
                        {onboardingTasks.map((task) => (
                          <OnboardingTaskCard
                            key={task.id}
                            task={task}
                            isCompleted={completedTasks[selectedEmployee.id]?.[task.id] || false}
                            onToggle={() => handleTaskComplete(selectedEmployee.id, task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
