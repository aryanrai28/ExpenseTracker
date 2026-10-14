/**
 * cashFlowPredictor.js — Predictive cash-flow simulation for 30 / 60 / 90 days.
 *
 * Forecasts future account balances by compounding:
 * - Current total balance
 * - Recurring income schedules (salary direct deposits)
 * - Recurring subscription bills & renewals
 * - Baseline daily discretionary burn rate (from 30-day moving average)
 */

export function computeCashflowForecast({
  currentBalance = 0,
  transactions = [],
  subscriptions = [],
  daysAhead = 30,
}) {
  const now = new Date();
  const dayMs = 86400000;

  // 1. Calculate historical daily discretionary burn rate (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * dayMs);
  const recentExpenses = transactions.filter((t) => {
    if (t.type !== 'expense' || t.isTransfer || t.isRecurring) return false;
    const d = new Date(t.date);
    return d >= thirtyDaysAgo && d <= now;
  });

  const totalRecentDiscretionary = recentExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const dailyDiscretionaryBurn = totalRecentDiscretionary > 0 ? totalRecentDiscretionary / 30 : 25; // fallback $25/day

  // 2. Identify recurring income patterns
  const recurringIncomes = transactions.filter((t) => t.type === 'income' && t.isRecurring);

  // 3. Build projected points
  let runningBalance = currentBalance;
  let minBalance = currentBalance;
  let minBalanceDate = null;
  const dataPoints = [];

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(now.getTime() + i * dayMs);
    const dateStr = futureDate.toISOString().slice(0, 10);
    const dayOfMonth = futureDate.getDate();

    // Deduct average daily discretionary spending
    runningBalance -= dailyDiscretionaryBurn;

    // Check for recurring income (e.g. 1st or 15th, or matching day of month)
    for (const inc of recurringIncomes) {
      const incDate = new Date(inc.date);
      if (incDate.getDate() === dayOfMonth) {
        runningBalance += Number(inc.amount || 0);
      }
    }

    // Check for active subscriptions due on this date
    for (const sub of subscriptions) {
      if (!sub.isActive) continue;
      const subDueDate = sub.nextDueDate ? new Date(sub.nextDueDate) : null;
      if (subDueDate && subDueDate.getDate() === dayOfMonth) {
        runningBalance -= Number(sub.amount || 0);
      }
    }

    if (runningBalance < minBalance) {
      minBalance = runningBalance;
      minBalanceDate = dateStr;
    }

    dataPoints.push({
      dayIndex: i,
      date: dateStr,
      balance: Math.round(runningBalance * 100) / 100,
    });
  }

  // 4. Alerts & Safe-to-spend
  const isOverdraftRisk = minBalance < 0;
  const isLowBalanceWarning = minBalance < 150 && minBalance >= 0;
  const projectedEndBalance = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].balance : currentBalance;
  const safeToSpendDaily = Math.max(0, Math.round((currentBalance / daysAhead) * 100) / 100);

  return {
    daysAhead,
    dataPoints,
    currentBalance,
    projectedEndBalance,
    minBalance,
    minBalanceDate,
    dailyDiscretionaryBurn: Math.round(dailyDiscretionaryBurn * 100) / 100,
    safeToSpendDaily,
    isOverdraftRisk,
    isLowBalanceWarning,
  };
}
