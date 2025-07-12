import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  BarChart3,
  Users,
  TrendingUp,
  MessageSquare,
  Download,
  Eye,
  Clock,
  Star
} from "lucide-react";
import { format } from "date-fns";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function SurveyAnalytics({ survey, responses, onClose }) {
  if (!survey) return null;

  // Analyser les réponses
  const analysisData = analyzeResponses(survey, responses);

  return (
    <Dialog open={!!survey} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics - {survey.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{responses.length}</p>
                <p className="text-sm text-gray-600">Réponses totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(analysisData.completionRate)}%
                </p>
                <p className="text-sm text-gray-600">Taux de completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(analysisData.avgCompletionTime)}s
                </p>
                <p className="text-sm text-gray-600">Temps moyen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {analysisData.uniqueRespondents}
                </p>
                <p className="text-sm text-gray-600">Répondants uniques</p>
              </CardContent>
            </Card>
          </div>

          {/* Analyse par question */}
          <div className="space-y-6">
            {survey.questions?.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}: {question.question}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{question.type}</Badge>
                    {question.required && <Badge>Obligatoire</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {renderQuestionAnalysis(question, responses, analysisData.questionAnalysis[question.id])}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function analyzeResponses(survey, responses) {
  const completed = responses.filter(r => r.is_complete);
  const completionRate = responses.length > 0 ? (completed.length / responses.length) * 100 : 0;
  
  const avgCompletionTime = completed.length > 0 
    ? completed.reduce((sum, r) => sum + (r.completion_time || 0), 0) / completed.length 
    : 0;

  const uniqueRespondents = new Set(
    responses.map(r => r.respondent_email || r.respondent_id).filter(Boolean)
  ).size;

  const questionAnalysis = {};
  
  survey.questions?.forEach(question => {
    const questionResponses = responses
      .map(r => r.responses[question.id])
      .filter(r => r !== undefined && r !== null && r !== "");

    questionAnalysis[question.id] = {
      responseCount: questionResponses.length,
      responseRate: responses.length > 0 ? (questionResponses.length / responses.length) * 100 : 0,
      data: analyzeQuestionData(question, questionResponses)
    };
  });

  return {
    completionRate,
    avgCompletionTime,
    uniqueRespondents,
    questionAnalysis
  };
}

function analyzeQuestionData(question, responses) {
  switch (question.type) {
    case 'single_choice':
    case 'yes_no':
      const counts = responses.reduce((acc, response) => {
        acc[response] = (acc[response] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(counts).map(([option, count]) => ({
        name: option,
        value: count,
        percentage: Math.round((count / responses.length) * 100)
      }));

    case 'multiple_choice':
      const allOptions = responses.flat();
      const optionCounts = allOptions.reduce((acc, option) => {
        acc[option] = (acc[option] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(optionCounts).map(([option, count]) => ({
        name: option,
        value: count,
        percentage: Math.round((count / allOptions.length) * 100)
      }));

    case 'rating':
      const ratingCounts = responses.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});
      
      const avgRating = responses.length > 0 
        ? responses.reduce((sum, r) => sum + Number(r), 0) / responses.length 
        : 0;

      return {
        distribution: Object.entries(ratingCounts).map(([rating, count]) => ({
          name: `${rating} étoile${rating > 1 ? 's' : ''}`,
          value: count
        })),
        average: Math.round(avgRating * 10) / 10
      };

    case 'number':
      const numbers = responses.map(r => Number(r)).filter(n => !isNaN(n));
      const avg = numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
      const min = numbers.length > 0 ? Math.min(...numbers) : 0;
      const max = numbers.length > 0 ? Math.max(...numbers) : 0;

      return { average: avg, min, max, count: numbers.length };

    default:
      return {
        samples: responses.slice(0, 5),
        totalResponses: responses.length
      };
  }
}

function renderQuestionAnalysis(question, responses, analysis) {
  if (!analysis) return null;

  switch (question.type) {
    case 'single_choice':
    case 'yes_no':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analysis.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, percentage}) => `${name} (${percentage}%)`}
                  >
                    {analysis.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {analysis.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{item.value}</span>
                    <span className="text-sm text-gray-500 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'rating':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold">{analysis.data.average}</span>
              <span className="text-gray-500">/ 5</span>
            </div>
            <Badge>Moyenne générale</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analysis.data.distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'number':
      return (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{Math.round(analysis.data.average * 100) / 100}</p>
              <p className="text-sm text-gray-600">Moyenne</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{analysis.data.min}</p>
              <p className="text-sm text-gray-600">Minimum</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{analysis.data.max}</p>
              <p className="text-sm text-gray-600">Maximum</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{analysis.data.count}</p>
              <p className="text-sm text-gray-600">Réponses</p>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {analysis.data.totalResponses} réponse(s) reçue(s)
          </p>
          {analysis.data.samples.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Exemples de réponses:</h4>
              <div className="space-y-2">
                {analysis.data.samples.map((sample, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {sample}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
  }
}