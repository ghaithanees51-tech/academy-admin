/**
 * Simple hook to provide currency formatting utilities
 * For admin panel, uses a default currency symbol
 */
export const useStoreCurrency = () => {
  // Default currency for admin panel
  const currencySymbol = '₹'; // Default to INR, can be made configurable later
  
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) {
      return '—';
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (Number.isNaN(numAmount)) {
      return '—';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };
  
  return {
    currencySymbol,
    formatCurrency,
  };
};

