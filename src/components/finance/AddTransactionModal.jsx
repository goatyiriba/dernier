import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Upload, Hash, Copy, Check, AlertCircle, FileText, Calculator, Banknote } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyService } from "../services/CurrencyService";
import { useToast } from "@/components/ui/use-toast";

export default function AddTransactionModal({ isOpen, onClose, onSave, categories }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "XOF",
    category_id: "",
    type: "expense",
    date: new Date(),
    payment_method: "mobile_money",
    vendor: "",
    reference: "",
    tags: [],
    notes: "",
    status: "completed",
    recurring: false,
    recurring_period: ""
  });
  
  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversionPreview, setConversionPreview] = useState(null);
  const [referenceCopied, setReferenceCopied] = useState(false);

  // Génération automatique de la référence au chargement
  useEffect(() => {
    if (isOpen && !formData.reference) {
      generateReference();
    }
  }, [isOpen, formData.type, formData.date]);

  // Calcul de prévisualisation conversion en temps réel
  useEffect(() => {
    if (formData.amount && formData.currency) {
      const amountNum = parseFloat(formData.amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        const xofAmount = CurrencyService.convertToXOF(amountNum, formData.currency);
        const eurAmount = CurrencyService.convertFromXOF(xofAmount, 'EUR');
        const usdAmount = CurrencyService.convertFromXOF(xofAmount, 'USD');
        
        setConversionPreview({
          xof: xofAmount,
          eur: eurAmount,
          usd: usdAmount,
          original: amountNum
        });
      } else {
        setConversionPreview(null);
      }
    } else {
      setConversionPreview(null);
    }
  }, [formData.amount, formData.currency]);

  const generateReference = () => {
    const date = new Date(formData.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Préfixes par type de transaction
    const prefixes = {
      expense: 'EXP',
      income: 'INC'
    };
    
    // Génération d'un ID unique avec timestamp
    const timestamp = Date.now().toString().slice(-6);
    const randomId = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    const reference = `${prefixes[formData.type]}-${year}${month}${day}-${timestamp}-${randomId}`;
    
    setFormData(prev => ({
      ...prev,
      reference: reference
    }));
  };

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(formData.reference);
      setReferenceCopied(true);
      setTimeout(() => setReferenceCopied(false), 2000);
      toast({
        title: "Référence copiée",
        description: "La référence a été copiée dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier la référence",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation des champs obligatoires
      if (!formData.title.trim()) {
        throw new Error("Le titre est obligatoire");
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Le montant doit être supérieur à 0");
      }
      if (!formData.category_id) {
        throw new Error("Veuillez sélectionner une catégorie");
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: format(formData.date, 'yyyy-MM-dd'),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };
      
      await onSave(transactionData);
      handleReset();
      
      toast({
        title: "Transaction créée",
        description: `Transaction ${formData.reference} ajoutée avec succès`,
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      currency: "XOF",
      category_id: "",
      type: "expense",
      date: new Date(),
      payment_method: "mobile_money",
      vendor: "",
      reference: "",
      tags: [],
      notes: "",
      status: "completed",
      recurring: false,
      recurring_period: ""
    });
    setCurrentTag("");
    setConversionPreview(null);
    generateReference();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const currencies = Object.keys(CurrencyService.currencies);
  const currencyInfo = CurrencyService.getCurrencyInfo(formData.currency);

  const paymentMethods = [
    { value: "cash", label: "💵 Espèces", description: "Paiement en liquide" },
    { value: "mobile_money", label: "📱 Mobile Money", description: "Orange Money, MTN, etc." },
    { value: "bank_transfer", label: "🏦 Virement bancaire", description: "Virement entre comptes" },
    { value: "credit_card", label: "💳 Carte de crédit", description: "Paiement par carte" },
    { value: "debit_card", label: "💳 Carte de débit", description: "Carte bancaire" },
    { value: "check", label: "📝 Chèque", description: "Paiement par chèque" },
    { value: "digital_wallet", label: "📱 Portefeuille numérique", description: "PayPal, etc." },
    { value: "other", label: "💰 Autre", description: "Autre méthode" }
  ];

  const statusOptions = [
    { value: "pending", label: "🟡 En attente", description: "Transaction en cours" },
    { value: "completed", label: "🟢 Terminé", description: "Transaction finalisée" },
    { value: "cancelled", label: "🔴 Annulé", description: "Transaction annulée" },
    { value: "refunded", label: "🟣 Remboursé", description: "Montant remboursé" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-white to-slate-50">
        <DialogHeader className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Nouvelle Transaction Financière
                </DialogTitle>
                <p className="text-slate-600 mt-1">
                  Enregistrez une nouvelle transaction dans le système comptable
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-sm font-medium">
              Référence automatique
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Section: Informations de Base */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Informations de Base</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                    Titre de la transaction *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Achat équipement bureau, Vente produit..."
                    required
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Type de transaction *
                  </Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, type: value }));
                      // Régénérer la référence quand le type change
                      setTimeout(generateReference, 100);
                    }}
                  >
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          <div>
                            <span className="font-medium">Dépense</span>
                            <p className="text-xs text-slate-500">Sortie d'argent</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="income">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <div>
                            <span className="font-medium">Revenu</span>
                            <p className="text-xs text-slate-500">Entrée d'argent</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Description détaillée
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description complète de la transaction, contexte, justification..."
                    className="min-h-[100px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Section: Montant et Devise */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Montant et Devise</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Montant *
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                      className="h-14 pr-20 text-lg font-semibold border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <span className="text-2xl">{currencyInfo.flag}</span>
                      <span className="text-sm font-medium text-slate-600">{formData.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                    Devise
                  </Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="h-14 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {currencies.map((currency) => {
                        const info = CurrencyService.getCurrencyInfo(currency);
                        return (
                          <SelectItem key={currency} value={currency}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{info.flag}</span>
                              <div>
                                <span className="font-medium">{currency}</span>
                                <p className="text-xs text-slate-500">{info.name}</p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prévisualisation conversion en temps réel */}
                {conversionPreview && formData.currency !== 'XOF' && (
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Banknote className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Conversion automatique</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-slate-500 text-xs">En Franc CFA</p>
                          <p className="font-bold text-lg text-slate-900">
                            {CurrencyService.formatAmount(conversionPreview.xof, 'XOF')}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-slate-500 text-xs">En Euros</p>
                          <p className="font-bold text-lg text-slate-900">
                            {CurrencyService.formatAmount(conversionPreview.eur, 'EUR')}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-slate-500 text-xs">En Dollars</p>
                          <p className="font-bold text-lg text-slate-900">
                            {CurrencyService.formatAmount(conversionPreview.usd, 'USD')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Section: Référence et Catégorie */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Classification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Référence automatique
                  </Label>
                  <div className="relative">
                    <Input
                      value={formData.reference}
                      readOnly
                      className="h-12 pr-12 bg-slate-100 border-slate-200 text-slate-600 font-mono cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyReference}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-200"
                    >
                      {referenceCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Référence générée automatiquement et non modifiable
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                    Catégorie *
                  </Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.type === formData.type)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                    Date de transaction *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-full justify-start text-left border-slate-200 hover:border-slate-300"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-slate-500" />
                        {format(formData.date, "dd MMMM yyyy", { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          setFormData(prev => ({ ...prev, date }));
                          // Régénérer la référence quand la date change
                          setTimeout(generateReference, 100);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Statut de la transaction
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div>
                            <span className="font-medium">{status.label}</span>
                            <p className="text-xs text-slate-500">{status.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Section: Détails Complémentaires */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Informations Complémentaires</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="payment_method" className="text-sm font-medium text-slate-700">
                    Méthode de paiement
                  </Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger className="h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div>
                            <span className="font-medium">{method.label}</span>
                            <p className="text-xs text-slate-500">{method.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vendor" className="text-sm font-medium text-slate-700">
                    Fournisseur / Client
                  </Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Ex: Amazon, Client ABC, Fournisseur XYZ..."
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Tags de classification
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Ajouter un tag (urgent, récurrent, projet...)"
                      className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} size="sm" className="h-10 px-4">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {formData.tags.map((tag, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="outline" className="flex items-center gap-2 pl-3 pr-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                    Notes additionnelles
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes internes, remarques particulières, contexte supplémentaire..."
                    className="min-h-[80px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end gap-4 pt-6 border-t border-slate-200"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-8 py-3 h-12"
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.title || !formData.amount || !formData.category_id}
                className="px-8 py-3 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Créer la Transaction
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}