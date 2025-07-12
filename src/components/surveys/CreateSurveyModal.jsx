import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Type,
  List,
  CheckSquare,
  Star,
  ToggleLeft,
  Calendar,
  Hash,
  ArrowLeft,
  ArrowRight,
  Palette,
  Settings,
  Eye,
  Sparkles,
  Target,
  Zap,
  X,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"];

const questionTypes = [
  { value: "text", label: "Texte court", icon: Type, description: "Réponse courte en une ligne" },
  { value: "textarea", label: "Texte long", icon: Type, description: "Réponse détaillée sur plusieurs lignes" },
  { value: "single_choice", label: "Choix unique", icon: List, description: "Une seule option parmi plusieurs" },
  { value: "multiple_choice", label: "Choix multiple", icon: CheckSquare, description: "Plusieurs options possibles" },
  { value: "rating", label: "Notation (1-5)", icon: Star, description: "Évaluation avec des étoiles" },
  { value: "yes_no", label: "Oui/Non", icon: ToggleLeft, description: "Réponse binaire simple" },
  { value: "date", label: "Date", icon: Calendar, description: "Sélection d'une date" },
  { value: "number", label: "Nombre", icon: Hash, description: "Valeur numérique" }
];

const STEPS = {
  BASIC_INFO: 0,
  QUESTIONS: 1,
  SETTINGS: 2,
  PREVIEW: 3
};

