
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  Tag,
  Receipt,
  TrendingUp,
  TrendingDown,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyService } from "../services/CurrencyService";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800", 
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800"
};

const paymentMethodIcons = {
  cash: "💵",
  bank_transfer: "🏦",
  credit_card: "💳",
  debit_card: "💳",
  check: "📝",
  digital_wallet: "📱",
  other: "💰"
};

export default function TransactionsList({ transactions, categories, onRefresh, onEdit, onDelete, onView, onAddNew }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const handleEdit = (transaction) => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDelete = (transaction) => {
    if (onDelete) {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.title}" ?`)) {
        onDelete(transaction.id);
      }
    }
  };

  const handleView = (transaction) => {
    if (onView) {
      onView(transaction);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Catégorie inconnue";
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : "#6366f1";
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === "" || 
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || transaction.category_id === filterCategory;
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date) - new Date(a.date);
      case "amount":
        return (b.amount_eur || b.amount) - (a.amount_eur || a.amount);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Filtres et recherche</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-slate-50/80 border-0 focus:bg-white"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-12 bg-slate-50/80 border-0">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-12 bg-slate-50/80 border-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="income">Revenus</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 bg-slate-50/80 border-0">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 bg-slate-50/80 border-0">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Montant</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterType("all");
                setFilterStatus("all");
                setSortBy("date");
              }}
              className="h-12 bg-slate-50/80 border-0 hover:bg-slate-100"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Transactions récentes
          </h2>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              {filteredTransactions.length} résultats
            </Badge>
            <Button
              onClick={onAddNew}
              className="bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Transaction
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="bg-white/80 backdrop-blur-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((transaction) => {
              const currencyInfo = CurrencyService.getCurrencyInfo(transaction.currency);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <div className={`h-1 w-full bg-gradient-to-r ${
                      transaction.type === 'income' 
                        ? 'from-green-400 to-emerald-500' 
                        : 'from-red-400 to-rose-500'
                    }`} />
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Transaction Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                            transaction.type === 'income'
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                              : 'bg-gradient-to-br from-red-100 to-rose-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-7 h-7 text-green-600" />
                            ) : (
                              <TrendingDown className="w-7 h-7 text-red-600" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-slate-900 text-lg">
                                {transaction.title}
                              </h3>
                              <Badge className={statusColors[transaction.status]}>
                                {transaction.status}
                              </Badge>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-slate-600 mb-2">
                                {transaction.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                <span 
                                  className="px-2 py-1 rounded-full text-white text-xs"
                                  style={{ backgroundColor: getCategoryColor(transaction.category_id) }}
                                >
                                  {getCategoryName(transaction.category_id)}
                                </span>
                              </div>
                              {transaction.payment_method && (
                                <div className="flex items-center gap-1">
                                  <span>{paymentMethodIcons[transaction.payment_method]}</span>
                                  <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                                </div>
                              )}
                              {transaction.vendor && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{transaction.vendor}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{currencyInfo.flag}</span>
                              <p className={`text-2xl font-bold ${
                                transaction.type === 'income' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {CurrencyService.formatAmount(transaction.amount, transaction.currency)}
                              </p>
                            </div>
                            {transaction.currency !== 'EUR' && transaction.amount_eur && (
                              <p className="text-sm text-slate-500">
                                ≈ {CurrencyService.formatAmount(transaction.amount_eur, 'EUR')}
                              </p>
                            )}
                            {transaction.reference && (
                              <p className="text-xs text-slate-400">
                                Ref: {transaction.reference}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              onClick={() => handleView(transaction)}
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                              onClick={() => handleEdit(transaction)}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={() => handleDelete(transaction)}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {transaction.receipt_url && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Receipt className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {transaction.tags && transaction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                          {transaction.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredTransactions.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Aucune transaction trouvée
              </h3>
              <p className="text-slate-500 mb-6">
                Essayez de modifier vos filtres de recherche ou ajoutez une nouvelle transaction.
              </p>
              <Button 
                onClick={onAddNew}
                className="bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Transaction
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
