import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Calendar,
  User,
  Building2,
  Target,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
  Eye,
  X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

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
        icon: FileText,
        label: status
      };
  }
};

export default function ViewReviewModal({ 
  isOpen, 
  onClose, 
  review, 
  employeeName, 
  employeeDepartment, 
  isAdminView = false 
}) {
  if (!review) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Eye className="w-6 h-6 text-blue-600" />
            Détails de l'Évaluation
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête de l'évaluation */}
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{employeeName}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{employeeDepartment}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Période: {review.review_period}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Évalué le: {format(parseISO(review.review_date), 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className={`${statusConfig.color} flex items-center gap-2 px-4 py-2`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Note générale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Note Générale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-bold ${getRatingColor(review.overall_rating || 0)}`}>
                    {(review.overall_rating || 0).toFixed(1)}
                  </div>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= (review.overall_rating || 0) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mt-1">sur 5 points</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-2">Performance moyenne</div>
                  <div className={`text-3xl font-bold ${getRatingColor(averageRating)}`}>
                    {averageRating.toFixed(1)}
                  </div>
                  <Progress value={(averageRating / 5) * 100} className="w-32 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails des évaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Évaluations Détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'goals_achievement', label: 'Atteinte des Objectifs', icon: Target, color: 'from-green-400 to-emerald-500' },
                  { key: 'communication', label: 'Communication', icon: MessageSquare, color: 'from-blue-400 to-cyan-500' },
                  { key: 'teamwork', label: 'Travail d\'Équipe', icon: Users, color: 'from-purple-400 to-violet-500' },
                  { key: 'leadership', label: 'Leadership', icon: TrendingUp, color: 'from-orange-400 to-red-500' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{(review[key] || 0)}</span>
                        <span className="text-gray-500">/5</span>
                      </div>
                    </div>
                    <Progress value={((review[key] || 0) / 5) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commentaires et observations */}
          {(review.strengths || review.areas_for_improvement || review.goals_next_period || review.employee_comments) && (
            <Card>
              <CardHeader>
                <CardTitle>Commentaires et Observations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.strengths && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Points Forts
                    </h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                      {review.strengths}
                    </p>
                  </div>
                )}

                {review.areas_for_improvement && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Axes d'Amélioration
                    </h4>
                    <p className="text-gray-700 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                      {review.areas_for_improvement}
                    </p>
                  </div>
                )}

                {review.goals_next_period && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Objectifs Prochaine Période
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {review.goals_next_period}
                    </p>
                  </div>
                )}

                {review.employee_comments && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Commentaires Additionnels
                    </h4>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                      {review.employee_comments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-8">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}