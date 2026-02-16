import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AnalyticsResult } from "@/services/GeminiService";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface SpendingSummaryProps {
  data: AnalyticsResult;
  currencySymbol: string;
}

const CHART_COLORS = [
  "#45B7D1",
  "#FF6B6B",
  "#4CAF50",
  "#FFC107",
  "#9C27B0",
  "#FF9800",
  "#00BCD4",
  "#E91E63",
  "#8BC34A",
  "#3F51B5",
];

const CHART_SIZE = Math.min(Dimensions.get("window").width - 80, 240);
const STROKE_WIDTH = 32;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = CHART_SIZE / 2;

export default function SpendingSummary({
  data,
  currencySymbol,
}: SpendingSummaryProps) {
  const cardBg = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");

  const totalTransactions = data.categories.reduce(
    (sum, c) => sum + c.count,
    0,
  );

  // Build pie slices as stroke-dasharray arcs
  const slices: { offset: number; length: number; color: string }[] = [];
  let accumulated = 0;
  for (let i = 0; i < data.categories.length; i++) {
    const pct = data.categories[i].percentage / 100;
    const length = pct * CIRCUMFERENCE;
    slices.push({
      offset: accumulated,
      length,
      color: CHART_COLORS[i % CHART_COLORS.length],
    });
    accumulated += length;
  }

  // Format the total: use compact format for large numbers
  const formatTotal = (amount: number): string => {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + "M";
    if (amount >= 100_000) return (amount / 1_000).toFixed(0) + "K";
    if (amount >= 10_000) return (amount / 1_000).toFixed(1) + "K";
    return amount.toFixed(2);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Pie chart with center label */}
      <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
        <View style={styles.chartWrapper}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            {/* Background track */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={textColor}
              strokeOpacity={0.06}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Category arcs */}
            <G rotation={-90} origin={`${CENTER}, ${CENTER}`}>
              {slices.map((slice, i) => (
                <Circle
                  key={i}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke={slice.color}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${slice.length} ${CIRCUMFERENCE - slice.length}`}
                  strokeDashoffset={-slice.offset}
                  strokeLinecap="butt"
                />
              ))}
            </G>
          </Svg>

          {/* Center label overlay */}
          <View style={styles.centerLabel}>
            <ThemedText style={styles.centerLabelTitle}>Total</ThemedText>
            <ThemedText
              style={styles.centerAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {currencySymbol}
              {formatTotal(data.totalAnalyzed)}
            </ThemedText>
            <ThemedText style={styles.centerSub}>
              {totalTransactions} transactions
            </ThemedText>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {data.categories.map((cat, i) => (
            <View key={cat.name} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] },
                ]}
              />
              <ThemedText style={styles.legendName} numberOfLines={1}>
                {cat.name}
              </ThemedText>
              <ThemedText style={styles.legendValue}>
                {cat.percentage.toFixed(0)}%
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  chartWrapper: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  centerLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STROKE_WIDTH + 8,
  },
  centerLabelTitle: {
    fontSize: 12,
    opacity: 0.45,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 2,
  },
  centerAmount: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  centerSub: {
    fontSize: 11,
    opacity: 0.4,
    marginTop: 2,
  },
  legend: {
    width: "100%",
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7,
  },
});
