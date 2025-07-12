import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function BudgetOverview({ budgets, transactions, categories, onRefresh }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Aperçu des Budgets</h2>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Budget
        </Button>
      </div>

      <div className="grid gap-6">
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      {budget.name}
                    </CardTitle>
                    <Badge variant="outline" className={
                      budget.status === 'active' ? 'border-green-500 text-green-700' :
                      budget.status === 'exceeded' ? 'border-red-500 text-red-700' :
                      'border-gray-500 text-gray-700'
                    }>
                      {budget.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-slate-600">
                    Période: {budget.period_start} - {budget.period_end}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Budget Total</span>
                      <span className="font-bold text-lg">€{budget.total_budget?.toLocaleString()}</span>
                    </div>
                    
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Dépensé: €{(budget.total_budget * 0.75)?.toLocaleString()}</span>
                      <span>Restant: €{(budget.total_budget * 0.25)?.toLocaleString()}</span>
                    </div>
                  </div>

                  {budget.categories && budget.categories.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Répartition par catégorie</h4>
                      <div className="space-y-2">
                        {budget.categories.slice(0, 3).map((cat, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>Catégorie {index + 1}</span>
                            <span>€{cat.allocated_amount?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Aucun budget configuré
              </h3>
              <p className="text-slate-500 mb-6">
                Créez votre premier budget pour suivre vos dépenses par catégorie.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer un Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}