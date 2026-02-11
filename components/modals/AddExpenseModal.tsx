import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateExpense } from '@/hooks/useExpenses';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';

// Validation schema
const expenseSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(50, 'Title must be less than 50 characters'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(999999, 'Amount cannot exceed 999,999'),
  description: yup
    .string()
    .trim(),
  type: yup
    .string()
    .oneOf(['incoming', 'outgoing'], 'Type must be either incoming or outgoing')
    .required('Type is required'),
});

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense?: (expense: {
    amount: number;
    title: string;
    description: string;
    type: 'incoming' | 'outgoing';
    date: Date;
  }) => void;
}

export default function AddExpenseModal({ visible, onClose, onAddExpense }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formatAmount, selectedCurrency } = useCurrency();
  const { user } = useAuth();
  const createExpenseMutation = useCreateExpense();

  const handleAddExpense = async () => {
    if (createExpenseMutation.isPending) return;
    
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate the form data
      const formData = {
        title: title.trim(),
        amount: parseFloat(amount) || 0,
        description: description.trim(),
        type,
      };

      await expenseSchema.validate(formData, { abortEarly: false });

      if (!user?.id) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please log in to add expenses',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      // Save to Supabase using TanStack Query
      const data = await createExpenseMutation.mutateAsync({
        user_id: user.id,
        title: formData.title,
        amount: formData.amount,
        description: formData.description || null,
        type: formData.type,
        currency: selectedCurrency.code,
      });

      // Call optional callback if provided
      if (onAddExpense && data) {
        onAddExpense({
          amount: data.amount,
          title: data.title,
          description: data.description || '',
          type: data.type,
          date: new Date(data.created_at),
        });
      }

      // Reset form
      setAmount('');
      setTitle('');
      setDescription('');
      setType('outgoing');
      setErrors({});
      onClose();

      // Show success toast after modal is closed
      setTimeout(() => {
        Toast.show({
          type: formData.type === 'incoming' ? 'success' : 'error',
          text1: 'Expense Added Successfully!',
          text2: formData.type === 'incoming' 
            ? `You have received ${formatAmount(formData.amount)}` 
            : `You have spent ${formatAmount(formData.amount)}`,
          position: 'top',
          visibilityTime: 3000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
      }, 300); // Small delay to ensure modal is closed first
    } catch (error: any) {
      // Handle both validation and service errors
      if (error instanceof yup.ValidationError) {
        const errorMessages: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errorMessages[err.path] = err.message;
          }
        });
        setErrors(errorMessages);
      } else {
        // Service error (thrown by ExpenseService)
        Toast.show({
          type: 'error',
          text1: 'Failed to Save Expense',
          text2: error.message || 'Please try again',
          position: 'top',
          visibilityTime: 3000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
      }
    } finally {
      // No need to manually manage loading state with TanStack Query
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol size={24} name="xmark" color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Expense</Text>
          <TouchableOpacity 
            onPress={handleAddExpense} 
            style={[styles.saveButton, createExpenseMutation.isPending && styles.saveButtonDisabled]}
            disabled={createExpenseMutation.isPending}
          >
            <IconSymbol 
              size={24} 
              name={createExpenseMutation.isPending ? "arrow.clockwise" : "checkmark"} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, color: colors.text, borderColor: errors.title ? '#ef4444' : colors.border }
              ]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) {
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter title..."
              placeholderTextColor={colors.tabIconDefault}
              autoFocus
            />
            {errors.title && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.title}
              </Text>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, color: colors.text, borderColor: errors.amount ? '#ef4444' : colors.border }
              ]}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (errors.amount) {
                  const newErrors = { ...errors };
                  delete newErrors.amount;
                  setErrors(newErrors);
                }
              }}
              placeholder="0.00"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="numeric"
            />
            {errors.amount && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.amount}
              </Text>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, color: colors.text, borderColor: errors.description ? '#ef4444' : colors.border }
              ]}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  const newErrors = { ...errors };
                  delete newErrors.description;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter description..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.description}
              </Text>
            )}
          </View>

          {/* Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  type === 'incoming' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }
                ]}
                onPress={() => setType('incoming')}
              >
                <IconSymbol 
                  size={20} 
                  name="arrow.down.circle.fill" 
                  color={type === 'incoming' ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.typeButtonText, 
                  { color: type === 'incoming' ? 'white' : colors.text }
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  type === 'outgoing' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }
                ]}
                onPress={() => setType('outgoing')}
              >
                <IconSymbol 
                  size={20} 
                  name="arrow.up.circle.fill" 
                  color={type === 'outgoing' ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.typeButtonText, 
                  { color: type === 'outgoing' ? 'white' : colors.text }
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});