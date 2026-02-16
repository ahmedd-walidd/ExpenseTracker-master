import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SpendingInsight } from "@/services/GeminiService";
import React from "react";
import { StyleSheet, View } from "react-native";

interface InsightCardsProps {
  insights: SpendingInsight[];
  savingsSuggestion: string;
}

const INSIGHT_STYLES: Record<
  SpendingInsight["type"],
  { bg: string; border: string; label: string }
> = {
  warning: {
    bg: "rgba(255, 193, 7, 0.1)",
    border: "#FFC107",
    label: "Warning",
  },
  tip: { bg: "rgba(33, 150, 243, 0.1)", border: "#2196F3", label: "Tip" },
  positive: { bg: "rgba(76, 175, 80, 0.1)", border: "#4CAF50", label: "Good" },
  trend: { bg: "rgba(156, 39, 176, 0.1)", border: "#9C27B0", label: "Trend" },
};

export default function InsightCards({
  insights,
  savingsSuggestion,
}: InsightCardsProps) {
  const cardBg = useThemeColor({}, "card");

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        AI Insights
      </ThemedText>

      {insights.map((insight, index) => {
        const style = INSIGHT_STYLES[insight.type];
        return (
          <View
            key={index}
            style={[
              styles.insightCard,
              {
                backgroundColor: style.bg,
                borderLeftColor: style.border,
              },
            ]}
          >
            <View style={styles.insightTopRow}>
              <View
                style={[styles.typeBadge, { backgroundColor: style.border }]}
              >
                <ThemedText style={styles.typeBadgeText}>
                  {style.label}
                </ThemedText>
              </View>
              {insight.stat ? (
                <ThemedText style={[styles.statText, { color: style.border }]}>
                  {insight.stat}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
            <ThemedText style={styles.insightDescription}>
              {insight.description}
            </ThemedText>
          </View>
        );
      })}

      {savingsSuggestion && (
        <View style={[styles.savingsCard, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.savingsTitle}>Savings Tip</ThemedText>
          <ThemedText style={styles.savingsText}>
            {savingsSuggestion}
          </ThemedText>
        </View>
      )}
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
  insightCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  insightTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statText: {
    fontSize: 13,
    fontWeight: "700",
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  savingsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
    borderStyle: "dashed",
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 6,
  },
  savingsText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
