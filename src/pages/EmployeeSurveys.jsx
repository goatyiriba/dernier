import React, { useState, useEffect } from 'react';
import { Survey, SurveyResponse, AuthService, Employee } from '@/api/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileQuestion, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Calendar,
  Users,
  Target,
  PlayCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";

export default function EmployeeSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const user = await AuthService.me();
      setCurrentUser(user);

      // Trouver l'employé correspondant
      let employeeData = null;
      if (user.employee_id) {
        const employeeResults = await Employee.filter({ employee_id: user.employee_id });
        if (employeeResults.length > 0) {
          employeeData = employeeResults[0];
        }
      }
      
      if (!employeeData && user.email) {
        const employeeResults = await Employee.filter({ email: user.email });
        if (employeeResults.length > 0) {
          employeeData = employeeResults[0];
        }
      }

      setEmployee(employeeData);

      // Charger tous les sondages
      const allSurveys = await Survey.list('-created_date');
      
      // Filtrer les sondages disponibles pour cet employé
      let availableSurveys = allSurveys.filter(survey => {
        // Doit être actif
        if (survey.status !== 'active') return false;
        
        // Vérifier la date d'expiration
        if (survey.end_date && isAfter(new Date(), parseISO(survey.end_date))) return false;
        
        // Vérifier le type
        if (survey.type === 'external') return false; // Les sondages externes ne sont pas pour les employés internes
        
        // Vérifier les départements ciblés (si applicable)
        if (survey.type === 'internal' && survey.target_departments && survey.target_departments.length > 0) {
          if (!employeeData || !survey.target_departments.includes(employeeData.department)) {
            return false;
          }
        }
        
        return true;
      });

      setSurveys(availableSurveys);

      // Charger mes réponses
      const allResponses = await SurveyResponse.list();
      const userResponses = allResponses.filter(response => 
        response.respondent_id === employeeData?.id || 
        (response.respondent_email === user.email)
      );
      setMyResponses(userResponses);

    } catch (error) {
      console.error("Error loading surveys:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les sondages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasRespondedToSurvey = (surveyId) => {
    return myResponses.some(response => response.survey_id === surveyId);
  };

  const canRespondMultipleTimes = (survey) => {
    return survey.allow_multiple_submissions;
  };

  const getMyResponsesForSurvey = (surveyId) => {
    return myResponses.filter(response => response.survey_id === surveyId);
  };

  const handleStartSurvey = (survey) => {
    // Rediriger vers une page de sondage interne ou utiliser un modal
    // Pour l'instant, on peut rediriger vers la page publique avec l'ID de l'employé
    const surveyUrl = `${createPageUrl("InternalSurvey")}?id=${survey.id}`;
    window.location.href = surveyUrl;
  };

  const getSurveyStatus = (survey) => {
    const hasResponded = hasRespondedToSurvey(survey.id);
    const canResubmit = canRespondMultipleTimes(survey);
    const myResponsesCount = getMyResponsesForSurvey(survey.id).length;

    if (hasResponded && !canResubmit) {
      return { status: 'completed', label: 'Terminé', color: 'bg-green-100 text-green-800' };
    } else if (hasResponded && canResubmit) {
      return { status: 'can_resubmit', label: `Répondu ${myResponsesCount} fois`, color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'available', label: 'Disponible', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const getEstimatedTime = (questionsCount) => {
    // Estimation: 1-2 minutes par question
    const estimatedMinutes = Math.ceil(questionsCount * 1.5);
    return estimatedMinutes;
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileQuestion className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Mes Sondages</h1>
                <p className="text-xl text-emerald-100 font-medium">
                  Participez aux sondages de votre entreprise
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{surveys.length} sondage{surveys.length > 1 ? 's' : ''} disponible{surveys.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{myResponses.length} réponse{myResponses.length > 1 ? 's' : ''} soumise{myResponses.length > 1 ? 's' : ''}</span>
              </div>
              {employee && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{employee.department}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sondages disponibles */}
        <div className="space-y-6">
          {surveys.length > 0 ? (
            <AnimatePresence>
              {surveys.map((survey, index) => {
                const surveyStatus = getSurveyStatus(survey);
                const estimatedTime = getEstimatedTime(survey.questions?.length || 0);
                const myResponsesCount = getMyResponsesForSurvey(survey.id).length;
                
                return (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <FileQuestion className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{survey.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={surveyStatus.color}>
                                    {surveyStatus.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {surveyStatus.status === 'available' && <Sparkles className="w-3 h-3 mr-1" />}
                                    {surveyStatus.status === 'can_resubmit' && <PlayCircle className="w-3 h-3 mr-1" />}
                                    {surveyStatus.label}
                                  </Badge>
                                  
                                  {survey.anonymous && (
                                    <Badge variant="outline" className="text-xs">
                                      👤 Anonyme
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4 leading-relaxed">{survey.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-500">
                                <FileQuestion className="w-4 h-4" />
                                <span>{survey.questions?.length || 0} questions</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>~{estimatedTime} min</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Créé le {format(parseISO(survey.created_date), 'dd/MM', { locale: fr })}</span>
                              </div>
                              {myResponsesCount > 0 && (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{myResponsesCount} réponse{myResponsesCount > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>

                            {survey.end_date && (
                              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-2 text-orange-700">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Expire le {format(parseISO(survey.end_date), 'dd MMMM yyyy', { locale: fr })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-6 flex flex-col gap-2">
                            {surveyStatus.status === 'available' && (
                              <Button
                                onClick={() => handleStartSurvey(survey)}
                                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Commencer
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            )}
                            
                            {surveyStatus.status === 'can_resubmit' && (
                              <Button
                                onClick={() => handleStartSurvey(survey)}
                                variant="outline"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Répondre à nouveau
                              </Button>
                            )}
                            
                            {surveyStatus.status === 'completed' && (
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-green-700">Sondage terminé</p>
                                <p className="text-xs text-green-600">Merci pour votre participation !</p>
                              </div>
                            )}
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
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileQuestion className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun sondage disponible</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Il n'y a pas de sondages actifs pour le moment. 
                  Les nouveaux sondages apparaîtront ici dès qu'ils seront publiés.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Astuce :</strong> Vous recevrez une notification lorsqu'un nouveau sondage sera disponible.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Historique des réponses */}
        {myResponses.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Mon Historique de Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myResponses.slice(0, 5).map((response, index) => {
                  const survey = surveys.find(s => s.id === response.survey_id);
                  if (!survey) return null;
                  
                  return (
                    <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{survey.title}</h4>
                        <p className="text-sm text-gray-500">
                          Répondu le {format(parseISO(response.created_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {response.is_complete && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complète
                          </Badge>
                        )}
                        {response.completion_time && (
                          <span className="text-xs text-gray-500">
                            {response.completion_time}s
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {myResponses.length > 5 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    ... et {myResponses.length - 5} autre{myResponses.length - 5 > 1 ? 's' : ''} réponse{myResponses.length - 5 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}