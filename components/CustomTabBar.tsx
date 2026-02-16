import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AddExpenseModal from "./modals/AddExpenseModal";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleAddExpense = (expense: {
    amount: number;
    title: string;
    description: string;
    type: "incoming" | "outgoing";
    date: Date;
  }) => {
    // Here you would typically save the expense to your data store
    console.log("Adding expense:", expense);

    // Navigate to the appropriate tab based on expense type
    if (expense.type === "incoming") {
      navigation.navigate("incoming");
    } else {
      navigation.navigate("outgoing");
    }
  };

  return (
    <>
      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingAddButton, { backgroundColor: "white" }]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
      >
        <IconSymbol size={24} name="plus" color="black" />
      </TouchableOpacity>

      <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          // Skip the add tab - we'll handle it separately
          if (route.name === "add") {
            return null;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const tabIcon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[
                styles.tab,
                // Add spacing for the floating button between incoming and outgoing
                route.name === "incoming" && styles.tabBeforeButton,
                route.name === "outgoing" && styles.tabAfterButton,
              ]}
            >
              {tabIcon &&
                tabIcon({
                  focused: isFocused,
                  color: isFocused
                    ? colors.tabIconSelected
                    : colors.tabIconDefault,
                  size: 28,
                })}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused
                      ? colors.tabIconSelected
                      : colors.tabIconDefault,
                  },
                ]}
              >
                {typeof label === "string" ? label : "Tab"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddExpense={handleAddExpense}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 34 : 16, // Account for safe area on iOS
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabBeforeButton: {
    marginRight: 28, // Make space for the floating button
  },
  tabAfterButton: {
    marginLeft: 28, // Make space for the floating button
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  floatingAddButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    bottom: Platform.OS === "ios" ? 84 : 66, // Float above the tab bar
    alignSelf: "center",
    left: "50%",
    marginLeft: -28, // Center the button (half of width)
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
