import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function FinanceReports({ transactions, categories, reports, onRefresh }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Rapports Financiers</h2>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          Générer Rapport
        </Button>
      </div>

      <div className="grid gap-6">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{report.name}</h3>
                      <p className="text-sm text-slate-600">
                        {format(new Date(report.period_start), "dd MMM", { locale: fr })} - {format(new Date(report.period_end), "dd MMM yyyy", { locale: fr })}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span>Revenus: €{report.total_income?.toLocaleString()}</span>
                        <span>Dépenses: €{report.total_expenses?.toLocaleString()}</span>
                        <span className={report.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Bénéfice: €{report.net_profit?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.report_type}</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Aucun rapport généré
              </h3>
              <p className="text-slate-500 mb-6">
                Générez votre premier rapport financier pour analyser vos performances.
              </p>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-700">
                <FileText className="w-4 h-4 mr-2" />
                Générer Rapport
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}