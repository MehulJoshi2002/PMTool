export type Framework = 'rice' | 'ice' | 'moscow' | 'kano' | 'weighted';

// ---- RICE ----
export interface RICEFeature {
  id: string;
  framework: 'rice';
  name: string;
  reach: number;       // 1-5
  impact: number;      // 1-5
  confidence: number;  // 1-5
  effort: number;      // 1-5
  score: number;
  label: string;
  explanation: string;
}

// ---- ICE ----
export interface ICEFeature {
  id: string;
  framework: 'ice';
  name: string;
  impact: number;    // 1-10
  confidence: number;// 1-10
  ease: number;      // 1-10
  score: number;
  label: string;
  explanation: string;
}

// ---- MoSCoW ----
export type MoSCoWCategory = 'must' | 'should' | 'could' | 'wont';
export interface MoSCoWFeature {
  id: string;
  framework: 'moscow';
  name: string;
  category: MoSCoWCategory;
  rationale: string;
  score: number;
  label: string;
  explanation: string;
}

// ---- Kano ----
export type KanoCategory = 'basic' | 'performance' | 'excitement' | 'indifferent' | 'reverse';
export interface KanoFeature {
  id: string;
  framework: 'kano';
  name: string;
  category: KanoCategory;
  satisfiedResponse: number;    // 1-5
  dissatisfiedResponse: number; // 1-5
  score: number;
  label: string;
  explanation: string;
}

// ---- Weighted Scoring ----
export interface WeightedFeature {
  id: string;
  framework: 'weighted';
  name: string;
  strategicFit: number;    // 1-10
  revenueImpact: number;   // 1-10
  userValue: number;       // 1-10
  feasibility: number;     // 1-10
  risk: number;            // 1-10 (higher = riskier, inverted)
  score: number;
  label: string;
  explanation: string;
}

export type AnyFeature = RICEFeature | ICEFeature | MoSCoWFeature | KanoFeature | WeightedFeature;

// ---- SCORERS ----

export function scoreRICE(f: Omit<RICEFeature, 'id' | 'score' | 'label' | 'explanation' | 'framework'>): { score: number; label: string; explanation: string } {
  const score = parseFloat(((f.reach * f.impact * f.confidence) / f.effort).toFixed(2));
  let label = 'Standard';
  let explanation = 'Standard priority. Balance against other features in your roadmap.';
  if (f.impact >= 4 && f.effort <= 2) { label = 'Quick Win'; explanation = 'High impact for very little effort. Ship this immediately.'; }
  else if (f.impact >= 4 && f.effort >= 4 && f.confidence < 3) { label = 'Risky Bet'; explanation = 'High impact but heavy effort and low confidence. Break it down first.'; }
  else if (f.impact >= 4 && f.effort >= 4) { label = 'Major Project'; explanation = 'High impact, but heavy investment required. Plan resources carefully.'; }
  else if (f.impact <= 2 && f.effort >= 4) { label = 'Time Sink'; explanation = 'Avoid: heavy effort, minimal user value. Deprioritise or cut.'; }
  else if (f.impact <= 2 && f.effort <= 2) { label = 'Fill-in'; explanation = 'Low impact, low effort. Do only when dev cycles are free.'; }
  return { score, label, explanation };
}

export function scoreICE(f: Omit<ICEFeature, 'id' | 'score' | 'label' | 'explanation' | 'framework'>): { score: number; label: string; explanation: string } {
  const score = parseFloat(((f.impact * f.confidence * f.ease) / 10).toFixed(2));
  let label = 'Standard';
  let explanation = 'This is a standard priority item.';
  if (score >= 60) { label = 'Top Priority'; explanation = 'Very high ICE score. Strong impact, confidence, AND ease. Ship immediately.'; }
  else if (score >= 30 && f.ease >= 7) { label = 'Quick Win'; explanation = 'Easy to execute and high confidence. Prioritise early for momentum.'; }
  else if (score >= 30) { label = 'High Value'; explanation = 'Strong overall score. Prioritise in next sprint.'; }
  else if (f.ease <= 3 && f.impact >= 7) { label = 'Hard Bet'; explanation = 'High potential but difficult to execute. Revisit when capacity allows.'; }
  else if (score < 10) { label = 'Deprioritise'; explanation = 'Low combined score. Move to backlog.'; }
  return { score, label, explanation };
}

