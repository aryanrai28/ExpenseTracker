/**
 * financialHealthScore.js — Proprietary 0–1000 Wealth & Financial Health Score.
 *
 * Combines 4 core financial pillars:
 * 1. Savings Velocity (30% -> 300 pts)
 * 2. Budget Discipline (30% -> 300 pts)
 * 3. Burn Rate Resilience (20% -> 200 pts)
 * 4. Goal Momentum (20% -> 200 pts)
 */

export const HEALTH_TIERS = {
  DIAMOND: {
    id: 'diamond',
    label: 'Diamond Wealth',
    minScore: 850,
    color: '#00FFFF',
    bg: 'rgba(0, 255, 255, 0.15)',
    icon: 'diamond-outline',
    summary: 'Institutional grade financial stability and exceptional savings velocity.',
  },
  GOLD: {
    id: 'gold',
    label: 'Gold Sovereign',
    minScore: 700,
    color: '#FFD700',
    bg: 'rgba(255, 215, 0, 0.15)',
    icon: 'trophy-outline',
    summary: 'Superb financial discipline with healthy cash flow and steady savings.',
  },
  SILVER: {
    id: 'silver',
    label: 'Silver Stacker',
    minScore: 500,
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.15)',
    icon: 'shield-checkmark-outline',
    summary: 'Balanced finances with moderate runway and good budget control.',
  },
  BRONZE: {
    id: 'bronze',
    label: 'Bronze Saver',
    minScore: 0,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: 'trending-up-outline',
    summary: 'Building initial financial foundation. Focus on lowering burn rate and boosting savings.',
  },
};

export function computeFinancialHealthScore({
  totalIncome = 0,
  totalExpense = 0,
  totalBalance = 0,
  budgets = {},
  categoryBreakdown = { categories: [] },
  monthlyBurnRate = 0,
  goals = [],
}) {
  // ── Pillar 1: Savings Velocity (0–300 pts) ─────────────────────────
  let savingsVelocityScore = 0;
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? netSavings / totalIncome : 0;

  if (savingsRate >= 0.35) {
    savingsVelocityScore = 300;
  } else if (savingsRate > 0) {
    savingsVelocityScore = Math.round((savingsRate / 0.35) * 300);
  } else {
    savingsVelocityScore = 30; // base floor
  }

  // ── Pillar 2: Budget Discipline (0–300 pts) ────────────────────────
  let budgetDisciplineScore = 200; // default baseline if no budgets set
  const budgetEntries = Object.entries(budgets).filter(([_, limit]) => limit > 0);

  if (budgetEntries.length > 0) {
    let withinBudgetCount = 0;
    const catMap = {};
    for (const c of categoryBreakdown.categories || []) {
      catMap[c.id] = c.amount;
    }

    for (const [catId, limit] of budgetEntries) {
      const spent = catMap[catId] || 0;
      if (spent <= limit) {
        withinBudgetCount++;
      }
    }
    budgetDisciplineScore = Math.round((withinBudgetCount / budgetEntries.length) * 300);
  }

  // ── Pillar 3: Burn Rate Resilience (0–200 pts) ─────────────────────
  let burnRateScore = 50;
  const effectiveMonthlyBurn = monthlyBurnRate > 0 ? monthlyBurnRate : totalExpense;

  if (effectiveMonthlyBurn > 0 && totalBalance > 0) {
    const runwayMonths = totalBalance / effectiveMonthlyBurn;
    if (runwayMonths >= 6) {
      burnRateScore = 200;
    } else if (runwayMonths >= 3) {
      burnRateScore = 150;
    } else if (runwayMonths >= 1) {
      burnRateScore = 100;
    } else {
      burnRateScore = Math.round(runwayMonths * 100);
    }
  } else if (totalBalance > 0) {
    burnRateScore = 150;
  }

  // ── Pillar 4: Goal Momentum (0–200 pts) ────────────────────────────
  let goalMomentumScore = 50;
  if (goals.length > 0) {
    const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount || 1), 0);
    const totalCurrent = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0);
    const progressRatio = totalTarget > 0 ? totalCurrent / totalTarget : 0;
    goalMomentumScore = Math.min(200, Math.round(progressRatio * 150 + goals.length * 15));
  }

  // ── Overall Aggregate (0–1000) ────────────────────────────────────
  const overallScore = Math.min(
    1000,
    Math.max(
      100,
      savingsVelocityScore + budgetDisciplineScore + burnRateScore + goalMomentumScore
    )
  );

  // Determine Tier
  let tier = HEALTH_TIERS.BRONZE;
  if (overallScore >= HEALTH_TIERS.DIAMOND.minScore) {
    tier = HEALTH_TIERS.DIAMOND;
  } else if (overallScore >= HEALTH_TIERS.GOLD.minScore) {
    tier = HEALTH_TIERS.GOLD;
  } else if (overallScore >= HEALTH_TIERS.SILVER.minScore) {
    tier = HEALTH_TIERS.SILVER;
  }

  // Actionable Personalized Recommendations
  const recommendations = [];
  if (savingsRate < 0.2) {
    recommendations.push({
      icon: 'trending-up-outline',
      title: 'Boost Savings Velocity',
      description: 'Your savings rate is below 20%. Try automating a 5% transfer on payday.',
    });
  }
  if (budgetDisciplineScore < 220) {
    recommendations.push({
      icon: 'pie-chart-outline',
      title: 'Review Category Limits',
      description: 'Certain budget thresholds are near or exceeded. Adjust limits in Budgets.',
    });
  }
  if (burnRateScore < 120) {
    recommendations.push({
      icon: 'shield-outline',
      title: 'Extend Cash Runway',
      description: 'Build your emergency fund to cover at least 3 months of recurring burn rate.',
    });
  }
  if (goals.length === 0) {
    recommendations.push({
      icon: 'flag-outline',
      title: 'Set a Savings Target',
      description: 'Create a savings target to earn +50 points on your Goal Momentum pillar.',
    });
  }

  return {
    score: overallScore,
    tier,
    pillars: [
      {
        name: 'Savings Velocity',
        score: savingsVelocityScore,
        maxScore: 300,
        pct: Math.round((savingsVelocityScore / 300) * 100),
      },
      {
        name: 'Budget Discipline',
        score: budgetDisciplineScore,
        maxScore: 300,
        pct: Math.round((budgetDisciplineScore / 300) * 100),
      },
      {
        name: 'Burn Resilience',
        score: burnRateScore,
        maxScore: 200,
        pct: Math.round((burnRateScore / 200) * 100),
      },
      {
        name: 'Goal Momentum',
        score: goalMomentumScore,
        maxScore: 200,
        pct: Math.round((goalMomentumScore / 200) * 100),
      },
    ],
    recommendations,
  };
}
