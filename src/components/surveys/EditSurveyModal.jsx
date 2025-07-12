import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
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
  Save,
  X,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Legal"];

const questionTypes = [
  { value: "text", label: "Texte court", icon: Type },
  { value: "textarea", label: "Texte long", icon: Type },
  { value: "single_choice", label: "Choix unique", icon: List },
  { value: "multiple_choice", label: "Choix multiple", icon: CheckSquare },
  { value: "rating", label: "Notation (1-5)", icon: Star },
  { value: "yes_no", label: "Oui/Non", icon: ToggleLeft },
  { value: "date", label: "Date", icon: Calendar },
  { value: "number", label: "Nombre", icon: Hash }
];

export default function EditSurveyModal({ isOpen, onClose, survey, onSubmit }) {
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

  useEffect(() => {
    if (survey && isOpen) {
      setFormData({
        title: survey.title || "",
        description: survey.description || "",
        type: survey.type || "internal",
        anonymous: survey.anonymous !== undefined ? survey.anonymous : true,
        allow_multiple_submissions: survey.allow_multiple_submissions || false,
        target_departments: survey.target_departments || [],
        questions: survey.questions || [],
        theme: {
          primary_color: survey.theme?.primary_color || "#4F46E5",
          background_color: survey.theme?.background_color || "#FFFFFF",
          logo_url: survey.theme?.logo_url || ""
        }
      });
    }
  }, [survey, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      alert("Veuillez ajouter au moins une question");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error updating survey:", error);
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

  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: "",
      type: "text",
      required: false,
      options: [],
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
              <h2 className="text-2xl font-bold">Modifier le sondage</h2>
              <p className="text-blue-100">{survey?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Informations de base */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Informations de base</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-gray-900 mb-2 block">
                    Titre du sondage *
                  </Label>
                  <Input
                    type="text"
                    placeholder="Titre du sondage"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-gray-900 mb-2 block">
                    Type de sondage
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">🏢 Interne</SelectItem>
                      <SelectItem value="external">🌐 Externe</SelectItem>
                      <SelectItem value="mixed">🔄 Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-gray-900 mb-2 block">
                  Description
                </Label>
                <Textarea
                  placeholder="Description du sondage"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-gray-900">Anonyme</Label>
                      <p className="text-sm text-gray-500">Les réponses ne seront pas associées aux participants</p>
                    </div>
                    <Switch
                      checked={formData.anonymous}
                      onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-gray-900">Réponses multiples</Label>
                      <p className="text-sm text-gray-500">Permettre aux utilisateurs de répondre plusieurs fois</p>
                    </div>
                    <Switch
                      checked={formData.allow_multiple_submissions}
                      onCheckedChange={(checked) => handleInputChange('allow_multiple_submissions', checked)}
                    />
                  </div>
                </div>

                {formData.type === 'internal' && (
                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      Départements ciblés
                    </Label>
                    <p className="text-sm text-gray-500 mb-2">Laisser vide pour cibler tous les employés</p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {departments.map(dept => (
                        <div key={dept} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-${dept}`}
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
                          <Label htmlFor={`edit-${dept}`} className="text-sm">{dept}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xl font-semibold">Questions ({formData.questions.length})</h3>
                <Button
                  onClick={addQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une question
                </Button>
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
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune question ajoutée</p>
                  <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || formData.questions.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}