export function scoreMoSCoW(category: MoSCoWCategory): { score: number; label: string; explanation: string } {
  const map: Record<MoSCoWCategory, { score: number; label: string; explanation: string }> = {
    must: { score: 100, label: 'Must Have', explanation: 'Critical for launch. Without this, the product fails.' },
    should: { score: 70, label: 'Should Have', explanation: 'High value but not launch-blocking. Include if possible.' },
    could: { score: 40, label: 'Could Have', explanation: 'Nice-to-have. Include only if time and resources allow.' },
    wont: { score: 5, label: "Won't Have", explanation: 'Deliberately excluded this cycle. Log for future consideration.' },
  };
  return map[category];
}

export function scoreKano(category: KanoCategory, satisfied: number, dissatisfied: number): { score: number; label: string; explanation: string } {
  const baseScores: Record<KanoCategory, number> = { basic: 60, performance: 80, excitement: 90, indifferent: 20, reverse: 10 };
  const score = parseFloat((baseScores[category] * (satisfied / 5) * 0.5 + baseScores[category] * 0.5).toFixed(1));
  const map: Record<KanoCategory, { label: string; explanation: string }> = {
    basic: { label: 'Must-Be', explanation: 'Users expect this. Its absence causes dissatisfaction, but presence is taken for granted.' },
    performance: { label: 'Performance', explanation: 'More of this = more satisfaction. Linear value driver. Prioritise for competitive edge.' },
    excitement: { label: 'Delighter', explanation: "Users don't expect this. Delivering it creates unexpected satisfaction and loyalty." },
    indifferent: { label: 'Indifferent', explanation: 'Users neither care nor notice. Low investment priority.' },
    reverse: { label: 'Reverse', explanation: 'Some users actively dislike this. Consider carefully before building.' },
  };
  return { score, ...map[category] };
}

export function scoreWeighted(f: Omit<WeightedFeature, 'id' | 'score' | 'label' | 'explanation' | 'framework'>): { score: number; label: string; explanation: string } {
  // Weights: Strategic Fit 25%, Revenue 25%, User Value 25%, Feasibility 15%, Risk (inverted) 10%
  const score = parseFloat((
    f.strategicFit * 2.5 +
    f.revenueImpact * 2.5 +
    f.userValue * 2.5 +
    f.feasibility * 1.5 +
    (10 - f.risk) * 1.0
  ).toFixed(1));
  let label = 'Standard';
  let explanation = 'Moderate priority across all weighted dimensions.';
  if (score >= 75) { label = 'Top Tier'; explanation = 'Excellent across strategic, revenue, and user value dimensions. Highest priority.'; }
  else if (score >= 55 && f.feasibility >= 7) { label = 'Strong Build'; explanation = 'Good score and highly feasible. Ship in near-term.'; }
  else if (score >= 55) { label = 'High Value'; explanation = 'Strong value dimensions, but check feasibility before committing.'; }
  else if (f.risk >= 8) { label = 'High Risk'; explanation = 'Risky execution. Invest in de-risking before prioritising.'; }
  else if (score < 30) { label = 'Deprioritise'; explanation = 'Low weighted score across dimensions. Move to backlog.'; }
  return { score, label, explanation };
}

// ---- LEGACY COMPAT (for old Feature type used in FeatureCard/PriorityMatrix) ----
export interface Feature {
  id: string;
  name: string;
  reach: number;
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  explanation: string;
}

export function calculateScore(reach: number, impact: number, confidence: number, effort: number): number {
  return parseFloat(((reach * impact * confidence) / effort).toFixed(2));
}

export function generateExplanation(reach: number, impact: number, confidence: number, effort: number): string {
  const { explanation } = scoreRICE({ reach, impact, confidence, effort, name: '' });
  return explanation;
}
