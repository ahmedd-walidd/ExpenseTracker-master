import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateCurrency } from "@/hooks/useProfile";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const currencies: Currency[] = [
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatAmount: (amount: number) => string;
  isUpdating: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

// Storage adapter that works for both native and web
const createStorageAdapter = () => {
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        if (typeof window !== "undefined") {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
    };
  }
  // For native, we'll use AsyncStorage
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  return AsyncStorage;
};

const storage = createStorageAdapter();
const CURRENCY_STORAGE_KEY = "@expense_tracker_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0],
  ); // Default to EGP
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateCurrencyMutation = useUpdateCurrency();

  // Load currency preference (from profile if logged in, otherwise from local storage)
  useEffect(() => {
    if (user && profile?.currency) {
      // Use currency from user profile
      const profileCurrency = currencies.find(
        (c) => c.code === profile.currency,
      );
      if (profileCurrency) {
        setSelectedCurrency(profileCurrency);
      }
    } else {
      // Load from local storage for guest users or as fallback
      loadSavedCurrency();
    }
  }, [user, profile]);

  const loadSavedCurrency = async () => {
    try {
      const savedCurrencyCode = await storage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrencyCode) {
        const savedCurrency = currencies.find(
          (c) => c.code === savedCurrencyCode,
        );
        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
        }
      }
    } catch (error) {
      console.error("Error loading saved currency:", error);
    }
  };

  const setCurrency = async (currency: Currency) => {
    try {
      setSelectedCurrency(currency);

      // Save to local storage immediately
      await storage.setItem(CURRENCY_STORAGE_KEY, currency.code);

      // If user is logged in, also update their profile
      if (user) {
        updateCurrencyMutation.mutate({ currency: currency.code });
      }
    } catch (error) {
      console.error("Error setting currency:", error);
    }
  };

  const formatAmount = (amount: number): string => {
    return `${selectedCurrency.symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setCurrency,
        formatAmount,
        isUpdating: updateCurrencyMutation.isPending,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
