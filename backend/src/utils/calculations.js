// ─── Project Status Thresholds (single configurable location) ─────────────────
const STATUS_THRESHOLDS = {
  GREEN:  { min: 0.95 },   // SPI >= 0.95
  YELLOW: { min: 0.80 },   // SPI >= 0.80 and < 0.95
  // RED:  SPI < 0.80
};

// Risk rating map: probability/impact string → numeric score
const RISK_SCORE_MAP = { LOW: 1, MEDIUM: 2, HIGH: 3 };

/**
 * Calculate schedule variance and SPI from planned vs actual progress.
 * Safely handles division-by-zero when planned is 0.
 */
const calcScheduleMetrics = (planned, actual) => {
  const p = parseFloat(planned) || 0;
  const a = parseFloat(actual)  || 0;
  const schedule_variance = parseFloat((a - p).toFixed(2));
  const spi = p === 0 ? null : parseFloat((a / p).toFixed(4));
  return { schedule_variance, spi };
};

/**
 * Derive traffic-light status from SPI.
 * Returns 'GREEN' | 'YELLOW' | 'RED' | 'GRAY'
 */
const deriveStatusFromSPI = (spi) => {
  if (spi === null || spi === undefined) return 'GRAY';
  if (spi >= STATUS_THRESHOLDS.GREEN.min)  return 'GREEN';
  if (spi >= STATUS_THRESHOLDS.YELLOW.min) return 'YELLOW';
  return 'RED';
};

/**
 * Calculate risk rating score.
 * Returns a number from 1–9 and a label (LOW/MEDIUM/HIGH).
 */
const calcRiskRating = (probability, impact) => {
  const pScore = RISK_SCORE_MAP[probability] || 1;
  const iScore = RISK_SCORE_MAP[impact]      || 1;
  const score  = pScore * iScore;
  let label = 'LOW';
  if (score >= 6) label = 'HIGH';
  else if (score >= 3) label = 'MEDIUM';
  return { score, label };
};

/**
 * Calculate financial derived fields.
 * All values expected as numbers.
 */
const calcFinancialMetrics = ({
  original_contract_value = 0,
  variation_value = 0,
  actual_invoicing = 0,
  planned_invoicing = 0,
  amount_certified = 0,
  amount_received = 0,
}) => {
  const revised_contract_value = parseFloat(original_contract_value) + parseFloat(variation_value);
  const outstanding_payment    = parseFloat(amount_certified) - parseFloat(amount_received);
  const financial_progress = revised_contract_value > 0
    ? parseFloat(((parseFloat(amount_received) / revised_contract_value) * 100).toFixed(2))
    : null;
  const invoice_performance = parseFloat(planned_invoicing) > 0
    ? parseFloat(((parseFloat(actual_invoicing) / parseFloat(planned_invoicing)) * 100).toFixed(2))
    : null;
  return {
    revised_contract_value: parseFloat(revised_contract_value.toFixed(2)),
    outstanding_payment:    parseFloat(outstanding_payment.toFixed(2)),
    financial_progress,
    invoice_performance,
  };
};

/**
 * Calculate resource shortfall.
 */
const calcResourceShortfall = (required, available) => {
  const r = parseInt(required) || 0;
  const a = parseInt(available) || 0;
  return Math.max(0, r - a);
};

/**
 * Check if a milestone/intervention is overdue.
 */
const isOverdue = (targetDate, status, completedStatuses = ['COMPLETED', 'CLOSED', 'RESOLVED', 'CANCELLED']) => {
  if (!targetDate) return false;
  if (completedStatuses.includes(status)) return false;
  return new Date(targetDate) < new Date();
};

module.exports = {
  STATUS_THRESHOLDS,
  RISK_SCORE_MAP,
  calcScheduleMetrics,
  deriveStatusFromSPI,
  calcRiskRating,
  calcFinancialMetrics,
  calcResourceShortfall,
  isOverdue,
};
