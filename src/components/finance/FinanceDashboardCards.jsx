
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet,
  Globe,
  Target,
  PiggyBank,
  Receipt,
  Building2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase,
  Users,
  ShoppingCart,
  Banknote,
  Calculator,
  Eye,
  BarChart3,
  LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { CurrencyService } from "../services/CurrencyService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from "recharts";

const COLORS = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#10B981'];

export default function FinanceDashboardCards({ 
  data, 
  isLoading, 
  selectedPeriod, 
  onPeriodChange 
}) {
  const formatCurrency = (amount) => CurrencyService.formatAmount(amount, 'XOF');
  
  const getPeriodLabel = (period) => {
    const labels = {
      current_month: 'Mois Actuel',
      last_month: 'Mois Dernier', 
      last_3_months: '3 Derniers Mois',
      current_year: 'Année Actuelle'
    };
    return labels[period] || 'Période';
  };

  // Calculs avancés
  const totalExpenses = data.totalExpenses || 0;
  const totalIncome = data.totalIncome || 0;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
  const burnRate = totalExpenses / 30; // Burn rate quotidien
  const runway = netProfit > 0 ? Math.floor(netProfit / burnRate) : 0;

  // Analyse catégorielle intelligente
  const investmentsReceived = data.categoryBreakdown['Investissements']?.amount || 0;
  const salaryExpenses = data.categoryBreakdown['Salaires']?.amount || 0;
  const marketingSpend = data.categoryBreakdown['Marketing']?.amount || 0;
  const equipmentCosts = data.categoryBreakdown['Équipement']?.amount || 0;
  const operationalTotal = marketingSpend + equipmentCosts + (data.categoryBreakdown['Formation']?.amount || 0) + (data.categoryBreakdown['Bureaux']?.amount || 0);

  // Données pour graphiques avancés
  const expensesByCategory = Object.entries(data.categoryBreakdown || {})
    .filter(([, categoryData]) => categoryData.type === 'expense')
    .map(([name, categoryData]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      value: categoryData.amount || 0,
      color: categoryData.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      count: categoryData.count || 0,
      percentage: totalExpenses > 0 ? ((categoryData.amount || 0) / totalExpenses * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Suppression des données prévisuelles trompeuses - utilisation des vraies données
  const monthlyTrendData = data.monthlyTrend || [];

  const currencyDistribution = Object.entries(data.currencyBreakdown || {}).map(([currency, amounts]) => ({
    currency,
    total: (amounts.income || 0) + (amounts.expenses || 0),
    net: (amounts.income || 0) - (amounts.expenses || 0),
    flag: CurrencyService.getCurrencyInfo(currency).flag,
    income: amounts.income || 0,
    expenses: amounts.expenses || 0
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      {/* En-tête moderne avec sélecteur */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              Centre Financier
            </h1>
            <p className="text-emerald-100 text-lg font-medium mb-2">
              {getPeriodLabel(selectedPeriod)} • Devise de référence: Franc CFA
            </p>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                <span>Données en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{Object.keys(data.currencyBreakdown || {}).length} devises actives</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-48 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mois Actuel</SelectItem>
                <SelectItem value="last_month">Mois Dernier</SelectItem>
                <SelectItem value="last_3_months">3 Derniers Mois</SelectItem>
                <SelectItem value="current_year">Année Actuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Métriques principales - Design hexagonal moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* Trésorerie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5"></div>
            <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {netProfit >= 0 ? '+' : ''}{profitMargin.toFixed(1)}%
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Trésorerie Nette</h3>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {netProfit >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span>{netProfit >= 0 ? 'Bénéficiaire' : 'En déficit'}</span>
                </div>
                {runway > 0 && (
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                    {runway}j autonomie
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group h-64">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-2 py-1 text-xs">
                  {investmentsReceived > 0 ? 'Avec investissements' : 'Opérationnel'}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Revenus Totaux</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalIncome)}
                </p>
                {investmentsReceived > 0 ? (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Exploitation:</span>
                      <span className="font-medium">{formatCurrency(totalIncome - investmentsReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investissements:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(investmentsReceived)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    Revenus d'exploitation uniquement
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dépenses */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group h-64">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(burnRate)}/jour
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Dépenses Totales</h3>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Salaires:</span>
                    <span className="font-medium">{formatCurrency(salaryExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opérationnel:</span>
                    <span className="font-medium">{formatCurrency(operationalTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Multi-devises */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group h-64">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-2 py-1 text-xs">
                  {Object.keys(data.currencyBreakdown || {}).length} devises
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Multi-Devises</h3>
                {currencyDistribution.length > 0 ? (
                  <div className="space-y-1">
                    {currencyDistribution.slice(0, 3).map((item, index) => (
                      <div key={item.currency} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.flag}</span>
                          <span className="font-medium">{item.currency}</span>
                        </div>
                        <span className={`font-bold text-xs ${item.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.net >= 0 ? '+' : ''}{CurrencyService.formatAmount(item.net, item.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    Aucune transaction multi-devises
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphiques et analyses avancées */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Graphique en aires - Tendance */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Évolution Financière</h3>
                <p className="text-sm text-gray-500">Revenus, dépenses et profit sur 6 mois</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {monthlyTrendData.length > 0 ? (
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorDepense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        CurrencyService.formatAmount(value, 'XOF'), 
                        name === 'revenus' ? 'Revenus' : name === 'depenses' ? 'Dépenses' : 'Profit'
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="revenus" stackId="1" stroke="#10B981" fill="url(#colorRevenu)" strokeWidth={2} />
                    <Area type="monotone" dataKey="depenses" stackId="2" stroke="#EF4444" fill="url(#colorDepense)" strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" stackId="3" stroke="#3B82F6" fill="url(#colorProfit)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          Aucune donnée de tendance disponible
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                          Les graphiques de tendance apparaîtront une fois que vous aurez ajouté des transactions sur plusieurs mois.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Revenus</span>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Dépenses</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Profit</span>
                      </div>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition des dépenses */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Répartition Dépenses</h3>
                <p className="text-xs text-gray-500">Par catégorie</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Montant']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {expensesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-700" title={category.fullName}>
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{category.percentage}%</div>
                        <div className="text-gray-500">{formatCurrency(category.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune dépense</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section détaillée multi-devises */}
      {currencyDistribution.length > 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Analyse Multi-Devises Détaillée</h3>
                <p className="text-sm text-gray-500">Répartition des flux par devise</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currencyDistribution.map((item, index) => (
                <motion.div
                  key={item.currency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <p className="font-bold text-gray-900">{item.currency}</p>
                        <p className="text-xs text-gray-500">
                          {CurrencyService.getCurrencyInfo(item.currency).name}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.net >= 0 ? '+' : ''}{CurrencyService.formatAmount(item.net, item.currency)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenus:</span>
                      <span className="font-medium text-emerald-600">
                        +{CurrencyService.formatAmount(item.income, item.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dépenses:</span>
                      <span className="font-medium text-red-600">
                        -{CurrencyService.formatAmount(item.expenses, item.currency)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.net >= 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs(item.net) / Math.max(...currencyDistribution.map(c => Math.abs(c.net))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
