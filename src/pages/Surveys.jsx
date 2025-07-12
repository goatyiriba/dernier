import React, { useState, useEffect } from "react";
import { Survey, Employee, AuthService } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  Plus,
  Eye,
  Trash2,
  Share2,
  BarChart3,
  Users,
  Calendar,
  Settings,
  Link as LinkIcon,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Pause,
  Play,
  Globe,
  Building2,
  MoreVertical,
  Copy,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Info,
  QrCode,
  MessageSquare,
  UserCheck,
  FileText
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createPageUrl } from "@/utils";

import CreateSurveyModal from "../components/surveys/CreateSurveyModal";
import SurveyCard from "../components/surveys/SurveyCard";
import SurveyAnalytics from "../components/surveys/SurveyAnalytics";
import SurveyResponsesModal from "../components/surveys/SurveyResponsesModal";

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const user = await User.me();
      setCurrentUser(user);

      const surveysData = await Survey.list('-created_date');
      setSurveys(surveysData);

      const responsesData = await SurveyResponse.list();
      setResponses(responsesData);

      const employeesData = await Employee.list();
      setEmployees(employeesData);

    } catch (error) {
      console.error("Error loading surveys data:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données des sondages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(survey => survey.type === typeFilter);
    }

    setFilteredSurveys(filtered);
  };

  const generatePublicLink = (surveyId) => {
    const baseUrl = window.location.origin;
    const uniqueId = `${surveyId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      uniqueId,
      fullUrl: `${baseUrl}${createPageUrl("PublicSurvey")}?id=${uniqueId}`
    };
  };

  const handleCreateSurvey = async (surveyData) => {
    try {
      let publicLinkData = null;
      if (surveyData.type !== 'internal') {
        publicLinkData = generatePublicLink('temp');
      }
      
      const newSurvey = await Survey.create({
        ...surveyData,
        created_by: currentUser.id,
        public_link: publicLinkData?.uniqueId || null,
        response_count: 0,
        completion_rate: 0,
        start_date: new Date().toISOString(),
        status: 'draft'
      });

      if (publicLinkData) {
        const realPublicLink = generatePublicLink(newSurvey.id);
        await Survey.update(newSurvey.id, {
          public_link: realPublicLink.uniqueId
        });
      }

      toast({
        title: "✅ Succès",
        description: "Sondage créé avec succès",
      });

      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error("Error creating survey:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer le sondage",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    try {
      await Survey.delete(surveyId);
      
      toast({
        title: "✅ Succès",
        description: "Sondage supprimé avec succès",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le sondage",
        variant: "destructive"
      });
    }
  };

  const handleActivateSurvey = async (survey) => {
    try {
      await Survey.update(survey.id, { 
        status: 'active',
        start_date: new Date().toISOString()
      });

      // CORRECTION: Notification automatique des employés lors de l'activation
      if (survey.type === 'internal' || survey.type === 'mixed') {
        await notifyEmployeesOfSurvey(survey);
      }

      toast({
        title: "✅ Sondage activé",
        description: "Le sondage est maintenant disponible et les employés ont été notifiés",
      });

      loadData();
    } catch (error) {
      console.error("Error activating survey:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'activer le sondage",
        variant: "destructive"
      });
    }
  };

  // CORRECTION: Fonction améliorée pour notifier les employés avec alertes dashboard
  const notifyEmployeesOfSurvey = async (survey) => {
    try {
      console.log("🔔 Début de la notification des employés pour le sondage:", survey.title);
      
      let targetEmployees = employees;

      // Filtrer par départements si spécifié
      if (survey.target_departments && survey.target_departments.length > 0) {
        targetEmployees = employees.filter(emp => 
          survey.target_departments.includes(emp.department)
        );
        console.log(`📋 Ciblage par département: ${survey.target_departments.join(', ')} - ${targetEmployees.length} employés`);
      } else {
        console.log(`👥 Ciblage de tous les employés: ${targetEmployees.length} employés`);
      }

      // Récupérer tous les utilisateurs
      const allUsers = await User.list();
      
      // Associer employés et utilisateurs
      const targetUsers = allUsers.filter(user => 
        targetEmployees.some(emp => emp.email === user.email) && user.is_active
      );

      console.log(`✅ ${targetUsers.length} utilisateurs actifs trouvés pour notification`);

      // Créer les notifications pour chaque utilisateur ciblé
      const notificationPromises = targetUsers.map(async (user) => {
        try {
          await Notification.create({
            user_id: user.id,
            title: "📋 Nouveau Sondage Disponible",
            message: `Un nouveau sondage "${survey.title}" est maintenant disponible. Votre participation est importante pour améliorer notre organisation !`,
            type: "new_survey",
            link_to: survey.type === 'internal' 
              ? createPageUrl("EmployeeSurveys") 
              : createPageUrl("InternalSurvey") + `?id=${survey.id}`,
            is_read: false
          });
          console.log(`✉️ Notification envoyée à ${user.full_name || user.email}`);
        } catch (notifError) {
          console.error(`❌ Erreur notification pour ${user.email}:`, notifError);
        }
      });

      await Promise.all(notificationPromises);
      
      console.log(`🎉 Toutes les notifications ont été envoyées avec succès !`);
      
      toast({
        title: "🔔 Notifications envoyées",
        description: `${targetUsers.length} employé(s) ont été notifiés du nouveau sondage`,
      });

    } catch (error) {
      console.error("❌ Erreur lors de la notification des employés:", error);
      toast({
        title: "⚠️ Avertissement",
        description: "Le sondage a été activé mais certaines notifications n'ont pas pu être envoyées",
        variant: "destructive"
      });
    }
  };

  const copyPublicLink = (survey) => {
    if (survey.public_link) {
      const fullUrl = `${window.location.origin}${createPageUrl("PublicSurvey")}?id=${survey.public_link}`;
      navigator.clipboard.writeText(fullUrl);
      toast({
        title: "🔗 Lien copié",
        description: "Le lien public a été copié dans le presse-papiers",
      });
    }
  };

  const getSurveyResponses = (surveyId) => {
    return responses.filter(r => r.survey_id === surveyId);
  };

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

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                Gestion des Sondages
              </h1>
              <p className="text-xl text-purple-100 font-medium">
                Créez, gérez et analysez vos sondages internes et externes
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{surveys.length} sondage{surveys.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{responses.length} réponse{responses.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Sondage
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un sondage..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border bg-white/50 text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="paused">En pause</option>
                  <option value="closed">Fermé</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border bg-white/50 text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value="internal">Interne</option>
                  <option value="external">Externe</option>
                  <option value="mixed">Mixte</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des sondages */}
        <div className="grid gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredSurveys.length > 0 ? (
            <AnimatePresence>
              {filteredSurveys.map((survey, index) => {
                const surveyResponses = getSurveyResponses(survey.id);
                
                return (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{survey.title}</h3>
                              <Badge className={statusColors[survey.status]}>
                                {survey.status === 'draft' && '📝 Brouillon'}
                                {survey.status === 'active' && '✅ Actif'}
                                {survey.status === 'paused' && '⏸️ En pause'}
                                {survey.status === 'closed' && '🔒 Fermé'}
                              </Badge>
                              <Badge className={typeColors[survey.type]}>
                                {survey.type === 'internal' && '🏢 Interne'}
                                {survey.type === 'external' && '🌐 Externe'}
                                {survey.type === 'mixed' && '🔄 Mixte'}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{survey.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>{survey.questions?.length || 0} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{surveyResponses.length} réponses</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Créé le {format(parseISO(survey.created_date), 'dd/MM/yyyy', { locale: fr })}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Actions rapides */}
                            {survey.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateSurvey(survey)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Activer
                              </Button>
                            )}
                            
                            {(survey.type === 'external' || survey.type === 'mixed') && survey.public_link && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyPublicLink(survey)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copier lien
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSurvey(survey);
                                setShowResponsesModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Réponses ({surveyResponses.length})
                            </Button>
                            
                            {/* Menu actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">                                
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSurvey(survey);
                                  setShowAnalytics(true);
                                }}>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Analytics
                                </DropdownMenuItem>
                                
                                {(survey.type === 'external' || survey.type === 'mixed') && survey.public_link && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => {
                                      const fullUrl = `${window.location.origin}${createPageUrl("PublicSurvey")}?id=${survey.public_link}`;
                                      window.open(fullUrl, '_blank');
                                    }}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Ouvrir lien public
                                    </DropdownMenuItem>
                                  </>
                                )}
                                
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      className="text-red-600 focus:text-red-600"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer le sondage</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer le sondage "{survey.title}" ? 
                                        Cette action est irréversible et supprimera également toutes les réponses associées.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSurvey(survey.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-800">Aucun sondage trouvé</h3>
                <p className="text-gray-500 mt-2">Créez votre premier sondage pour commencer.</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un sondage
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateSurveyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSurvey}
      />

      {selectedSurvey && (
        <>
          <SurveyResponsesModal
            isOpen={showResponsesModal}
            onClose={() => {
              setShowResponsesModal(false);
              setSelectedSurvey(null);
            }}
            survey={selectedSurvey}
            responses={getSurveyResponses(selectedSurvey.id)}
            employees={employees}
          />

          <SurveyAnalytics
            isOpen={showAnalytics}
            onClose={() => {
              setShowAnalytics(false);
              setSelectedSurvey(null);
            }}
            survey={selectedSurvey}
            responses={getSurveyResponses(selectedSurvey.id)}
          />
        </>
      )}
    </div>
  );
}