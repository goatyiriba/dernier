import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Users,
  Globe,
  Play,
  Pause,
  Square,
  MoreVertical,
  Share,
  Copy,
  BarChart3,
  Eye,
  Calendar,
  MessageSquare,
  TrendingUp,
  QrCode
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  closed: "bg-red-100 text-red-800"
};

const typeColors = {
  internal: "bg-blue-100 text-blue-800",
  external: "bg-purple-100 text-purple-800",
  mixed: "bg-indigo-100 text-indigo-800"
};

const typeIcons = {
  internal: Users,
  external: Globe,
  mixed: Users
};

export default function SurveyCard({ survey, responses, onStatusChange, onCopyLink, onViewAnalytics }) {
  const TypeIcon = typeIcons[survey.type];
  const responseCount = responses.length;
  const completedResponses = responses.filter(r => r.is_complete).length;
  const completionRate = responseCount > 0 ? Math.round((completedResponses / responseCount) * 100) : 0;
  
  const daysActive = survey.start_date ? differenceInDays(new Date(), new Date(survey.start_date)) : 0;

  const handleStatusChange = (newStatus) => {
    onStatusChange(survey.id, newStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {survey.title}
                </CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {survey.description || "Aucune description"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusColors[survey.status]}>
                    {survey.status === 'draft' && '📝 Brouillon'}
                    {survey.status === 'active' && '✅ Actif'}
                    {survey.status === 'paused' && '⏸️ En pause'}
                    {survey.status === 'closed' && '🔒 Fermé'}
                  </Badge>
                  <Badge className={typeColors[survey.type]}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {survey.type === 'internal' && 'Interne'}
                    {survey.type === 'external' && 'Externe'}
                    {survey.type === 'mixed' && 'Mixte'}
                  </Badge>
                  {survey.anonymous && (
                    <Badge variant="outline">🔒 Anonyme</Badge>
                  )}
                  {survey.questions?.length > 0 && (
                    <Badge variant="outline">{survey.questions.length} questions</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {survey.status === 'draft' && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('active')}
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Activer
                  </DropdownMenuItem>
                )}
                {survey.status === 'active' && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('paused')}
                    className="text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Mettre en pause
                  </DropdownMenuItem>
                )}
                {survey.status === 'paused' && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('active')}
                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reprendre
                  </DropdownMenuItem>
                )}
                {(survey.status === 'active' || survey.status === 'paused') && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('closed')}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Fermer
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {(survey.type === 'external' || survey.type === 'mixed') && (
                  <DropdownMenuItem onClick={() => onCopyLink(survey)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le lien public
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onViewAnalytics(survey)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Voir les analytics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600">{responseCount}</p>
              <p className="text-xs text-blue-700">Réponses</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              <p className="text-xs text-green-700">Completion</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-600">{daysActive}</p>
              <p className="text-xs text-purple-700">Jours actif</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-600">{survey.questions?.length || 0}</p>
              <p className="text-xs text-orange-700">Questions</p>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-4">
              <span>Créé le {format(new Date(survey.created_date), "dd/MM/yyyy")}</span>
              {survey.target_departments?.length > 0 && (
                <span>• {survey.target_departments.join(", ")}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {survey.status === 'active' && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 font-medium">En direct</span>
                </div>
              )}
              {(survey.type === 'external' || survey.type === 'mixed') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCopyLink(survey)}
                  className="h-7 px-2 text-xs"
                >
                  <Share className="w-3 h-3 mr-1" />
                  Partager
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}