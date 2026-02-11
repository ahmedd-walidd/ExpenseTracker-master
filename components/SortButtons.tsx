import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SortOrder, SortType } from '@/utils/sortExpenses';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SortButtonsProps {
  currentSort: SortType;
  currentOrder: SortOrder;
  onSortChange: (type: SortType, order: SortOrder) => void;
}

export default function SortButtons({ currentSort, currentOrder, onSortChange }: SortButtonsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSortPress = (type: SortType) => {
    if (currentSort === type) {
      // Same sort type, toggle order
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(type, newOrder);
    } else {
      // Different sort type, default to desc for both date and amount
      onSortChange(type, 'desc');
    }
  };

  const getSortIcon = (type: SortType) => {
    const isActive = currentSort === type;
    const isAscending = currentOrder === 'asc';
    
    if (type === 'date') {
      if (!isActive) return 'calendar';
      return isAscending ? 'calendar.badge.clock' : 'calendar';
    } else {
      if (!isActive) return 'dollarsign.circle';
      return isAscending ? 'arrow.up.circle' : 'arrow.down.circle';
    }
  };

  const getIconColor = (type: SortType) => {
    const isActive = currentSort === type;
    return isActive ? '#007AFF' : colors.text;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.sortButton,
          currentSort === 'date' && styles.activeSortButton
        ]}
        onPress={() => handleSortPress('date')}
        activeOpacity={0.7}
      >
        <IconSymbol 
          name={getSortIcon('date')} 
          size={20} 
          color={getIconColor('date')} 
        />
        {currentSort === 'date' && (
          <IconSymbol 
            name={currentOrder === 'asc' ? 'chevron.up' : 'chevron.down'} 
            size={12} 
            color="#007AFF"
            style={styles.orderIndicator}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortButton,
          currentSort === 'amount' && styles.activeSortButton
        ]}
        onPress={() => handleSortPress('amount')}
        activeOpacity={0.7}
      >
        <IconSymbol 
          name={getSortIcon('amount')} 
          size={20} 
          color={getIconColor('amount')} 
        />
        {currentSort === 'amount' && (
          <IconSymbol 
            name={currentOrder === 'asc' ? 'chevron.up' : 'chevron.down'} 
            size={12} 
            color="#007AFF"
            style={styles.orderIndicator}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 44,
    position: 'relative',
  },
  activeSortButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  orderIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
