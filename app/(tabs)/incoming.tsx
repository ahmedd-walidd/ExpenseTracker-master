import ExpenseDetailModal from '@/components/modals/ExpenseDetailModal';
import SortButtons from '@/components/SortButtons';
import SwipeableExpenseItem from '@/components/SwipeableExpenseItem';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { formatPeriodRange, getDateRange, TimePeriod, TimePeriodSelector } from '@/components/TimePeriodSelector';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useExpenses, useExpenseStatsByPeriod } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';
import { sortExpenses, SortOrder, SortType } from '@/utils/sortExpenses';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IncomingScreen() {
  const insets = useSafeAreaInsets();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();
  const { data: expenses, isLoading: expensesLoading } = useExpenses({ type: 'incoming' });
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  // Get date range for selected period
  const dateRange = useMemo(() => {
    if (selectedPeriod === 'all') {
      return { startDate: undefined, endDate: undefined };
    }
    const { startDate, endDate } = getDateRange(selectedPeriod);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [selectedPeriod]);

  // Get stats for the selected period
  const { data: stats, isLoading: statsLoading } = useExpenseStatsByPeriod(
    dateRange.startDate,
    dateRange.endDate
  );

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedExpense(null);
  };

  const handleSortChange = (type: SortType, order: SortOrder) => {
    setSortType(type);
    setSortOrder(order);
  };
  
  const incomingExpenses = useMemo(() => {
    const rawExpenses = expenses || [];
    return sortExpenses(rawExpenses, sortType, sortOrder);
  }, [expenses, sortType, sortOrder]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol name="arrow.down.circle.fill" size={32} color="#28a745" />
          <ThemedText type="title" style={styles.title}>Incoming (Received)</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Money Received</ThemedText>
          <ThemedText style={styles.description}>
            Track all the money you've received for the selected time period.
          </ThemedText>
          
          <ThemedView style={styles.timePeriodContainer}>
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </ThemedView>
          
          <ThemedView style={styles.periodInfo}>
            <IconSymbol name="calendar" size={16} color="#666" />
            <ThemedText style={styles.periodText}>
              {formatPeriodRange(selectedPeriod)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.totalCard}>
          <ThemedText type="subtitle" darkColor='black' style={styles.totalLabel}>Total Received</ThemedText>
          <ThemedText 
            type="title" 
            style={styles.totalAmount}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.6}
          >
            {statsLoading ? '...' : `+${formatAmount(stats?.totalIncoming || 0)}`}
          </ThemedText>
        </ThemedView> 

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Income Transactions</ThemedText>
            <SortButtons
              currentSort={sortType}
              currentOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </View>
          {expensesLoading ? (
            <ThemedText style={styles.placeholder}>Loading income...</ThemedText>
          ) : incomingExpenses.length === 0 ? (
            <ThemedText style={styles.placeholder}>
              No incoming transactions recorded yet. Add your first income to get started.
            </ThemedText>
          ) : (
            <FlatList
              data={incomingExpenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.swipeableContainer}>
                  <SwipeableExpenseItem
                    item={item}
                    onPress={handleExpensePress}
                  />
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </ThemedView>
      </ScrollView>
      
      <ExpenseDetailModal
        visible={isDetailModalVisible}
        onClose={handleCloseDetailModal}
        expense={selectedExpense}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  description: {
    marginTop: 10,
    lineHeight: 20,
  },
  totalCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  totalLabel: {
    marginBottom: 5,
  },
  totalAmount: {
    color: '#28a745',
  },
  placeholder: {
    marginTop: 10,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  swipeableContainer: {
    marginBottom: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseDetails: {
    marginLeft: 12,
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 6,
  },
  periodText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.8,
    fontWeight: '500',
  },
  timePeriodContainer: {
    marginTop: 20,
    marginBottom: 5,
  },
});
