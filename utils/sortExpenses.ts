import { Expense } from '@/types/expense';

export type SortType = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export function sortExpenses(expenses: Expense[], sortType: SortType, sortOrder: SortOrder): Expense[] {
  return [...expenses].sort((a, b) => {
    let comparison = 0;

    if (sortType === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      comparison = dateA - dateB;
    } else if (sortType === 'amount') {
      comparison = a.amount - b.amount;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}