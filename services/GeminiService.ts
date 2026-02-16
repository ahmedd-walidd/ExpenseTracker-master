import { Expense } from "@/types/expense";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface ExpenseCategory {
  name: string;
  emoji: string;
  total: number;
  count: number;
  percentage: number;
  expenses: { title: string; amount: number; date: string }[];
}

export interface SpendingInsight {
  type: "warning" | "tip" | "positive" | "trend";
  title: string;
  description: string;
  stat: string;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}

export interface AnalyticsResult {
  categories: ExpenseCategory[];
  insights: SpendingInsight[];
  monthlyTrends: MonthlyTrend[];
  topCategory: string;
  totalAnalyzed: number;
  savingsSuggestion: string;
}

export class GeminiService {
  static async analyzeExpenses(
    expenses: Expense[],
    currencySymbol: string,
  ): Promise<AnalyticsResult> {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.",
      );
    }

    // Only analyze outgoing expenses for spending analysis
    const outgoingExpenses = expenses.filter((e) => e.type === "outgoing");

    if (outgoingExpenses.length === 0) {
      return {
        categories: [],
        insights: [
          {
            type: "tip",
            title: "No Spending Data",
            description:
              "Add some outgoing expenses to get AI-powered spending insights!",
            stat: "",
          },
        ],
        monthlyTrends: [],
        topCategory: "N/A",
        totalAnalyzed: 0,
        savingsSuggestion:
          "Start tracking your expenses to receive personalized savings advice.",
      };
    }

    const expenseData = outgoingExpenses.map((e) => ({
      title: e.title,
      amount: e.amount,
      description: e.description || "",
      date: e.created_at,
      category: e.category || "",
    }));

    const prompt = `You are a personal finance AI analyst. Analyze these expenses and return a JSON response.

EXPENSES DATA:
${JSON.stringify(expenseData, null, 2)}

CURRENCY: ${currencySymbol}

INSTRUCTIONS:
1. Group each expense into one of these smart categories based on the title and description (pick the best fit):
   - "Dining Out" (restaurants, cafes, takeout, delivery food)
   - "Groceries" (supermarket, grocery shopping, food supplies)
   - "Transportation" (fuel, gas, car, uber, taxi, metro, bus, parking)
   - "Sports & Activities" (padel, football, gym, swimming, sports equipment)
   - "Entertainment" (movies, games, streaming, concerts, outings)
   - "Shopping" (clothes, electronics, gadgets, online shopping)
   - "Bills & Utilities" (electricity, water, internet, phone bills, rent)
   - "Health & Medical" (pharmacy, doctor, dentist, supplements)
   - "Education" (courses, books, tuition, school supplies)
   - "Personal Care" (haircut, grooming, skincare)
   - "Subscriptions" (streaming services, app subscriptions, memberships)
   - "Travel" (hotels, flights, vacation expenses)
   - "Gifts & Donations" (gifts, charity, donations)
   - "Other" (anything that doesn't fit above)

2. Provide 3-5 personalized spending insights. Each insight MUST include a concrete "stat" field with a specific number/amount/percentage from the data to back it up. Each insight should be one of these types:
   - "warning": overspending alerts (e.g. a category that takes up a disproportionate share)
   - "tip": money-saving suggestions with concrete amounts
   - "positive": good spending habits worth highlighting
   - "trend": notable spending patterns (month-over-month changes, frequency, etc.)

3. Calculate monthly spending trends (group by month, format as "MMM YYYY").

4. Provide a one-sentence personalized savings suggestion with a specific amount.

IMPORTANT: Keep category emojis to exactly ONE per category. No emojis in insights.

RESPOND WITH ONLY THIS JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "🍕",
      "total": 150.00,
      "count": 5,
      "percentage": 25.5,
      "expenses": [{"title": "...", "amount": 30.00, "date": "2025-01-15"}]
    }
  ],
  "insights": [
    {
      "type": "warning",
      "title": "High Dining Spending",
      "description": "Dining out accounts for a large portion of your total spending this period.",
      "stat": "${currencySymbol}600 · 40% of total"
    }
  ],
  "monthlyTrends": [
    {"month": "Jan 2025", "total": 500.00}
  ],
  "topCategory": "Dining Out",
  "totalAnalyzed": 1500.00,
  "savingsSuggestion": "Consider cooking at home 2 more times per week to save ~${currencySymbol}200/month."
}`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API error: ${errorData.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No response from Gemini API");
      }

      // Clean the response - remove markdown code blocks if present
      let cleanedText = textContent.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      const result: AnalyticsResult = JSON.parse(cleanedText);

      // Sort categories by total spending (descending)
      result.categories.sort((a, b) => b.total - a.total);

      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Failed to parse AI response. Please try again.");
      }
      throw error;
    }
  }
}
