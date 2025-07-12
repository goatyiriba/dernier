
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Calendar,
  User,
  Building2,
  Eye,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const getStatusConfig = (status) => {
  switch (status) {
    case 'Draft':
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: FileText,
        label: 'Brouillon'
      };
    case 'Completed':
      return { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Terminé'
      };
    case 'Acknowledged':
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle,
        label: 'Validé'
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: Clock,
        label: status
      };
  }
};

export default function ReviewCard({ 
  review, 
  employeeName, 
  employeeDepartment, 
  isAdmin,
  onView 
}) {
  const statusConfig = getStatusConfig(review.status);
  const StatusIcon = statusConfig.icon;

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averageRating = [
    review.overall_rating,
    review.goals_achievement,
    review.communication,
    review.teamwork,
    review.leadership
  ].reduce((sum, rating) => sum + (rating || 0), 0) / 5;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {isAdmin ? employeeName : 'Mon évaluation'}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-3 h-3" />
                    <span>{employeeDepartment}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{review.review_period}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{format(parseISO(review.review_date), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Note générale - Design amélioré */}
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 text-lg">Note générale</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (review.overall_rating || 0) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({(review.overall_rating || 0).toFixed(1)}/5)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getRatingColor(review.overall_rating || 0)}`}>
                  {(review.overall_rating || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">sur 5</div>
              </div>
            </div>
          </div>

          {/* Détails des évaluations - Grid amélioré */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'goals_achievement', label: 'Objectifs', icon: Target, color: 'from-green-400 to-emerald-500' },
              { key: 'communication', label: 'Communication', icon: MessageSquare, color: 'from-blue-400 to-cyan-500' },
              { key: 'teamwork', label: 'Équipe', icon: Users, color: 'from-purple-400 to-violet-500' },
              { key: 'leadership', label: 'Leadership', icon: TrendingUp, color: 'from-orange-400 to-red-500' }
            ].map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="relative overflow-hidden p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group">
                <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl ${color} opacity-10 rounded-full translate-x-2 -translate-y-2 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900">{(review[key] || 0)}</span>
                    <span className="text-xs text-gray-500">/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progression moyenne - Design moderne */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-700">Performance moyenne</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${getRatingColor(averageRating)}`}>
                  {averageRating.toFixed(1)}/5
                </span>
                <Badge variant="outline" className={`${getRatingColor(averageRating)} border-current`}>
                  {Math.round((averageRating / 5) * 100)}%
                </Badge>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={(averageRating / 5) * 100} 
                className="h-3 bg-gray-200"
              />
              <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20" 
                   style={{ width: `${(averageRating / 5) * 100}%` }}>
              </div>
            </div>
          </div>

          {/* Section Action - Design proéminent */}
          <div className="mt-6 pt-4 border-t-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Évalué le {format(parseISO(review.review_date), 'dd MMM yyyy', { locale: fr })}</span>
              </div>
              
              <Button
                variant="default"
                size="lg"
                onClick={() => {
                  console.log("Voir détails clicked for review:", review);
                  if (onView && typeof onView === 'function') {
                    onView(review);
                  } else {
                    console.error("onView function not provided or not a function:", onView);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5 rounded-xl font-medium"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir détails
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
