
import React, { useState, useEffect } from "react";
import { Survey, SurveyResponse, AuthService, Employee } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // Added import for Badge
import { Progress } from "@/components/ui/progress";
import {
  FileQuestion,
  Send,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Calendar,
  Hash,
  Type,
  List,
  CheckSquare,
  ToggleLeft,
  Clock,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";

export default function InternalSurvey() {
  const [survey, setSurvey] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    loadSurvey();
  }, []);

  const loadSurvey = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const surveyId = urlParams.get('id');
      
      if (!surveyId) {
        toast({
          title: "❌ Erreur",
          description: "ID de sondage manquant",
          variant: "destructive"
        });
        return;
      }

      // Vérifier l'authentification
      const user = await AuthService.me();
      setCurrentUser(user);

      // Trouver l'employé
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

      // Charger le sondage
      const surveys = await Survey.list();
      const foundSurvey = surveys.find(s => s.id === surveyId);
      
      if (!foundSurvey) {
        toast({
          title: "❌ Sondage introuvable",
          description: "Ce sondage n'existe pas",
          variant: "destructive"
        });
        return;
      }

      if (foundSurvey.status !== 'active') {
        toast({
          title: "❌ Sondage indisponible",
          description: "Ce sondage n'est plus actif",
          variant: "destructive"
        });
        return;
      }

      // Vérifier si l'employé peut accéder à ce sondage
      if (foundSurvey.type === 'internal' && foundSurvey.target_departments && foundSurvey.target_departments.length > 0) {
        if (!employeeData || !foundSurvey.target_departments.includes(employeeData.department)) {
          toast({
            title: "❌ Accès refusé",
            description: "Ce sondage n'est pas destiné à votre département",
            variant: "destructive"
          });
          return;
        }
      }

      setSurvey(foundSurvey);
    } catch (error) {
      console.error("Error loading survey:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger le sondage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateCurrentStep = () => {
    if (currentStep >= survey.questions.length) return true;
    
    const question = survey.questions[currentStep];
    if (question.required) {
      const response = responses[question.id];
      // For multiple_choice, check if array is not empty
      if (question.type === 'multiple_choice') {
        return Array.isArray(response) && response.length > 0;
      }
      return response !== undefined && response !== "" && response !== null;
    }
    
    return true;
  };

  const getQuestionIcon = (type) => {
    const icons = {
      text: Type,
      textarea: Type,
      single_choice: List,
      multiple_choice: CheckSquare,
      rating: Star,
      yes_no: ToggleLeft,
      date: Calendar,
      number: Hash
    };
    
    return icons[type] || FileQuestion;
  };

  const renderQuestion = (question) => {
    const Icon = getQuestionIcon(question.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {question.type === 'text' && (
            <Input
              placeholder={question.placeholder || "Votre réponse..."}
              value={responses[question.id] || ""}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="text-lg py-3"
            />
          )}

          {question.type === 'textarea' && (
            <Textarea
              placeholder={question.placeholder || "Votre réponse détaillée..."}
              value={responses[question.id] || ""}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="min-h-32 text-lg"
            />
          )}

          {question.type === 'single_choice' && (
            <RadioGroup
              value={responses[question.id] || ""}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label 
                    htmlFor={`${question.id}-${index}`} 
                    className="flex-1 cursor-pointer text-lg"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'multiple_choice' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={(responses[question.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = responses[question.id] || [];
                      if (checked) {
                        handleResponseChange(question.id, [...currentValues, option]);
                      } else {
                        handleResponseChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`${question.id}-${index}`} 
                    className="flex-1 cursor-pointer text-lg"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleResponseChange(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    responses[question.id] === rating
                      ? 'bg-yellow-400 border-yellow-500 text-white'
                      : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          )}

          {question.type === 'yes_no' && (
            <RadioGroup
              value={responses[question.id] || ""}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              className="flex justify-center gap-8"
            >
              <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-green-50 transition-colors">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer text-lg font-medium">
                  Oui
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-red-50 transition-colors">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="cursor-pointer text-lg font-medium">
                  Non
                </Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'date' && (
            <Input
              type="date"
              value={responses[question.id] || ""}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="text-lg py-3"
            />
          )}

          {question.type === 'number' && (
            <Input
              type="number"
              placeholder={question.placeholder || "Entrez un nombre..."}
              value={responses[question.id] || ""}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="text-lg py-3"
            />
          )}
        </div>
      </motion.div>
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Calculer le temps de completion
      const completionTime = Math.round((Date.now() - startTime) / 1000);

      // Détecter les informations de l'appareil
      const deviceInfo = `${navigator.platform} - ${navigator.userAgent.split(' ').slice(-2).join(' ')}`;

      await SurveyResponse.create({
        survey_id: survey.id,
        respondent_id: employee?.id || null,
        respondent_email: survey.anonymous ? null : currentUser.email,
        respondent_name: survey.anonymous ? null : (employee ? `${employee.first_name} ${employee.last_name}` : currentUser.full_name),
        responses: responses,
        completion_time: completionTime,
        device_info: deviceInfo,
        ip_address: "0.0.0.0", // This would ideally be determined server-side for accuracy
        location: employee?.department || "Unknown",
        is_complete: true,
        source: "internal"
      });

      // Mettre à jour le compteur de réponses du sondage
      // This is not atomic and might lead to race conditions in high-concurrency scenarios
      // but for this app's scale, it's likely sufficient.
      const currentResponses = await SurveyResponse.filter({ survey_id: survey.id });
      await Survey.update(survey.id, {
        response_count: currentResponses.length + 1
      });

      setIsSubmitted(true);
      toast({
        title: "✅ Réponse envoyée",
        description: "Merci pour votre participation !",
      });

    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer votre réponse. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = survey?.questions?.length || 0;
  // Progress calculation revised to include the confirmation step
  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0; // Exclude confirmation from question progress

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du sondage...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sondage introuvable</h2>
            <p className="text-gray-600">Ce sondage n'existe pas ou vous n'y avez pas accès.</p>
            <Button 
              onClick={() => window.location.href = createPageUrl("EmployeeSurveys")}
              className="mt-4"
            >
              Retour aux sondages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Merci pour votre participation !</h2>
              <p className="text-lg text-gray-600 mb-6">
                Votre réponse a été enregistrée avec succès. Vos commentaires sont importants pour nous.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-500">
                  Sondage complété par <strong>{employee ? `${employee.first_name} ${employee.last_name}` : currentUser?.full_name}</strong>
                  {employee?.department && (
                    <span> • Département: <strong>{employee.department}</strong></span>
                  )}
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = createPageUrl("EmployeeSurveys")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Retour aux sondages
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <Badge className="bg-emerald-100 text-emerald-800">Sondage Interne</Badge>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{survey.description}</p>
          
          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileQuestion className="w-4 h-4" />
              <span>{survey.questions?.length || 0} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{Math.ceil((survey.questions?.length || 0) * 1.5)} min</span>
            </div>
            {employee?.department && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{employee.department}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Questions */}
              {currentStep < survey.questions.length && (
                renderQuestion(survey.questions[currentStep])
              )}

              {/* Étape de confirmation */}
              {currentStep === survey.questions.length && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Prêt à envoyer ?</h2>
                    <p className="text-gray-600">Vérifiez et confirmez vos réponses</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4">
                    {!survey.anonymous && employee && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Vos informations :</h3>
                        <p><strong>Nom :</strong> {employee.first_name} {employee.last_name}</p>
                        {employee.department && <p><strong>Département :</strong> {employee.department}</p>}
                        {employee.position && <p><strong>Poste :</strong> {employee.position}</p>}
                      </div>
                    )}
                    
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <p className="text-sm text-emerald-800">
                        <strong>Résumé :</strong> Vous avez répondu à {Object.keys(responses).length} question(s) 
                        sur {survey.questions?.length || 0}.
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Envoyer mes réponses
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="text-sm text-gray-500">
                {currentStep < survey.questions.length ? 
                  `Question ${currentStep + 1} sur ${survey.questions.length}` : 
                  `Étape finale`
                }
              </div>

              {currentStep < survey.questions.length && (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!validateCurrentStep()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === survey.questions.length && (
                <div className="w-24" /> // Placeholder to balance layout
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
