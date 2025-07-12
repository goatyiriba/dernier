import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  ArrowRight,
  Zap,
  Bell,
  Plus,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const ActionButton = ({ icon: Icon, title, subtitle, count, href, priority = 'normal', delay = 0 }) => {
  const priorityStyles = {
    urgent: 'from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-200',
    high: 'from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-amber-200',
    normal: 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200'
  };

  const iconStyles = {
    urgent: 'from-red-500 to-orange-500',
    high: 'from-amber-500 to-yellow-500',
    normal: 'from-blue-500 to-indigo-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
    >
      <Link to={href}>
        <div className={`group p-4 rounded-xl bg-gradient-to-r ${priorityStyles[priority]} border transition-all duration-300 cursor-pointer hover:shadow-lg`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconStyles[priority]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
              <Icon className="w-6 h-6 text-white" />
              {count > 0 && priority === 'urgent' && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                  {count}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
              {count > 0 && (
                <Badge 
                  className={`mt-1 text-xs ${
                    priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    priority === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {count} en attente
                </Badge>
              )}
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function QuickActionCenter({ stats }) {
  const actions = [
    {
      icon: Users,
      title: 'Gestion Employés',
      subtitle: `${stats.employees.active} employés actifs`,
      count: 0,
      href: createPageUrl('Employees'),
      priority: 'normal'
    },
    {
      icon: Calendar,
      title: 'Approbation Congés',
      subtitle: 'Demandes en attente de validation',
      count: stats.leaves.pending,
      href: createPageUrl('LeaveManagement'),
      priority: stats.leaves.pending > 5 ? 'urgent' : stats.leaves.pending > 0 ? 'high' : 'normal'
    },
    {
      icon: FileText,
      title: 'Nouvelles Annonces',
      subtitle: 'Communiquer avec l\'équipe',
      count: stats.announcements.urgent,
      href: createPageUrl('Announcements'),
      priority: stats.announcements.urgent > 0 ? 'high' : 'normal'
    },
    {
      icon: Settings,
      title: 'Configuration',
      subtitle: 'Paramètres système et branding',
      count: 0,
      href: createPageUrl('BrandingSettings'),
      priority: 'normal'
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Centre d'Actions
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            Rapide
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            {...action}
            delay={index * 0.1}
          />
        ))}
        
        {/* Quick stats footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Système opérationnel</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-500">Temps réel</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {stats.employees.active} connectés
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}