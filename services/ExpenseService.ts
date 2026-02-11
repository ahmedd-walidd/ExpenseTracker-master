import { supabase } from '@/lib/supabase/client';
import { Expense, ExpenseFilters, ExpenseInsert, ExpenseStats, ExpenseUpdate } from '@/types/expense';

export class ExpenseService {
  static async getExpenses(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
    
    return data || [];
  }

  static async getExpenseById(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }

    return data;
  }

  static async createExpense(expense: ExpenseInsert): Promise<Expense> {
    // Create current local time
    const now = new Date();
    // Adjust for timezone offset to get local time in ISO format
    const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
    
    const expenseWithTimestamp = {
      ...expense,
      created_at: localTime,
      updated_at: localTime,
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseWithTimestamp)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    return data;
  }

  static async updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    return data;
  }

  static async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }

  static async deleteAllExpenses(userId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete all expenses: ${error.message}`);
    }
  }

  static async getExpenseStats(userId: string): Promise<ExpenseStats> {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, type')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch expense stats: ${error.message}`);
    }

    const stats: ExpenseStats = {
      totalIncoming: 0,
      totalOutgoing: 0,
      netAmount: 0,
      expenseCount: 0,
      incomeCount: 0,
    };

    expenses?.forEach((expense) => {
      if (expense.type === 'incoming') {
        stats.totalIncoming += expense.amount;
        stats.incomeCount += 1;
      } else {
        stats.totalOutgoing += expense.amount;
        stats.expenseCount += 1;
      }
    });

    stats.netAmount = stats.totalIncoming - stats.totalOutgoing;

    return stats;
  }

  static async getExpenseStatsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ExpenseStats> {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, type, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      throw new Error(`Failed to fetch expense stats by date range: ${error.message}`);
    }

    const stats: ExpenseStats = {
      totalIncoming: 0,
      totalOutgoing: 0,
      netAmount: 0,
      expenseCount: 0,
      incomeCount: 0,
    };

    expenses?.forEach((expense) => {
      if (expense.type === 'incoming') {
        stats.totalIncoming += expense.amount;
        stats.incomeCount += 1;
      } else {
        stats.totalOutgoing += expense.amount;
        stats.expenseCount += 1;
      }
    });

    stats.netAmount = stats.totalIncoming - stats.totalOutgoing;

    return stats;
  }

  static async getExpensesByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expenses by date range: ${error.message}`);
    }

    return data || [];
  }

  static async getRecentExpenses(userId: string, limit: number = 10): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent expenses: ${error.message}`);
    }

    return data || [];
  }
}
