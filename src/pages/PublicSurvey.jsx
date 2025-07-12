import React, { useState, useEffect } from "react";
import { Survey, SurveyResponse } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
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
  Building2,
  Globe,
  Users,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function PublicSurvey() {
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [respondentInfo, setRespondentInfo] = useState({
    name: "",
    email: ""
  });
  const [startTime] = useState(Date.now());
  const [validationErrors, setValidationErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadSurvey();
  }, []);

  const loadSurvey = async () => {
    try {
      setIsLoading(true);
      
      const urlParams = new URLSearchParams(window.location.search);
      const surveyLinkId = urlParams.get('id');
      
      if (!surveyLinkId) {
        toast({
          title: "❌ Erreur",
          description: "Lien de sondage invalide",
          variant: "destructive"
        });
        return;
      }

      // CORRECTION: Recherche sans authentification
      try {
        // Utiliser une approche différente sans authentification
        const response = await fetch('/api/survey/public/' + surveyLinkId);
        
        if (!response.ok) {
          // Fallback: essayer de charger directement les sondages
          const allSurveys = await Survey.list();
          const foundSurvey = allSurveys.find(s => s.public_link === surveyLinkId);
          
          if (!foundSurvey) {
            throw new Error("Survey not found");
          }
          
          setSurvey(foundSurvey);
        } else {
          const surveyData = await response.json();
          setSurvey(surveyData);
        }
      } catch (error) {
        console.error("Error loading survey:", error);
        
        // Dernière tentative: essayer avec une approche différente
        try {
          const allSurveys = await Survey.list();
          const foundSurvey = allSurveys.find(s => s.public_link === surveyLinkId);
          
          if (!foundSurvey) {
            toast({
              title: "❌ Sondage introuvable",
              description: "Ce lien de sondage n'existe pas ou a expiré",
              variant: "destructive"
            });
            return;
          }

          if (foundSurvey.status !== 'active') {
            toast({
              title: "⏸️ Sondage non disponible",
              description: "Ce sondage n'est plus actif",
              variant: "destructive"
            });
            return;
          }

          if (foundSurvey.type === 'internal') {
            toast({
              title: "🔒 Accès restreint",
              description: "Ce sondage est réservé aux employés",
              variant: "destructive"
            });
            return;
          }

          setSurvey(foundSurvey);
          
          // Initialiser les réponses vides
          const initialResponses = {};
          foundSurvey.questions?.forEach(question => {
            if (question.type === 'multiple_choice') {
              initialResponses[question.id] = [];
            } else {
              initialResponses[question.id] = '';
            }
          });
          setResponses(initialResponses);

        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          toast({
            title: "❌ Erreur de chargement",
            description: "Impossible de charger le sondage. Veuillez réessayer plus tard.",
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId, value, questionType) => {
    setResponses(prev => {
      const newResponses = { ...prev };
      
      if (questionType === 'multiple_choice') {
        const currentValues = newResponses[questionId] || [];
        if (currentValues.includes(value)) {
          newResponses[questionId] = currentValues.filter(v => v !== value);
        } else {
          newResponses[questionId] = [...currentValues, value];
        }
      } else {
        newResponses[questionId] = value;
      }
      
      return newResponses;
    });

    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    if (!survey) return true;

    const errors = {};
    const questionsPerStep = Math.ceil(survey.questions.length / getStepsCount());
    const startIndex = currentStep * questionsPerStep;
    const endIndex = Math.min(startIndex + questionsPerStep, survey.questions.length);
    const currentQuestions = survey.questions.slice(startIndex, endIndex);

    currentQuestions.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        if (!response || 
            (Array.isArray(response) && response.length === 0) ||
            (typeof response === 'string' && response.trim() === '')) {
          errors[question.id] = 'Cette question est obligatoire';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStepsCount = () => {
    if (!survey?.questions) return 1;
    return Math.max(1, Math.ceil(survey.questions.length / 3));
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, getStepsCount() - 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    const finalErrors = {};
    survey.questions?.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        if (!response || 
            (Array.isArray(response) && response.length === 0) ||
            (typeof response === 'string' && response.trim() === '')) {
          finalErrors[question.id] = 'Cette question est obligatoire';
        }
      }
    });

    if (Object.keys(finalErrors).length > 0) {
      setValidationErrors(finalErrors);
      toast({
        title: "⚠️ Formulaire incomplet",
        description: "Veuillez répondre à toutes les questions obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      
      await SurveyResponse.create({
        survey_id: survey.id,
        respondent_name: survey.anonymous ? null : respondentInfo.name,
        respondent_email: survey.anonymous ? null : respondentInfo.email,
        responses: responses,
        completion_time: completionTime,
        device_info: navigator.userAgent,
        is_complete: true,
        source: 'external'
      });

      setIsCompleted(true);
      
      toast({
        title: "✅ Merci !",
        description: "Votre réponse a été enregistrée avec succès",
      });

    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'enregistrer votre réponse. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const error = validationErrors[question.id];
    
    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`space-y-4 p-6 bg-white rounded-xl border-2 transition-colors ${
          error ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="mt-1">
            Q{survey.questions.indexOf(question) + 1}
          </Badge>
          <div className="flex-1">
            <Label className="text-lg font-semibold text-gray-900 leading-relaxed">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.placeholder && (
              <p className="text-sm text-gray-500 mt-1">{question.placeholder}</p>
            )}
          </div>
        </div>

        <div className="ml-16">
          {renderQuestionInput(question)}
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  };

  const renderQuestionInput = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.type)}
            placeholder={question.placeholder || "Votre réponse..."}
            className="text-base"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.type)}
            placeholder={question.placeholder || "Votre réponse détaillée..."}
            className="min-h-24 text-base"
          />
        );

      case 'single_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleResponseChange(question.id, newValue, question.type)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label 
                  htmlFor={`${question.id}-${index}`} 
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    handleResponseChange(question.id, option, question.type);
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`} 
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating.toString(), question.type)}
                className={`p-2 rounded-lg transition-all ${
                  parseInt(value) >= rating
                    ? 'text-yellow-500 bg-yellow-50 scale-110'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <Star className={`w-8 h-8 ${parseInt(value) >= rating ? 'fill-current' : ''}`} />
              </button>
            ))}
            <span className="ml-3 text-lg font-semibold text-gray-700">
              {value ? `${value}/5` : '0/5'}
            </span>
          </div>
        );

      case 'yes_no':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleResponseChange(question.id, newValue, question.type)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-green-50 transition-colors">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="cursor-pointer text-base font-medium text-green-700">
                ✅ Oui
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-red-50 transition-colors">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="cursor-pointer text-base font-medium text-red-700">
                ❌ Non
              </Label>
            </div>
          </RadioGroup>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.type)}
            className="text-base"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.type)}
            placeholder={question.placeholder || "Entrez un nombre..."}
            className="text-base"
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value, question.type)}
            placeholder="Votre réponse..."
            className="text-base"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du sondage...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sondage introuvable</h3>
            <p className="text-gray-600">Ce lien de sondage n'est pas valide ou a expiré.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Merci !</h3>
              <p className="text-gray-600 mb-4">
                Votre réponse a été enregistrée avec succès.
              </p>
              <Badge className="bg-green-100 text-green-800">
                Sondage terminé
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const questionsPerStep = Math.ceil((survey.questions?.length || 0) / getStepsCount());
  const startIndex = currentStep * questionsPerStep;
  const endIndex = Math.min(startIndex + questionsPerStep, survey.questions?.length || 0);
  const currentQuestions = survey.questions?.slice(startIndex, endIndex) || [];
  const progress = ((currentStep + 1) / getStepsCount()) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête du sondage */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
              <div className="flex items-center justify-center gap-4 mt-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Globe className="w-3 h-3 mr-1" />
                  Sondage public
                </Badge>
                {survey.anonymous && (
                  <Badge className="bg-gray-100 text-gray-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Anonyme
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {survey.description && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{survey.description}</p>
          )}
        </motion.div>

        {/* Barre de progression */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStep + 1} sur {getStepsCount()}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% terminé
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          <AnimatePresence mode="wait">
            {currentQuestions.map((question, index) => (
              renderQuestion(question, index)
            ))}
          </AnimatePresence>
        </div>

        {/* Informations du répondant (si pas anonyme) */}
        {!survey.anonymous && currentStep === getStepsCount() - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Vos informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="respondent-name">Nom complet</Label>
                  <Input
                    id="respondent-name"
                    value={respondentInfo.name}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="respondent-email">Email</Label>
                  <Input
                    id="respondent-email"
                    type="email"
                    value={respondentInfo.email}
                    onChange={(e) => setRespondentInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Boutons de navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="text-sm text-gray-500">
                {survey.questions?.length || 0} questions au total
              </div>

              {currentStep < getStepsCount() - 1 ? (
                <Button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer mes réponses
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}