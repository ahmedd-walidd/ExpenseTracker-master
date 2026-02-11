import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const periodLabels: Record<TimePeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
};

export function TimePeriodSelector({ selectedPeriod, onPeriodChange }: TimePeriodSelectorProps) {
  const periods: TimePeriod[] = ['today', 'week', 'month', 'year', 'all'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriodButton,
            ]}
            onPress={() => onPeriodChange(period)}
          >
            <ThemedText
              style={[
                styles.periodText,
                selectedPeriod === period && styles.selectedPeriodText,
              ]}
            >
              {periodLabels[period]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  scrollContent: {
    paddingHorizontal: 5,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedPeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// Utility functions for date calculations
export const getDateRange = (period: TimePeriod): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay,
        endDate: endOfDay,
      };
    
    case 'week': {
      const startOfWeek = new Date(startOfDay);
      const dayOfWeek = startOfWeek.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
      startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return {
        startDate: startOfWeek,
        endDate: endOfWeek,
      };
    }
    
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      return {
        startDate: startOfMonth,
        endDate: endOfMonth,
      };
    }
    
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
      return {
        startDate: startOfYear,
        endDate: endOfYear,
      };
    }
    
    case 'all':
    default:
      return {
        startDate: new Date(0), // Unix epoch start
        endDate: new Date('2099-12-31'), // Far future date
      };
  }
};

export const formatPeriodRange = (period: TimePeriod): string => {
  if (period === 'all') {
    return 'All Time';
  }
  
  const { startDate, endDate } = getDateRange(period);
  
  if (period === 'today') {
    return startDate.toLocaleDateString();
  }
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};
