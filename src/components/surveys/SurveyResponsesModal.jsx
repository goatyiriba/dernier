import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  MessageSquare,
  User,
  Clock,
  Calendar,
  Filter,
  Download,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  Users,
  Globe,
  TrendingUp,
  BarChart3,
  FileText,
  Zap,
  Target
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#4F46E5', '#059669', '#DC2626', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444', '#10B981'];

export default function SurveyResponsesModal({ isOpen, onClose, survey, responses, employees }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Filtrage et tri intelligent des réponses
  const filteredResponses = useMemo(() => {
    let filtered = responses.filter(response => {
      // Filtre par terme de recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (response.respondent_name?.toLowerCase().includes(searchLower)) return true;
        if (response.respondent_email?.toLowerCase().includes(searchLower)) return true;
        
        // Recherche dans les réponses
        const hasMatchInResponses = Object.values(response.responses || {}).some(answer => 
          String(answer).toLowerCase().includes(searchLower)
        );
        if (hasMatchInResponses) return true;
        
        return false;
      }
      return true;
    });

    // Filtre par source
    if (filterSource !== "all") {
      filtered = filtered.filter(response => response.source === filterSource);
    }

    // Filtre par statut
    if (filterStatus !== "all") {
      if (filterStatus === "complete") {
        filtered = filtered.filter(response => response.is_complete);
      } else if (filterStatus === "incomplete") {
        filtered = filtered.filter(response => !response.is_complete);
      }
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "oldest":
          return new Date(a.created_date) - new Date(b.created_date);
        case "completion_time":
          return (b.completion_time || 0) - (a.completion_time || 0);
        case "name":
          const nameA = a.respondent_name || a.respondent_email || "Anonyme";
          const nameB = b.respondent_name || b.respondent_email || "Anonyme";
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [responses, searchTerm, filterSource, filterStatus, sortBy]);

  const getRespondentName = (response) => {
    if (survey.anonymous) return "Anonyme";
    if (response.respondent_name) return response.respondent_name;
    
    if (response.respondent_id) {
      const employee = employees.find(emp => emp.id === response.respondent_id);
      if (employee) return `${employee.first_name} ${employee.last_name}`;
    }
    
    return response.respondent_email || "Inconnu";
  };

  const getQuestionById = (questionId) => {
    return survey.questions?.find(q => q.id === questionId);
  };

  const formatAnswer = (question, answer) => {
    if (!question || !answer) return "Pas de réponse";
    
    switch (question.type) {
      case 'rating':
        return (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < parseInt(answer) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="font-medium">{answer}/5</span>
          </div>
        );
      case 'yes_no':
        return (
          <Badge className={answer === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {answer === 'yes' ? '✅ Oui' : '❌ Non'}
          </Badge>
        );
      case 'multiple_choice':
        if (Array.isArray(answer)) {
          return (
            <div className="flex flex-wrap gap-1">
              {answer.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
              ))}
            </div>
          );
        }
        return answer;
      case 'date':
        try {
          return format(parseISO(answer), 'dd MMMM yyyy', { locale: fr });
        } catch {
          return answer;
        }
      default:
        return answer;
    }
  };

  // Génération d'analytics intelligentes
  const generateAnalytics = () => {
    const analytics = {};
    
    survey.questions?.forEach(question => {
      const questionResponses = responses
        .map(r => r.responses[question.id])
        .filter(answer => answer !== undefined && answer !== null && answer !== "");

      switch (question.type) {
        case 'single_choice':
        case 'yes_no':
          const choiceCounts = {};
          questionResponses.forEach(answer => {
            choiceCounts[answer] = (choiceCounts[answer] || 0) + 1;
          });
          analytics[question.id] = {
            type: 'choice',
            data: Object.entries(choiceCounts).map(([name, value]) => ({ 
              name, 
              value,
              percentage: Math.round((value / questionResponses.length) * 100)
            }))
          };
          break;
          
        case 'rating':
          const ratingCounts = {};
          let totalRating = 0;
          questionResponses.forEach(answer => {
            const rating = parseInt(answer);
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
            totalRating += rating;
          });
          analytics[question.id] = {
            type: 'rating',
            data: Object.entries(ratingCounts).map(([name, value]) => ({ 
              name: `${name} étoiles`, 
              value 
            })),
            average: questionResponses.length > 0 ? (totalRating / questionResponses.length) : 0,
            distribution: ratingCounts
          };
          break;
          
        case 'multiple_choice':
          const multiChoiceCounts = {};
          questionResponses.forEach(answer => {
            const choices = Array.isArray(answer) ? answer : [answer];
            choices.forEach(choice => {
              multiChoiceCounts[choice] = (multiChoiceCounts[choice] || 0) + 1;
            });
          });
          analytics[question.id] = {
            type: 'choice',
            data: Object.entries(multiChoiceCounts).map(([name, value]) => ({ 
              name, 
              value,
              percentage: Math.round((value / questionResponses.length) * 100)
            }))
          };
          break;
          
        case 'number':
          const numbers = questionResponses.map(r => Number(r)).filter(n => !isNaN(n));
          analytics[question.id] = {
            type: 'number',
            average: numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0,
            min: numbers.length > 0 ? Math.min(...numbers) : 0,
            max: numbers.length > 0 ? Math.max(...numbers) : 0,
            count: numbers.length
          };
          break;
          
        default:
          analytics[question.id] = {
            type: 'text',
            responses: questionResponses,
            count: questionResponses.length,
            samples: questionResponses.slice(0, 5)
          };
      }
    });
    
    return analytics;
  };

  const analytics = generateAnalytics();

  const toggleDetails = (responseId) => {
    setShowDetails(prev => ({
      ...prev,
      [responseId]: !prev[responseId]
    }));
  };

  const exportResponses = () => {
    const csvContent = [
      // En-têtes
      ['ID', 'Répondant', 'Email', 'Date', 'Temps (s)', 'Source', 'Statut', ...survey.questions.map(q => q.question)],
      // Données
      ...responses.map(response => [
        response.id,
        getRespondentName(response),
        response.respondent_email || '',
        format(parseISO(response.created_date), 'dd/MM/yyyy HH:mm', { locale: fr }),
        response.completion_time || '',
        response.source || '',
        response.is_complete ? 'Terminé' : 'Incomplet',
        ...survey.questions.map(q => {
          const answer = response.responses[q.id];
          return Array.isArray(answer) ? answer.join('; ') : (answer || '');
        })
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reponses_${survey.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
  };

  // Statistiques rapides
  const stats = {
    total: responses.length,
    completed: responses.filter(r => r.is_complete).length,
    external: responses.filter(r => r.source === 'external').length,
    avgTime: responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + (r.completion_time || 0), 0) / responses.length) : 0,
    completionRate: responses.length > 0 ? Math.round((responses.filter(r => r.is_complete).length / responses.length) * 100) : 0
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            Réponses: {survey.title}
            <Badge className="bg-blue-100 text-blue-800">
              {filteredResponses.length} réponse{filteredResponses.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="responses" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Réponses ({responses.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-gray-600">Terminées</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Globe className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{stats.external}</p>
                  <p className="text-xs text-gray-600">Externes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{stats.avgTime}s</p>
                  <p className="text-xs text-gray-600">Temps moy.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtres intelligents */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher par nom, email ou réponse..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes sources</SelectItem>
                      <SelectItem value="internal">Internes</SelectItem>
                      <SelectItem value="external">Externes</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="complete">Terminées</SelectItem>
                      <SelectItem value="incomplete">Incomplètes</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Plus récentes</SelectItem>
                      <SelectItem value="oldest">Plus anciennes</SelectItem>
                      <SelectItem value="completion_time">Temps de réponse</SelectItem>
                      <SelectItem value="name">Nom A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={exportResponses} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Liste des réponses */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredResponses.length > 0 ? (
                <AnimatePresence>
                  {filteredResponses.map((response, index) => (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {survey.anonymous ? '👤' : getRespondentName(response)[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{getRespondentName(response)}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {format(parseISO(response.created_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                    </span>
                                    {response.completion_time && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {response.completion_time}s
                                      </span>
                                    )}
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${response.source === 'external' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}
                                    >
                                      {response.source === 'external' ? '🌐 Externe' : '🏢 Interne'}
                                    </Badge>
                                    {response.is_complete ? (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        ✅ Terminée
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-100 text-amber-800 text-xs">
                                        ⏳ Incomplète
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Aperçu des réponses */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                {survey.questions?.slice(0, 3).map(question => {
                                  const answer = response.responses[question.id];
                                  if (!answer) return null;
                                  
                                  return (
                                    <div key={question.id} className="bg-gray-50 rounded-lg p-3">
                                      <p className="font-medium text-xs text-gray-700 mb-1 truncate">
                                        {question.question}
                                      </p>
                                      <div className="text-sm text-gray-900">
                                        {formatAnswer(question, answer)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDetails(response.id)}
                              className="ml-4"
                            >
                              {showDetails[response.id] ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Masquer
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Détails
                                </>
                              )}
                            </Button>
                          </div>

                          <AnimatePresence>
                            {showDetails[response.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t space-y-4"
                              >
                                <h5 className="font-semibold text-gray-900 mb-3">Toutes les réponses</h5>
                                <div className="grid gap-4">
                                  {survey.questions?.map(question => {
                                    const answer = response.responses[question.id];
                                    
                                    return (
                                      <div key={question.id} className="bg-white border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                          <Badge variant="outline" className="text-xs mt-1">
                                            Q{survey.questions.indexOf(question) + 1}
                                          </Badge>
                                          <div className="flex-1">
                                            <h6 className="font-medium text-gray-900 mb-2">
                                              {question.question}
                                            </h6>
                                            <div className="text-gray-800">
                                              {answer ? formatAnswer(question, answer) : (
                                                <span className="text-gray-400 italic">Pas de réponse</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {searchTerm || filterSource !== "all" || filterStatus !== "all" 
                      ? "Aucune réponse trouvée" 
                      : "Aucune réponse pour le moment"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterSource !== "all" || filterStatus !== "all"
                      ? "Essayez de modifier vos filtres de recherche"
                      : "Les réponses apparaîtront ici une fois que les participants auront répondu"}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Vue d'ensemble */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Vue d'ensemble
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm text-blue-700">Réponses totales</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
                      <p className="text-sm text-green-700">Taux de completion</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{stats.avgTime}s</p>
                      <p className="text-sm text-orange-700">Temps moyen</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{stats.external}</p>
                      <p className="text-sm text-purple-700">Réponses externes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics par question */}
              {survey.questions?.map(question => {
                const questionAnalytics = analytics[question.id];
                if (!questionAnalytics) return null;

                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start gap-3">
                        <Badge variant="outline">Q{survey.questions.indexOf(question) + 1}</Badge>
                        <span className="flex-1">{question.question}</span>
                        <Badge className="bg-gray-100 text-gray-800">
                          {questionAnalytics.count || questionAnalytics.data?.length || 0} réponses
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {questionAnalytics.type === 'choice' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={questionAnalytics.data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({name, percentage}) => `${name} (${percentage}%)`}
                                  >
                                    {questionAnalytics.data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                              {questionAnalytics.data.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded" 
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-lg">{item.value}</span>
                                    <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {questionAnalytics.type === 'rating' && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-6 h-6 ${i < Math.round(questionAnalytics.average) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-2xl font-bold text-yellow-600">
                                {questionAnalytics.average.toFixed(1)}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Note moyenne</p>
                          </div>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={questionAnalytics.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#F59E0B" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {questionAnalytics.type === 'number' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-xl font-bold text-blue-600">
                              {Math.round(questionAnalytics.average * 100) / 100}
                            </p>
                            <p className="text-sm text-blue-700">Moyenne</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-xl font-bold text-green-600">{questionAnalytics.min}</p>
                            <p className="text-sm text-green-700">Minimum</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-xl font-bold text-red-600">{questionAnalytics.max}</p>
                            <p className="text-sm text-red-700">Maximum</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-xl font-bold text-purple-600">{questionAnalytics.count}</p>
                            <p className="text-sm text-purple-700">Réponses</p>
                          </div>
                        </div>
                      )}

                      {questionAnalytics.type === 'text' && (
                        <div className="space-y-3">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{questionAnalytics.count}</p>
                            <p className="text-sm text-blue-700">réponses textuelles</p>
                          </div>
                          {questionAnalytics.samples.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Exemples de réponses
                              </h4>
                              <div className="max-h-48 overflow-y-auto space-y-2">
                                {questionAnalytics.samples.map((sample, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-blue-500">
                                    "{sample}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {Object.keys(analytics).length === 0 && (
                <Card className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune analyse disponible</h3>
                  <p className="text-gray-500">Les analyses apparaîtront une fois que vous aurez des réponses</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}