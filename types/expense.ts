export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  description: string | null;
  type: "incoming" | "outgoing";
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  user_id: string;
  title: string;
  amount: number;
  description?: string | null;
  type: "incoming" | "outgoing";
  category?: string | null;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  description?: string | null;
  type?: "incoming" | "outgoing";
  category?: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type ExpenseType = "incoming" | "outgoing";

export interface ExpenseFilters {
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface ExpenseStats {
  totalIncoming: number;
  totalOutgoing: number;
  netAmount: number;
  expenseCount: number;
  incomeCount: number;
}
