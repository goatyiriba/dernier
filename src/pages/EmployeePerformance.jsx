
import React, { useState, useEffect } from "react";
import { PerformanceReview, Employee, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Award,
  Target,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  BarChart3,
  Users,
  Building2,
  Filter,
  MessageSquare,
  User as UserIcon,
  Send,
  UserPlus,
  Shield,
  ShieldOff,
  Search,
  Sparkles,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  BookOpen,
  Lightbulb,
  Zap,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import ReviewCard from "../components/performance/ReviewCard";

export default function EmployeePerformance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPeerEvalModal, setShowPeerEvalModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [currentEvalStep, setCurrentEvalStep] = useState(1);
  const [peerEvalData, setPeerEvalData] = useState({
    overall_rating: 3,
    goals_achievement: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    strengths: "",
    areas_for_improvement: "",
    goals_next_period: "",
    employee_comments: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const user = await User.me();
      setCurrentUser(user);

      const [reviewsData, employeesData] = await Promise.all([
        PerformanceReview.list('-review_date'),
        Employee.list()
      ]);

      setReviews(reviewsData);
      setEmployees(employeesData);

      // Trouver l'employe actuel
      const userEmployee = employeesData.find(emp => emp.email === user.email);
      setCurrentEmployee(userEmployee);

    } catch (error) {
      console.error("Error loading performance data:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les donnees de performance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeerEvaluation = async () => {
    try {
      if (!selectedPeer || !currentEmployee) {
        toast({
          title: "❌ Erreur",
          description: "Veuillez selectionner un collegue a evaluer",
          variant: "destructive"
        });
        return;
      }

      // Verifier les champs obligatoires
      if (!peerEvalData.strengths.trim() || !peerEvalData.areas_for_improvement.trim()) {
        toast({
          title: "❌ Champs manquants",
          description: "Veuillez remplir les points forts et axes d'amelioration",
          variant: "destructive"
        });
        return;
      }

      await PerformanceReview.create({
        ...peerEvalData,
        employee_id: selectedPeer.id,
        reviewer_id: isAnonymous ? null : currentUser?.id,
        review_period: `Evaluation collegue ${format(new Date(), 'MM/yyyy')}`,
        review_date: new Date().toISOString().split('T')[0],
        status: "Completed",
        reviewer_name: isAnonymous ? "Evaluation anonyme" : `${currentEmployee.first_name} ${currentEmployee.last_name}`
      });

      toast({
        title: "✅ Evaluation soumise avec succes !",
        description: `Votre evaluation ${isAnonymous ? 'anonyme' : ''} de ${selectedPeer.first_name} ${selectedPeer.last_name} a ete enregistree`,
      });

      // Reset du formulaire
      setShowPeerEvalModal(false);
      setSelectedPeer(null);
      setIsAnonymous(true);
      setCurrentEvalStep(1);
      setPeerEvalData({
        overall_rating: 3,
        goals_achievement: 3,
        communication: 3,
        teamwork: 3,
        leadership: 3,
        strengths: "",
        areas_for_improvement: "",
        goals_next_period: "",
        employee_comments: ""
      });
      setSearchTerm("");
      loadData();
    } catch (error) {
      console.error("Error submitting peer evaluation:", error);
      toast({
        title: "❌ Erreur lors de la soumission",
        description: "Impossible de soumettre l'evaluation. Veuillez reessayer.",
        variant: "destructive"
      });
    }
  };

  const handleViewReview = (review) => {
    console.log("handleViewReview called with:", review);
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'syllacloud@gmail.com';
  
  // Filtrer les evaluations
  const filteredReviews = reviews.filter(review => {
    if (isAdmin) {
      // Admin voit toutes les evaluations
      if (filterDepartment !== "all") {
        const employee = employees.find(emp => emp.id === review.employee_id);
        if (!employee || employee.department !== filterDepartment) {
          return false;
        }
      }
    } else {
      // Employes ne voient que leurs evaluations
      if (!currentEmployee || review.employee_id !== currentEmployee.id) {
        return false;
      }
    }

    if (filterStatus !== "all" && review.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Employe inconnu";
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.department || "N/A";
  };

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const total = filteredReviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0);
    return (total / filteredReviews.length).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Acknowledged': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  // Tous les employes actifs sauf soi-meme
  const availablePeers = employees.filter(emp => 
    emp.status === "Active" && 
    emp.id !== currentEmployee?.id
  ).filter(emp => {
    if (!searchTerm) return true;
    return `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const employeeReviews = filteredReviews;
  const lastReview = employeeReviews[0];
  const averageEmployeeRating = getAverageRating();

  const canProceedToNextStep = () => {
    switch (currentEvalStep) {
      case 1: return selectedPeer !== null;
      case 2: return true; // Ratings ont des valeurs par defaut
      case 3: return peerEvalData.strengths.trim() !== "" && peerEvalData.areas_for_improvement.trim() !== "";
      default: return true;
    }
  };

  const renderEvaluationStep = () => {
    switch (currentEvalStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Evaluation de Collegue</h3>
              <p className="text-gray-600">
                Participez a la culture d'amelioration continue en evaluant vos collegues de maniere constructive
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-amber-800">Conseils pour une evaluation efficace</h4>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• Soyez constructif et bienveillant</li>
                    <li>• Basez-vous sur des faits et observations</li>
                    <li>• Proposez des suggestions d'amelioration concretes</li>
                    <li>• Reconnaissez les forces et accomplissements</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Choisir un collegue a evaluer</h4>
                <Badge className="bg-green-100 text-green-800">
                  {availablePeers.length} collegues disponibles
                </Badge>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Rechercher par nom, poste ou departement</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Ex: Marie, Developpeur, Marketing..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {availablePeers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    {searchTerm ? (
                      <div>
                        <p className="text-lg font-medium">Aucun collegue trouve</p>
                        <p>Essayez de modifier votre recherche</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">Aucun collegue disponible</p>
                        <p>Tous vos collegues ont deja ete evalues recemment</p>
                      </div>
                    )}
                  </div>
                ) : (
                  availablePeers.map(peer => (
                    <Card
                      key={peer.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedPeer?.id === peer.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPeer(peer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {peer.profile_picture ? (
                              <img 
                                src={peer.profile_picture} 
                                alt={`${peer.first_name} ${peer.last_name}`}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-medium text-lg">
                                {peer.first_name?.[0]}{peer.last_name?.[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {peer.first_name} {peer.last_name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{peer.position}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{peer.department}</span>
                              </div>
                            </div>
                          </div>
                          {selectedPeer?.id === peer.id && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-6 h-6 text-blue-500" />
                              <Badge className="bg-blue-100 text-blue-800">Selectionne</Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Evaluation de {selectedPeer?.first_name} {selectedPeer?.last_name}
              </h3>
              <p className="text-gray-600">Evaluez les differents aspects de performance</p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isAnonymous ? (
                      <ShieldOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Shield className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <Label className="text-base font-medium">
                        Evaluation anonyme
                      </Label>
                      <p className="text-sm text-gray-600">
                        {isAnonymous 
                          ? "Votre identite ne sera pas revelee" 
                          : "Votre nom apparaitra dans l'evaluation"
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {[
                { 
                  key: 'overall_rating', 
                  label: 'Evaluation generale', 
                  icon: Star, 
                  description: 'Performance globale du collegue',
                  color: 'text-yellow-600'
                },
                { 
                  key: 'goals_achievement', 
                  label: 'Atteinte des objectifs', 
                  icon: Target, 
                  description: 'Capacite a atteindre les objectifs fixes',
                  color: 'text-green-600'
                },
                { 
                  key: 'communication', 
                  label: 'Communication', 
                  icon: MessageSquare, 
                  description: 'Clarte et efficacite dans la communication',
                  color: 'text-blue-600'
                },
                { 
                  key: 'teamwork', 
                  label: 'Travail d\'equipe', 
                  icon: Users, 
                  description: 'Collaboration et esprit d\'equipe',
                  color: 'text-purple-600'
                },
                { 
                  key: 'leadership', 
                  label: 'Leadership', 
                  icon: TrendingUp, 
                  description: 'Capacite a guider et inspirer',
                  color: 'text-indigo-600'
                }
              ].map(({ key, label, icon: Icon, description, color }) => (
                <Card key={key} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gray-50`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                          {peerEvalData[key]}/5
                        </Badge>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= peerEvalData[key] 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={peerEvalData[key]}
                        onChange={(e) => setPeerEvalData(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(peerEvalData[key] - 1) * 25}%, #e5e7eb ${(peerEvalData[key] - 1) * 25}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1 - A ameliorer</span>
                        <span>2 - Insuffisant</span>
                        <span>3 - Satisfaisant</span>
                        <span>4 - Bon</span>
                        <span>5 - Excellent</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Commentaires detailles</h3>
              <p className="text-gray-600">Partagez vos observations et suggestions</p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <Label htmlFor="strengths" className="text-lg font-semibold text-gray-900">
                        Points forts *
                      </Label>
                      <p className="text-sm text-gray-600">
                        Decrivez les principales forces et reussites de votre collegue
                      </p>
                    </div>
                  </div>
                  <Textarea
                    id="strengths"
                    placeholder="Exemple: Excellente capacite d'ecoute, toujours disponible pour aider, gestion efficace des projets..."
                    value={peerEvalData.strengths}
                    onChange={(e) => setPeerEvalData(prev => ({
                      ...prev,
                      strengths: e.target.value
                    }))}
                    className="h-32 resize-none"
                    required
                  />
                  <div className="text-xs text-gray-500">
                    {peerEvalData.strengths.length}/500 caracteres
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="areas_for_improvement" className="text-lg font-semibold text-gray-900">
                        Axes d'amelioration *
                      </Label>
                      <p className="text-sm text-gray-600">
                        Identifiez les domaines ou votre collegue pourrait s'ameliorer
                      </p>
                    </div>
                  </div>
                  <Textarea
                    id="areas_for_improvement"
                    placeholder="Exemple: Pourrait ameliorer la communication ecrite, gagnerait a deleguer davantage..."
                    value={peerEvalData.areas_for_improvement}
                    onChange={(e) => setPeerEvalData(prev => ({
                      ...prev,
                      areas_for_improvement: e.target.value
                    }))}
                    className="h-32 resize-none"
                    required
                  />
                  <div className="text-xs text-gray-500">
                    {peerEvalData.areas_for_improvement.length}/500 caracteres
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <Label htmlFor="goals_next_period" className="text-lg font-semibold text-gray-900">
                        Suggestions pour la periode suivante
                      </Label>
                      <p className="text-sm text-gray-600">
                        Proposez des objectifs ou axes de developpement
                      </p>
                    </div>
                  </div>
                  <Textarea
                    id="goals_next_period"
                    placeholder="Exemple: Prendre en charge un projet plus important, suivre une formation en leadership..."
                    value={peerEvalData.goals_next_period}
                    onChange={(e) => setPeerEvalData(prev => ({
                      ...prev,
                      goals_next_period: e.target.value
                    }))}
                    className="h-24 resize-none"
                  />
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <Label htmlFor="employee_comments" className="text-lg font-semibold text-gray-900">
                        Commentaires additionnels
                      </Label>
                      <p className="text-sm text-gray-600">
                        Toute autre information que vous souhaitez partager
                      </p>
                    </div>
                  </div>
                  <Textarea
                    id="employee_comments"
                    placeholder="Exemple: Merci pour votre collaboration, j'apprecie travailler avec vous..."
                    value={peerEvalData.employee_comments}
                    onChange={(e) => setPeerEvalData(prev => ({
                      ...prev,
                      employee_comments: e.target.value
                    }))}
                    className="h-24 resize-none"
                  />
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                {isAdmin ? 'Gestion des Performances' : 'Mes Evaluations'}
              </h1>
              <p className="text-xl text-purple-100 font-medium">
                {isAdmin 
                  ? 'Consultez les evaluations de performance de votre equipe'
                  : 'Consultez vos evaluations et evaluez vos collegues'
                }
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Note moyenne: {averageEmployeeRating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{filteredReviews.length} evaluation{filteredReviews.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isAdmin && (
                <Button 
                  onClick={() => setShowPeerEvalModal(true)}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Evaluer un collegue
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isAdmin ? (
            <>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{filteredReviews.length}</p>
                      <p className="text-sm text-gray-500">Evaluations totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredReviews.filter(r => r.status === 'Completed').length}
                      </p>
                      <p className="text-sm text-gray-500">Terminees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredReviews.filter(r => r.status === 'Draft').length}
                      </p>
                      <p className="text-sm text-gray-500">En cours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{averageEmployeeRating}</p>
                      <p className="text-sm text-gray-500">Note moyenne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{employeeReviews.length}</p>
                      <p className="text-sm text-gray-500">Mes evaluations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{averageEmployeeRating}</p>
                      <p className="text-sm text-gray-500">Note moyenne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{availablePeers.length}</p>
                      <p className="text-sm text-gray-500">Collegues a evaluer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {lastReview ? format(parseISO(lastReview.review_date), 'dd/MM/yyyy') : 'Aucune'}
                      </p>
                      <p className="text-sm text-gray-500">Derniere evaluation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filtres (uniquement pour admin) */}
        {isAdmin && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtres:</span>
                </div>
                
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les departements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les departements</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Draft">Brouillon</SelectItem>
                    <SelectItem value="Completed">Termine</SelectItem>
                    <SelectItem value="Acknowledged">Valide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des evaluations */}
        <div className="space-y-6">
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
          ) : filteredReviews.length > 0 ? (
            <AnimatePresence>
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ReviewCard 
                    review={review} 
                    employeeName={getEmployeeName(review.employee_id)}
                    employeeDepartment={getEmployeeDepartment(review.employee_id)}
                    isAdmin={isAdmin}
                    onView={handleViewReview}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {isAdmin ? 'Aucune evaluation trouvee' : 'Aucune evaluation disponible'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isAdmin 
                    ? 'Les evaluations apparaitront ici une fois creees par les employes.'
                    : 'Vous n\'avez pas encore d\'evaluations. Vous pouvez evaluer vos collegues.'
                  }
                </p>
                {!isAdmin && (
                  <Button
                    onClick={() => setShowPeerEvalModal(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Evaluer un collegue
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal evaluation de collegue */}
      <Dialog open={showPeerEvalModal} onOpenChange={setShowPeerEvalModal}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              Evaluation de Collegue
              <Badge className="bg-purple-100 text-purple-700">
                Etape {currentEvalStep}/3
              </Badge>
            </DialogTitle>
            <Progress value={(currentEvalStep / 3) * 100} className="h-2 mt-4" />
          </DialogHeader>

          <div className="py-6">
            {renderEvaluationStep()}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPeerEvalModal(false);
                  setSelectedPeer(null);
                  setCurrentEvalStep(1);
                  setSearchTerm("");
                }}
              >
                Annuler
              </Button>
              {currentEvalStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentEvalStep(currentEvalStep - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Precedent
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {currentEvalStep < 3 ? (
                <Button
                  onClick={() => setCurrentEvalStep(currentEvalStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePeerEvaluation}
                  disabled={!canProceedToNextStep()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre l'evaluation
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de visualisation */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Details de l'evaluation
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6 py-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900">Employe</h4>
                      <p className="text-gray-600">{getEmployeeName(selectedReview.employee_id)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Evaluateur</h4>
                      <p className="text-gray-600">
                        {selectedReview.reviewer_name || (selectedReview.reviewer_id ? getEmployeeName(selectedReview.reviewer_id) : "Anonyme")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Periode</h4>
                      <p className="text-gray-600">{selectedReview.review_period}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Date</h4>
                      <p className="text-gray-600">
                        {format(parseISO(selectedReview.review_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Evaluations</h4>
                    <div className="grid gap-3">
                      {[
                        { key: 'overall_rating', label: 'Evaluation generale' },
                        { key: 'goals_achievement', label: 'Atteinte des objectifs' },
                        { key: 'communication', label: 'Communication' },
                        { key: 'teamwork', label: 'Travail d\'equipe' },
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
                                    star <= selectedReview[key] ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline">{selectedReview[key]}/5</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(selectedReview.strengths || selectedReview.areas_for_improvement || selectedReview.goals_next_period || selectedReview.employee_comments) && (
                    <div className="space-y-4 mt-6 pt-6 border-t">
                      {selectedReview.strengths && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Points forts</h4>
                          <p className="text-gray-600 text-sm">{selectedReview.strengths}</p>
                        </div>
                      )}
                      {selectedReview.areas_for_improvement && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Axes d'amelioration</h4>
                          <p className="text-gray-600 text-sm">{selectedReview.areas_for_improvement}</p>
                        </div>
                      )}
                      {selectedReview.goals_next_period && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Objectifs prochaine periode</h4>
                          <p className="text-gray-600 text-sm">{selectedReview.goals_next_period}</p>
                        </div>
                      )}
                      {selectedReview.employee_comments && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Commentaires</h4>
                          <p className="text-gray-600 text-sm">{selectedReview.employee_comments}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <Badge className={getStatusColor(selectedReview.status)}>
                      {selectedReview.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
