
import React, { useState, useEffect } from "react";
import { 
  FinanceTransaction, 
  FinanceCategory, 
  FinanceBudget, 
  FinanceReport 
} from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  Globe,
  Plus,
  Filter,
  Download,
  Eye,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from "recharts";

import { CurrencyService } from "../components/services/CurrencyService";
import FinanceDashboardCards from "../components/finance/FinanceDashboardCards";
import TransactionsList from "../components/finance/TransactionsList";
import AddTransactionModal from "../components/finance/AddTransactionModal";
import BudgetOverview from "../components/finance/BudgetOverview";
import CurrencyConverter from "../components/finance/CurrencyConverter";
import FinanceReports from "../components/finance/FinanceReports";
import ExpenseAnalytics from "../components/finance/ExpenseAnalytics";

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [exchangeRates, setExchangeRates] = useState(CurrencyService.exchangeRates);

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyTrend: 0,
    currencyBreakdown: {},
    categoryBreakdown: {},
    recentTransactions: []
  });

  useEffect(() => {
    loadFinanceData();
    generateDefaultCategories();
    
    // Update exchange rates every 5 minutes
    const ratesInterval = setInterval(async () => {
      const newRates = await CurrencyService.fetchLatestRates();
      setExchangeRates(newRates);
    }, 300000);

    return () => clearInterval(ratesInterval);
  }, []);

  useEffect(() => {
    calculateDashboardData();
  }, [transactions, categories, selectedPeriod]);

  const loadFinanceData = async () => {
    try {
      setIsLoading(true);
      const [transactionData, categoryData, budgetData, reportData] = await Promise.all([
        FinanceTransaction.list("-date", 200),
        FinanceCategory.list(),
        FinanceBudget.list("-created_date"),
        FinanceReport.list("-created_date", 10)
      ]);

      setTransactions(transactionData);
      setCategories(categoryData);
      setBudgets(budgetData);
      setReports(reportData);
    } catch (error) {
      console.error("Error loading finance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultCategories = async () => {
    try {
      const existingCategories = await FinanceCategory.list();
      if (existingCategories.length === 0) {
        const defaultCategories = [
          { name: "Salaires", type: "expense", color: "#ef4444", icon: "Users" },
          { name: "Marketing", type: "expense", color: "#f97316", icon: "Megaphone" },
          { name: "Équipement", type: "expense", color: "#3b82f6", icon: "Monitor" },
          { name: "Formation", type: "expense", color: "#8b5cf6", icon: "GraduationCap" },
          { name: "Bureaux", type: "expense", color: "#10b981", icon: "Building2" },
          { name: "Ventes", type: "income", color: "#22c55e", icon: "TrendingUp" },
          { name: "Services", type: "income", color: "#06b6d4", icon: "Briefcase" },
          { name: "Investissements", type: "income", color: "#f59e0b", icon: "PiggyBank" }
        ];

        for (const category of defaultCategories) {
          await FinanceCategory.create(category);
        }
        loadFinanceData();
      }
    } catch (error) {
      console.error("Error creating default categories:", error);
    }
  };

  const calculateDashboardData = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });

    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount_xof || t.amount), 0);

    const totalExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount_xof || t.amount), 0);

    const netProfit = totalIncome - totalExpenses;

    // Currency breakdown
    const currencyBreakdown = {};
    periodTransactions.forEach(t => {
      if (!currencyBreakdown[t.currency]) {
        currencyBreakdown[t.currency] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        currencyBreakdown[t.currency].income += t.amount;
      } else {
        currencyBreakdown[t.currency].expenses += t.amount;
      }
    });

    // Category breakdown
    const categoryBreakdown = {};
    categories.forEach(cat => {
      const catTransactions = periodTransactions.filter(t => t.category_id === cat.id);
      const total = catTransactions.reduce((sum, t) => sum + (t.amount_xof || t.amount), 0);
      if (total > 0) {
        categoryBreakdown[cat.name] = {
          amount: total,
          color: cat.color,
          type: cat.type,
          count: catTransactions.length
        };
      }
    });

    // Monthly trend calculation
    const previousPeriodTransactions = selectedPeriod === 'current_month' ? 
      transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const prevStart = startOfMonth(subMonths(now, 1));
        const prevEnd = endOfMonth(subMonths(now, 1));
        return isWithinInterval(transactionDate, { start: prevStart, end: prevEnd });
      }) : [];

    const prevNetProfit = previousPeriodTransactions
      .reduce((sum, t) => sum + (t.type === 'income' ? 1 : -1) * (t.amount_xof || t.amount), 0);

    const monthlyTrend = prevNetProfit ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100 : 0;

    setDashboardData({
      totalIncome,
      totalExpenses,
      netProfit,
      monthlyTrend,
      currencyBreakdown,
      categoryBreakdown,
      recentTransactions: periodTransactions.slice(0, 10)
    });
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      // Convert to XOF for storage
      const amountXOF = CurrencyService.convertToXOF(transactionData.amount, transactionData.currency);
      const exchangeRate = CurrencyService.getExchangeRate(transactionData.currency, 'XOF');

      const newTransaction = await FinanceTransaction.create({
        ...transactionData,
        amount_xof: amountXOF,
        exchange_rate: exchangeRate
      });

      setTransactions(prev => [newTransaction, ...prev]);
      setShowAddTransaction(false);
      
      // Refresh all data to update dashboard cards and analytics
      loadFinanceData();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleEditTransaction = async (transaction) => {
    // Cette fonction sera appelée quand on clique sur Edit
    console.log('Edit transaction:', transaction);
    // TODO: Ouvrir un modal d'édition
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await FinanceTransaction.delete(transactionId);
      loadFinanceData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleViewTransaction = async (transaction) => {
    // Cette fonction sera appelée quand on clique sur View
    console.log('View transaction:', transaction);
    // TODO: Ouvrir un modal de détails
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Centre Financier
            </h1>
            <p className="text-xl text-slate-600">
              Gestion multi-devises • Analytics • Budgets • Rapports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowAddTransaction(true)}
              className="bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Transaction
            </Button>
            <Button variant="outline" onClick={loadFinanceData}>
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <FinanceDashboardCards 
          data={dashboardData}
          isLoading={isLoading}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Devises
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <ExpenseAnalytics 
              transactions={transactions}
              categories={categories}
              dashboardData={dashboardData}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsList 
              transactions={transactions}
              categories={categories}
              onRefresh={loadFinanceData}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onView={handleViewTransaction}
              onAddNew={() => setShowAddTransaction(true)}
            />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <BudgetOverview 
              budgets={budgets}
              transactions={transactions}
              categories={categories}
              onRefresh={loadFinanceData}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ExpenseAnalytics 
              transactions={transactions}
              categories={categories}
              dashboardData={dashboardData}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <CurrencyConverter 
              exchangeRates={exchangeRates} 
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <FinanceReports 
              transactions={transactions}
              categories={categories}
              reports={reports}
              onRefresh={loadFinanceData}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSave={handleAddTransaction}
          categories={categories}
        />
      </div>
    </div>
  );
}
