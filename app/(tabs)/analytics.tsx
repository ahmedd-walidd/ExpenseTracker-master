import CategoryBreakdown from "@/components/analytics/CategoryBreakdown";
import InsightCards from "@/components/analytics/InsightCards";
import MonthlyTrendChart from "@/components/analytics/MonthlyTrendChart";
import SpendingSummary from "@/components/analytics/SpendingSummary";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AnalyticsTab = "overview" | "categories" | "insights";

const TABS: { key: AnalyticsTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "categories", label: "Categories" },
  { key: "insights", label: "Insights" },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedCurrency } = useCurrency();
  const {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    expensesLoading,
    expenseCount,
  } = useAnalytics();
  const cardBg = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");

  const renderSegmentedControl = () => (
    <View style={[styles.segmentedControl, { backgroundColor: cardBg }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.segmentButton,
              isActive && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.segmentLabel,
                isActive && styles.segmentLabelActive,
                { color: isActive ? "#fff" : textColor },
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.loadingCard, { backgroundColor: cardBg }]}>
        <ActivityIndicator size="large" color="#45B7D1" />
        <ThemedText style={styles.loadingTitle}>
          Analyzing your expenses...
        </ThemedText>
        <ThemedText style={styles.loadingSubtext}>
          Categorizing {expenseCount} transactions and generating insights
        </ThemedText>
      </View>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.errorCard, { backgroundColor: cardBg }]}>
        <ThemedText style={styles.errorTitle}>Analysis Failed</ThemedText>
        <ThemedText style={styles.errorMessage}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <IconSymbol name="arrow.clockwise" size={18} color="#fff" />
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
        <ThemedText style={styles.emptyTitle}>No Expenses Yet</ThemedText>
        <ThemedText style={styles.emptyMessage}>
          Add some outgoing expenses to unlock AI-powered spending insights,
          category breakdowns, and personalized savings tips.
        </ThemedText>
        <View style={styles.featurePreview}>
          {[
            "Smart categorization",
            "Spending insights with data",
            "Monthly trends",
            "Personalized savings tips",
          ].map((label, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureBullet} />
              <ThemedText style={styles.featureLabel}>{label}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case "overview":
        return (
          <>
            <SpendingSummary
              data={data}
              currencySymbol={selectedCurrency.symbol}
            />
            <MonthlyTrendChart
              trends={data.monthlyTrends}
              currencySymbol={selectedCurrency.symbol}
            />
          </>
        );
      case "categories":
        return (
          <CategoryBreakdown
            categories={data.categories}
            currencySymbol={selectedCurrency.symbol}
          />
        );
      case "insights":
        return (
          <InsightCards
            insights={data.insights}
            savingsSuggestion={data.savingsSuggestion}
          />
        );
    }
  };

  const renderData = () => {
    if (!data) return null;

    return (
      <>
        {renderSegmentedControl()}
        {renderTabContent()}

        {/* Last updated footer */}
        {lastUpdated && (
          <View style={styles.footer}>
            <IconSymbol name="sparkles" size={14} color="#999" />
            <ThemedText style={styles.footerText}>
              Powered by Gemini AI • Updated {lastUpdated.toLocaleTimeString()}
            </ThemedText>
          </View>
        )}
      </>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !!data}
            onRefresh={refresh}
            tintColor={textColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText type="title" style={styles.title}>
              Analytics
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              AI-powered spending insights
            </ThemedText>
          </View>
          {data && !isLoading && (
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: cardBg }]}
              onPress={refresh}
            >
              <IconSymbol name="arrow.clockwise" size={18} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {expensesLoading || (isLoading && !data)
          ? renderLoading()
          : error && !data
            ? renderError()
            : !data || expenseCount === 0
              ? renderEmpty()
              : renderData()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Segmented control
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  segmentButtonActive: {
    backgroundColor: "#45B7D1",
    shadowColor: "#45B7D1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  segmentLabelActive: {
    fontWeight: "700",
  },

  // Loading state
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    textAlign: "center",
  },
  // Error state
  errorCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#45B7D1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Empty state
  emptyCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  featurePreview: {
    gap: 12,
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#45B7D1",
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.7,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
  },
});
