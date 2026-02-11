import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  label: string;
  route: string;
  icon?: string;
}

interface NavigationDropdownProps {
  options: DropdownOption[];
  title?: string;
}

export function NavigationDropdown({ options, title = 'Navigate' }: NavigationDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleOptionPress = (route: string) => {
    setIsVisible(false);
    router.push(route as any);
    
  };  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.triggerText}>{title}</Text>
        <IconSymbol name="chevron.down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.dropdown}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index === options.length - 1 && styles.lastOption
                ]}
                onPress={() => handleOptionPress(option.route)}
              >
                {option.icon && (
                  <IconSymbol name={option.icon as any} size={20} color="#333" />
                )}
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 15,
  },
  triggerText: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 15,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    minWidth: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
});
