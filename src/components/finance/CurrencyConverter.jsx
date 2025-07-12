import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Globe, TrendingUp, RefreshCw } from "lucide-react";
import { CurrencyService } from "../services/CurrencyService";

export default function CurrencyConverter({ exchangeRates }) {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState(null);

  const convert = () => {
    try {
      const convertedAmount = CurrencyService.getExchangeRate(fromCurrency, toCurrency) * parseFloat(amount);
      setResult(convertedAmount);
    } catch (error) {
      console.error('Conversion error:', error);
      setResult(null);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const currencies = Object.keys(CurrencyService.currencies);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Convertisseur de Devises</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Converter */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Conversion en Temps Réel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">De</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => {
                      const info = CurrencyService.getCurrencyInfo(currency);
                      return (
                        <SelectItem key={currency} value={currency}>
                          <div className="flex items-center gap-2">
                            <span>{info.flag}</span>
                            <span>{currency}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vers</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => {
                      const info = CurrencyService.getCurrencyInfo(currency);
                      return (
                        <SelectItem key={currency} value={currency}>
                          <div className="flex items-center gap-2">
                            <span>{info.flag}</span>
                            <span>{currency}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={swapCurrencies} variant="outline" className="flex-1">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Inverser
              </Button>
              <Button onClick={convert} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700">
                Convertir
              </Button>
            </div>

            {result !== null && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">Résultat</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {CurrencyService.formatAmount(result, toCurrency)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Taux: 1 {fromCurrency} = {CurrencyService.getExchangeRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Taux de Change (EUR)
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currencies.filter(c => c !== 'EUR').map((currency) => {
                const info = CurrencyService.getCurrencyInfo(currency);
                const rate = CurrencyService.exchangeRates[currency];
                return (
                  <div key={currency} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{info.flag}</span>
                      <div>
                        <p className="font-medium">{currency}</p>
                        <p className="text-xs text-slate-500">{info.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rate?.toFixed(4)}</p>
                      <p className="text-xs text-green-600">+0.12%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}