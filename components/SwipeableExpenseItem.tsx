import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDeleteExpense } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';
import React from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface SwipeableExpenseItemProps {
  item: Expense;
  onPress: (expense: Expense) => void;
}

export default function SwipeableExpenseItem({ item, onPress }: SwipeableExpenseItemProps) {
  const { formatAmount } = useCurrency();
  const deleteExpenseMutation = useDeleteExpense();

  const formatExpenseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${item.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpenseMutation.mutate({ id: item.id, title: item.title });
          },
        },
      ]
    );
  };

  const renderRightAction = (progress: Animated.AnimatedAddition<number>, dragX: Animated.AnimatedAddition<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[
        styles.deleteAction,
        { 
          opacity,
          transform: [{ scale }]
        }
      ]}>
        <TouchableOpacity 
          style={styles.deleteActionButton} 
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <View style={styles.deleteActionContent}>
            <IconSymbol name="trash" size={20} color="#fff" />
            <ThemedText style={styles.deleteText}>Delete</ThemedText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightAction}
      rightThreshold={60}
    >
      <TouchableOpacity 
        style={styles.expenseItem}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.expenseInfo}>
          <IconSymbol 
            name={item.type === 'incoming' ? "arrow.down.circle.fill" : "arrow.up.circle.fill"} 
            size={20} 
            color={item.type === 'incoming' ? "#28a745" : "#dc3545"} 
          />
          <View style={styles.expenseDetails}>
            <ThemedText style={styles.expenseTitle}>{item.title}</ThemedText>
            {item.description && (
              <ThemedText style={styles.expenseDescription}>{item.description}</ThemedText>
            )}
            <ThemedText style={styles.expenseDate}>
              {formatExpenseDate(item.created_at)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[
          styles.expenseAmount,
          { color: item.type === 'incoming' ? '#28a745' : '#dc3545' }
        ]}>
          {item.type === 'incoming' ? '+' : '-'}{formatAmount(item.amount)}
        </ThemedText>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
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
  deleteAction: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteActionButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
