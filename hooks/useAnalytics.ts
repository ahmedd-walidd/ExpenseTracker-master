import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useExpenses } from "@/hooks/useExpenses";
import { AnalyticsResult, GeminiService } from "@/services/GeminiService";
import { useCallback, useEffect, useRef, useState } from "react";

export interface AnalyticsState {
  data: AnalyticsResult | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useAnalytics() {
  const { user } = useAuth();
  const { selectedCurrency } = useCurrency();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const [state, setState] = useState<AnalyticsState>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });
  const hasAutoFetched = useRef(false);

  const analyzeExpenses = useCallback(async () => {
    if (!user?.id || !expenses || expenses.length === 0) {
      setState((prev) => ({
        ...prev,
        error:
          expenses?.length === 0
            ? "No expenses to analyze. Add some expenses first!"
            : null,
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await GeminiService.analyzeExpenses(
        expenses,
        selectedCurrency.symbol,
      );

      setState({
        data: result,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze expenses",
      }));
    }
  }, [user?.id, expenses, selectedCurrency.symbol]);

  // Auto-analyze when expenses are first loaded
  useEffect(() => {
    if (
      !expensesLoading &&
      expenses &&
      expenses.length > 0 &&
      !hasAutoFetched.current &&
      !state.data
    ) {
      hasAutoFetched.current = true;
      analyzeExpenses();
    }
  }, [expensesLoading, expenses, analyzeExpenses, state.data]);

  const refresh = useCallback(() => {
    hasAutoFetched.current = false;
    setState((prev) => ({ ...prev, data: null }));
    analyzeExpenses();
  }, [analyzeExpenses]);

  return {
    ...state,
    refresh,
    expensesLoading,
    expenseCount: expenses?.length ?? 0,
  };
}
