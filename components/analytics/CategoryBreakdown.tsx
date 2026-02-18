import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ExpenseCategory } from "@/services/GeminiService";
import React from "react";
import { StyleSheet, View } from "react-native";

interface CategoryBreakdownProps {
  categories: ExpenseCategory[];
  currencySymbol: string;
}

const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#AED6F1",
  "#D7BDE2",
];

export default function CategoryBreakdown({
  categories,
  currencySymbol,
}: CategoryBreakdownProps) {
  if (categories.length === 0) return null;

  const maxTotal = Math.max(...categories.map((c) => c.total));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Spending by Category
      </ThemedText>

      {/* Visual bar chart */}
      <ThemedView style={styles.chartContainer}>
        {categories.map((category, index) => {
          const barWidth = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

          return (
            <View key={category.name} style={styles.barRow}>
              <View style={styles.barLabelContainer}>
                <ThemedText style={styles.barEmoji}>
                  {category.emoji}
                </ThemedText>
                <ThemedText style={styles.barLabel} numberOfLines={1}>
                  {category.name}
                </ThemedText>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(barWidth, 3)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.barValue}>
                {currencySymbol}
                {category.total.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
            </View>
          );
        })}
      </ThemedView>

      {/* Percentage breakdown cards */}
      <ThemedView style={styles.cardsGrid}>
        {categories.slice(0, 6).map((category, index) => {
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          return (
            <CategoryCard
              key={category.name}
              category={category}
              color={color}
              currencySymbol={currencySymbol}
            />
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

function CategoryCard({
  category,
  color,
  currencySymbol,
}: {
  category: ExpenseCategory;
  color: string;
  currencySymbol: string;
}) {
  const cardBg = useThemeColor({}, "card");

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={[styles.cardColorStrip, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardEmoji}>{category.emoji}</ThemedText>
        <ThemedText style={styles.cardName} numberOfLines={1}>
          {category.name}
        </ThemedText>
        <ThemedText style={styles.cardAmount}>
          {currencySymbol}
          {category.total.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </ThemedText>
        <View style={styles.cardFooter}>
          <ThemedText style={[styles.cardPercentage, { color }]}>
            {category.percentage.toFixed(1)}%
          </ThemedText>
          <ThemedText style={styles.cardCount}>
            {category.count} {category.count === 1 ? "item" : "items"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 20,
    gap: 10,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabelContainer: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barEmoji: {
    fontSize: 14,
  },
  barLabel: {
    fontSize: 12,
    flex: 1,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
    minWidth: 6,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    width: 70,
    textAlign: "right",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardColorStrip: {
    height: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPercentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardCount: {
    fontSize: 11,
    opacity: 0.6,
  },
});
