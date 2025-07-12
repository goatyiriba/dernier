
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Star,
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Mail,
  Briefcase,
  Target,
  TrendingUp,
  MessageSquare,
  Users,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = {
  SELECT_EMPLOYEE: 0,
  REVIEW_INFO: 1,
  RATINGS: 2,
  FEEDBACK: 3,
  PREVIEW: 4
};

const STEP_TITLES = {
  [STEPS.SELECT_EMPLOYEE]: "Sélection de l'employé",
  [STEPS.REVIEW_INFO]: "Informations de l'évaluation",
  [STEPS.RATINGS]: "Évaluations et notes",
  [STEPS.FEEDBACK]: "Commentaires détaillés", 
  [STEPS.PREVIEW]: "Aperçu et validation"
};

export default function CreateReviewModal({ isOpen, onClose, onSubmit, employees, currentUser }) {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_EMPLOYEE);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [formData, setFormData] = useState({
    employee_id: "",
    review_period: "",
    review_date: new Date().toISOString().split('T')[0],
    overall_rating: 3,
    goals_achievement: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    strengths: "",
    areas_for_improvement: "",
    goals_next_period: "",
    status: "Draft"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // S'assurer que reviewer_id est défini
      const reviewDataWithReviewer = {
        ...formData,
        reviewer_id: currentUser?.id || null
      };
      
      await onSubmit(reviewDataWithReviewer);
      handleClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(STEPS.SELECT_EMPLOYEE);
    setFormData({
      employee_id: "",
      review_period: "",
      review_date: new Date().toISOString().split('T')[0],
      overall_rating: 3,
      goals_achievement: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3,
      strengths: "",
      areas_for_improvement: "",
      goals_next_period: "",
      status: "Draft"
    });
    setSearchTerm("");
    setSelectedDepartment("all");
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case STEPS.SELECT_EMPLOYEE:
        return formData.employee_id !== "";
      case STEPS.REVIEW_INFO:
        return formData.review_period !== "" && formData.review_date !== "";
      case STEPS.RATINGS:
        return true; // Les ratings ont des valeurs par défaut
      case STEPS.FEEDBACK:
        return formData.strengths !== "" && formData.areas_for_improvement !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < STEPS.PREVIEW) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > STEPS.SELECT_EMPLOYEE) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  // Filtrer les employés
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment && employee.status === "Active";
  });

  // Grouper par département
  const employeesByDepartment = filteredEmployees.reduce((acc, employee) => {
    const dept = employee.department || "Sans département";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(employee);
    return acc;
  }, {});

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.SELECT_EMPLOYEE:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Rechercher un employé</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Nom, email ou poste..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Département</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les départements</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.keys(employeesByDepartment).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun employé trouvé</p>
                </div>
              ) : (
                Object.entries(employeesByDepartment).map(([department, departmentEmployees]) => (
                  <div key={department} className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <h4 className="font-semibold text-gray-700">{department}</h4>
                      <Badge variant="outline" className="text-xs">
                        {departmentEmployees.length}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2">
                      {departmentEmployees.map(employee => (
                        <Card
                          key={employee.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            formData.employee_id === employee.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleInputChange('employee_id', employee.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                {employee.profile_picture ? (
                                  <img 
                                    src={employee.profile_picture} 
                                    alt={`${employee.first_name} ${employee.last_name}`}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-white font-medium text-sm">
                                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Briefcase className="w-3 h-3" />
                                  <span>{employee.position}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{employee.email}</span>
                                </div>
                              </div>
                              {formData.employee_id === employee.id && (
                                <Check className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      case STEPS.REVIEW_INFO:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {selectedEmployee && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {selectedEmployee.profile_picture ? (
                        <img 
                          src={selectedEmployee.profile_picture} 
                          alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedEmployee.first_name} {selectedEmployee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="review_period">Période d'évaluation *</Label>
                <Input
                  id="review_period"
                  placeholder="ex: Q1 2024, Annuel 2024"
                  value={formData.review_period}
                  onChange={(e) => handleInputChange('review_period', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_date">Date d'évaluation *</Label>
                <Input
                  id="review_date"
                  type="date"
                  value={formData.review_date}
                  onChange={(e) => handleInputChange('review_date', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case STEPS.RATINGS:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {[
                { key: 'overall_rating', label: 'Évaluation générale', icon: Star },
                { key: 'goals_achievement', label: 'Atteinte des objectifs', icon: Target },
                { key: 'communication', label: 'Communication', icon: MessageSquare },
                { key: 'teamwork', label: 'Travail d\'équipe', icon: Users },
                { key: 'leadership', label: 'Leadership', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <Card key={key} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <Label className="text-base font-medium">{label}</Label>
                    </div>
                    <Badge variant="outline" className="text-lg font-semibold">
                      {formData[key]}/5
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 - Insuffisant</span>
                      <span>3 - Satisfaisant</span>
                      <span>5 - Excellent</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case STEPS.FEEDBACK:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="strengths">Points forts *</Label>
              <Textarea
                id="strengths"
                placeholder="Décrivez les principales forces et réussites de l'employé..."
                value={formData.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                className="h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areas_for_improvement">Axes d'amélioration *</Label>
              <Textarea
                id="areas_for_improvement"
                placeholder="Identifiez les domaines où l'employé peut s'améliorer..."
                value={formData.areas_for_improvement}
                onChange={(e) => handleInputChange('areas_for_improvement', e.target.value)}
                className="h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals_next_period">Objectifs pour la prochaine période</Label>
              <Textarea
                id="goals_next_period"
                placeholder="Définissez les objectifs et attentes pour la période suivante..."
                value={formData.goals_next_period}
                onChange={(e) => handleInputChange('goals_next_period', e.target.value)}
                className="h-32"
              />
            </div>
          </motion.div>
        );

      case STEPS.PREVIEW:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Aperçu de l'évaluation</h3>
                
                {selectedEmployee && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Employé évalué</h4>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900">Période</h4>
                    <p className="text-gray-600">{formData.review_period}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Date</h4>
                    <p className="text-gray-600">{formData.review_date}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Évaluations</h4>
                  <div className="grid gap-3">
                    {[
                      { key: 'overall_rating', label: 'Évaluation générale' },
                      { key: 'goals_achievement', label: 'Atteinte des objectifs' },
                      { key: 'communication', label: 'Communication' },
                      { key: 'teamwork', label: 'Travail d\'équipe' },
                      { key: 'leadership', label: 'Leadership' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= formData[key] ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline">{formData[key]}/5</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Points forts</h4>
                    <p className="text-gray-600 text-sm">{formData.strengths || "Non renseigné"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Axes d'amélioration</h4>
                    <p className="text-gray-600 text-sm">{formData.areas_for_improvement || "Non renseigné"}</p>
                  </div>
                  {formData.goals_next_period && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Objectifs prochaine période</h4>
                      <p className="text-gray-600 text-sm">{formData.goals_next_period}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">
            Créer une Évaluation de Performance
          </DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Étape {currentStep + 1} sur {Object.keys(STEPS).length}</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">{STEP_TITLES[currentStep]}</p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === STEPS.SELECT_EMPLOYEE}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            
            {currentStep === STEPS.PREVIEW ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>Création...</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Créer l'évaluation
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
