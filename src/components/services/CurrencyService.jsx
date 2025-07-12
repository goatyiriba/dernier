// Service de gestion des devises avec taux de change en temps réel
export class CurrencyService {
  static currencies = {
    XOF: { symbol: 'CFA', name: 'Franc CFA (BCEAO)', flag: '🌍' },
    EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
    USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
    MAD: { symbol: 'DH', name: 'Moroccan Dirham', flag: '🇲🇦' },
    TND: { symbol: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳' },
    DZD: { symbol: 'DA', name: 'Algerian Dinar', flag: '🇩🇿' }
  };

  // Taux de change avec XOF comme devise de base
  static exchangeRates = {
    XOF: 1.0,      // Base currency
    EUR: 0.00152,  // 1 XOF = 0.00152 EUR
    USD: 0.00164,  // 1 XOF = 0.00164 USD
    GBP: 0.00129,  // 1 XOF = 0.00129 GBP
    CAD: 0.00223,  // 1 XOF = 0.00223 CAD
    JPY: 0.247,    // 1 XOF = 0.247 JPY
    CNY: 0.0118,   // 1 XOF = 0.0118 CNY
    CHF: 0.00146,  // 1 XOF = 0.00146 CHF
    AUD: 0.00249,  // 1 XOF = 0.00249 AUD
    MAD: 0.0165,   // 1 XOF = 0.0165 MAD
    TND: 0.00509,  // 1 XOF = 0.00509 TND
    DZD: 0.221     // 1 XOF = 0.221 DZD
  };

  static getCurrencyInfo(currencyCode) {
    return this.currencies[currencyCode] || { symbol: currencyCode, name: currencyCode, flag: '💰' };
  }

  static formatAmount(amount, currency = 'XOF') {
    const currencyInfo = this.getCurrencyInfo(currency);
    
    // Formatage spécial pour XOF
    if (currency === 'XOF') {
      return `${amount.toLocaleString('fr-FR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })} CFA`;
    }
    
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    });
    
    try {
      return formatter.format(amount);
    } catch (error) {
      return `${currencyInfo.symbol} ${amount.toLocaleString('fr-FR', { 
        minimumFractionDigits: currency === 'XOF' || currency === 'JPY' ? 0 : 2 
      })}`;
    }
  }

  static convertToXOF(amount, fromCurrency) {
    if (fromCurrency === 'XOF') return amount;
    const rate = this.exchangeRates[fromCurrency];
    if (!rate) throw new Error(`Exchange rate not found for ${fromCurrency}`);
    return amount / rate;
  }

  static convertFromXOF(amount, toCurrency) {
    if (toCurrency === 'XOF') return amount;
    const rate = this.exchangeRates[toCurrency];
    if (!rate) throw new Error(`Exchange rate not found for ${toCurrency}`);
    return amount * rate;
  }

  static getExchangeRate(fromCurrency, toCurrency = 'XOF') {
    if (fromCurrency === toCurrency) return 1;
    if (toCurrency === 'XOF') {
      return 1 / (this.exchangeRates[fromCurrency] || 1);
    }
    if (fromCurrency === 'XOF') {
      return this.exchangeRates[toCurrency] || 1;
    }
    // Convert from one currency to another via XOF
    const toXOF = this.convertToXOF(1, fromCurrency);
    return this.convertFromXOF(toXOF, toCurrency);
  }

  // Simulation de récupération des taux en temps réel
  static async fetchLatestRates() {
    try {
      // Pour l'instant, on simule de petites variations
      Object.keys(this.exchangeRates).forEach(currency => {
        if (currency !== 'XOF') {
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          this.exchangeRates[currency] *= (1 + variation);
        }
      });
      
      return this.exchangeRates;
    } catch (error) {
      console.warn('Could not fetch latest exchange rates:', error);
      return this.exchangeRates;
    }
  }
}