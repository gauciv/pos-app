export const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-destructive/10 text-destructive',
};

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'completed'];
