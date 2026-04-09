export type AnalysisType = 'daily' | 'weekly' | 'monthly';
export type TrendDirection = 'up' | 'down' | 'stable';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalysisMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  topCategory: string;
  topCategoryRevenue: number;
  transactionCount: number;
  avgTransactionValue: number;
  categoryBreakdown: Record<string, { revenue: number; costs: number; count: number }>;
}

export interface Analysis {
  id: string;
  type: AnalysisType;
  period: string;           // e.g. "2025-04-07" | "2025-W14" | "2025-04"
  periodLabel: string;      // human-readable label
  metrics: AnalysisMetrics;
  llmMessage: string;       // AI-generated analysis text
  insights: string[];
  recommendations: string[];
  profitabilityScore: number; // 0-100
  riskLevel: RiskLevel;
  trend: TrendDirection;
  trendPercentage: number;
  createdAt: string;
}