export default function CreateSurveyModal({ isOpen, onClose, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "internal",
    anonymous: true,
    allow_multiple_submissions: false,
    target_departments: [],
    questions: [],
    theme: {
      primary_color: "#4F46E5",
      background_color: "#FFFFFF",
      logo_url: ""
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (formData.questions.length === 0) {
      alert("Veuillez ajouter au moins une question");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "internal",
        anonymous: true,
        allow_multiple_submissions: false,
        target_departments: [],
        questions: [],
        theme: {
          primary_color: "#4F46E5",
          background_color: "#FFFFFF",
          logo_url: ""
        }
      });
      setCurrentStep(STEPS.BASIC_INFO);
    } catch (error) {
      console.error("Error saving survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addQuestion = (type = "text") => {
    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: "",
      type: type,
      required: false,
      options: type === 'single_choice' || type === 'multiple_choice' ? ["Option 1", "Option 2"] : [],
      placeholder: ""
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionId) => {
    const questionToDuplicate = formData.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: `${questionToDuplicate.question} (copie)`
      };
      
      const questionIndex = formData.questions.findIndex(q => q.id === questionId);
      setFormData(prev => ({
        ...prev,
        questions: [
          ...prev.questions.slice(0, questionIndex + 1),
          duplicatedQuestion,
          ...prev.questions.slice(questionIndex + 1)
        ]
      }));
    }
  };

  const addOption = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...(q.options || []), `Option ${(q.options || []).length + 1}`] }
          : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
            }
          : q
      )
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      )
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return formData.title.trim() !== "" && formData.description.trim() !== "";
      case STEPS.QUESTIONS:
        return formData.questions.length > 0 && formData.questions.every(q => q.question.trim() !== "");
      case STEPS.SETTINGS:
        return true;
      case STEPS.PREVIEW:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Créer un nouveau sondage</h2>
              <p className="text-blue-100">Étape {currentStep + 1} sur {Object.keys(STEPS).length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-b bg-gray-50">
          <Progress value={((currentStep + 1) / Object.keys(STEPS).length) * 100} className="h-2" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Étape 1: Informations de base */}
            {currentStep === STEPS.BASIC_INFO && (
              <motion.div
                key="basic-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations de base</h3>
                  <p className="text-gray-600">Commençons par définir votre sondage</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      Titre du sondage *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ex: Satisfaction client, Évaluation des formations..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Expliquez l'objectif de votre sondage et son contexte..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="text-base min-h-24"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-3 block">
                      Type de sondage
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: 'internal', icon: '🏢', title: 'Interne', desc: 'Réservé aux employés de votre organisation' },
                        { value: 'external', icon: '🌐', title: 'Externe', desc: 'Accessible via un lien public' },
                        { value: 'mixed', icon: '🔄', title: 'Mixte', desc: 'Employés + participants externes' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          onClick={() => handleInputChange('type', type.value)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{type.title}</div>
                              <div className="text-sm text-gray-600">{type.desc}</div>
                            </div>
                            {formData.type === type.value && (
                              <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Questions */}
            {currentStep === STEPS.QUESTIONS && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <List className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Questions du sondage</h3>
                  <p className="text-gray-600">Ajoutez les questions que vous souhaitez poser</p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold">Questions ({formData.questions.length})</h4>
                  <div className="flex gap-2">
                    {questionTypes.slice(0, 4).map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Button
                          key={type.value}
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(type.value)}
                          className="flex items-center gap-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {formData.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-2 border-gray-200 rounded-xl p-4 space-y-4 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <Badge variant="outline">Q{index + 1}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateQuestion(question.id)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Input
                            type="text"
                            placeholder="Écrivez votre question..."
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                            className="font-medium"
                          />
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {questionTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                              className="rounded"
                            />
                            <Label className="text-sm">Obligatoire</Label>
                          </div>
                        </div>

                        {(question.type === 'text' || question.type === 'textarea' || question.type === 'number') && (
                          <Input
                            type="text"
                            placeholder="Texte d'aide (optionnel)"
                            value={question.placeholder}
                            onChange={(e) => updateQuestion(question.id, 'placeholder', e.target.value)}
                            className="text-sm"
                          />
                        )}

                        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Options de réponse</Label>
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              className="w-full border-dashed"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter une option
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {formData.questions.length === 0 && (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">Aucune question ajoutée</h4>
                    <p className="text-sm mb-4">Commencez par ajouter votre première question</p>
                    <Button onClick={() => addQuestion()} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une question
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 3: Paramètres */}
            {currentStep === STEPS.SETTINGS && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Paramètres avancés</h3>
                  <p className="text-gray-600">Configurez les options de votre sondage</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-semibold">Options de confidentialité</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Sondage anonyme</Label>
                          <p className="text-sm text-gray-500">Les réponses ne seront pas associées aux participants</p>
                        </div>
                        <Switch
                          checked={formData.anonymous}
                          onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Réponses multiples</Label>
                          <p className="text-sm text-gray-500">Permettre aux utilisateurs de répondre plusieurs fois</p>
                        </div>
                        <Switch
                          checked={formData.allow_multiple_submissions}
                          onCheckedChange={(checked) => handleInputChange('allow_multiple_submissions', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {formData.type === 'internal' && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Départements ciblés</h4>
                        <p className="text-sm text-gray-500 mb-4">Laisser vide pour cibler tous les employés</p>
                        <div className="grid grid-cols-2 gap-3">
                          {departments.map(dept => (
                            <div key={dept} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={dept}
                                checked={formData.target_departments.includes(dept)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleInputChange('target_departments', [...formData.target_departments, dept]);
                                  } else {
                                    handleInputChange('target_departments', formData.target_departments.filter(d => d !== dept));
                                  }
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={dept} className="text-sm">{dept}</Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(formData.type === 'external' || formData.type === 'mixed') && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Personnalisation</h4>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Couleur principale</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="color"
                                value={formData.theme.primary_color}
                                onChange={(e) => handleInputChange('theme.primary_color', e.target.value)}
                                className="w-16 h-10"
                              />
                              <Input
                                type="text"
                                value={formData.theme.primary_color}
                                onChange={(e) => handleInputChange('theme.primary_color', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Étape 4: Aperçu */}
            {currentStep === STEPS.PREVIEW && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Aperçu et validation</h3>
                  <p className="text-gray-600">Vérifiez votre sondage avant de le créer</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-xl font-bold mb-2">{formData.title}</h4>
                      <p className="text-gray-600 mb-4">{formData.description}</p>
                      
                      <div className="flex gap-2 mb-6">
                        <Badge className="bg-blue-100 text-blue-800">
                          {formData.type === 'internal' ? '🏢 Interne' : formData.type === 'external' ? '🌐 Externe' : '🔄 Mixte'}
                        </Badge>
                        {formData.anonymous && (
                          <Badge className="bg-gray-100 text-gray-800">🔒 Anonyme</Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-medium">Questions ({formData.questions.length})</h5>
                        {formData.questions.map((question, index) => (
                          <div key={question.id} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              {question.required && <Badge className="bg-red-100 text-red-800 text-xs">Obligatoire</Badge>}
                            </div>
                            <p className="font-medium">{question.question}</p>
                            <p className="text-sm text-gray-500">Type: {questionTypes.find(t => t.value === question.type)?.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < Object.keys(STEPS).length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(Object.keys(STEPS).length - 1, currentStep + 1))}
              disabled={!canProceed()}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer le sondage
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}