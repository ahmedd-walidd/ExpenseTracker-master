import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Currency, currencies, useCurrency } from '@/contexts/CurrencyContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CurrencySelectionModal({ visible, onClose }: CurrencySelectionModalProps) {
  const { selectedCurrency, setCurrency } = useCurrency();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCurrencySelect = (currency: Currency) => {
    setCurrency(currency);
    onClose();
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency.code === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
        ]}
        onPress={() => handleCurrencySelect(item)}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.currencyText}>
            <Text style={[
              styles.currencyName,
              { color: isSelected ? 'white' : colors.text }
            ]}>
              {item.name}
            </Text>
            <Text style={[
              styles.currencyCode,
              { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.tabIconDefault }
            ]}>
              {item.code} - {item.symbol}
            </Text>
          </View>
        </View>
        {isSelected && (
          <IconSymbol size={20} name="checkmark.circle.fill" color="white" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol size={24} name="xmark" color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Select Currency</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Currency List */}
        <FlatList
          data={currencies}
          keyExtractor={(item) => item.code}
          renderItem={renderCurrencyItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40, // Same width as close button for centering
  },
  content: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyText: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '400',
  },
});
