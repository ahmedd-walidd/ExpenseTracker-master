import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MonthlyTrend } from "@/services/GeminiService";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MonthlyTrendChartProps {
  trends: MonthlyTrend[];
  currencySymbol: string;
}

export default function MonthlyTrendChart({
  trends,
  currencySymbol,
}: MonthlyTrendChartProps) {
  const cardBg = useThemeColor({}, "card");

  if (trends.length === 0) return null;

  const maxTotal = Math.max(...trends.map((t) => t.total));
  const maxBarHeight = 120;

  // Calculate month-over-month change
  const getChangeIndicator = (index: number) => {
    if (index === 0) return null;
    const current = trends[index].total;
    const previous = trends[index - 1].total;
    const change = ((current - previous) / previous) * 100;

    if (Math.abs(change) < 1) return { text: "~", color: "#999", arrow: "" };
    if (change > 0)
      return { text: `+${change.toFixed(0)}%`, color: "#FF6B6B", arrow: "↑" };
    return { text: `${change.toFixed(0)}%`, color: "#4CAF50", arrow: "↓" };
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Monthly Spending Trend
      </ThemedText>

      <View style={[styles.chartArea, { backgroundColor: cardBg }]}>
        <View style={styles.barsContainer}>
          {trends.map((trend, index) => {
            const barHeight =
              maxTotal > 0 ? (trend.total / maxTotal) * maxBarHeight : 0;
            const change = getChangeIndicator(index);
            const isHighest = trend.total === maxTotal;

            return (
              <View key={trend.month} style={styles.barColumn}>
                {/* Amount label */}
                <ThemedText
                  style={[
                    styles.amountLabel,
                    isHighest && styles.amountLabelHighest,
                  ]}
                >
                  {currencySymbol}
                  {trend.total >= 1000
                    ? `${(trend.total / 1000).toFixed(1)}k`
                    : trend.total.toFixed(0)}
                </ThemedText>

                {/* Change indicator */}
                {change && (
                  <ThemedText
                    style={[styles.changeText, { color: change.color }]}
                  >
                    {change.arrow}
                    {change.text}
                  </ThemedText>
                )}

                {/* Bar */}
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 4),
                        backgroundColor: isHighest ? "#FF6B6B" : "#45B7D1",
                      },
                    ]}
                  />
                </View>

                {/* Month label */}
                <ThemedText style={styles.monthLabel}>
                  {trend.month.split(" ")[0]}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartArea: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    minHeight: 180,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    opacity: 0.7,
  },
  amountLabelHighest: {
    opacity: 1,
    fontWeight: "800",
    color: "#FF6B6B",
  },
  changeText: {
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 4,
  },
  barWrapper: {
    justifyContent: "flex-end",
    width: 28,
  },
  bar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  monthLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: "500",
    opacity: 0.7,
  },
});
