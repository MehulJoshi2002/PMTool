export type FeatureStatus = 'new' | 'under_consideration' | 'in_design' | 'ready_to_develop' | 'in_development' | 'in_review' | 'shipped';

export type MoSCoWCategory = 'must' | 'should' | 'could' | 'wont';
export type FeaturePriority = 'critical' | 'high' | 'medium' | 'low';

export interface BoardFeature {
  id: string;
  productId: string; // e.g. "PROD-1"
  title: string;
  status: FeatureStatus;
  score: number | null;       // Main priority score
  commentsCount: number;
  releaseId: string;
  tags: string[];
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  okrId?: string;
  blockedBy?: string[];

  // === Inline Scorecard (Reach * Impact * Confidence / Effort) ===
  reach?: number;
  impact?: number;
  confidence?: number;
  effort?: number;

  // === Custom Labels ===
  labels?: string[];          // e.g. 'Must Have', 'Tech Debt', 'Delighter'

  // === Feature description ===
  description?: string;

  // === PRD linkage ===
  prdGenerated?: boolean;
  prdId?: string;             // key for separate PRD localStorage entry
}

export interface Release {
  id: string;
  name: string;
  date: string;
  startDate?: string;
  endDate?: string;
  color: string;
}

export interface Objective {
  id: string;
  title: string;
  targetMetric: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
}

export const STATUS_CONFIG: Record<FeatureStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-gray-400', bg: 'bg-gray-500/15' },
  under_consideration: { label: 'Under consideration', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  in_design: { label: 'In design', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  ready_to_develop: { label: 'Ready to develop', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  in_development: { label: 'In development', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  in_review: { label: 'In review', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  shipped: { label: 'Shipped', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

export const ACTIVE_STATUSES: FeatureStatus[] = ['in_design', 'ready_to_develop', 'in_development', 'in_review'];
export const INACTIVE_STATUSES: FeatureStatus[] = ['new', 'under_consideration'];

export const CUSTOM_LABELS = [
  { id: 'must_have', label: 'Must Have', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'should_have', label: 'Should Have', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'could_have', label: 'Could Have', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'delighter', label: 'Delighter', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
  { id: 'basic', label: 'Basic', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'performance', label: 'Performance', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'tech_debt', label: 'Tech Debt', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

export const DEFAULT_RELEASES: Release[] = [
  { id: 'rel-1', name: 'Release 1.0', date: '', color: '#3B82F6' },
  { id: 'parking', name: 'Parking Lot', date: '', color: '#6B7280' },
];

export const DEFAULT_FEATURES: BoardFeature[] = [];

let nextFeatureNum = 1;
export function getNextProductId(): string {
  return `PROD-${nextFeatureNum++}`;
}

// Helper: how many days since a date string
export function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// A feature is "stuck" if it's been in an active status for 14+ days without update
export function isFeatureStuck(f: BoardFeature): boolean {
  if (!ACTIVE_STATUSES.includes(f.status)) return false;
  return daysSince(f.updatedAt) >= 14;
}
