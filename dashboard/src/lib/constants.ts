export const statusBadge: Record<string, string> = {
  pending: 'bg-[#E5C07B]/10 text-[#E5C07B]',
  confirmed: 'bg-[#5B9BD5]/10 text-[#5B9BD5]',
  processing: 'bg-[#C678DD]/10 text-[#C678DD]',
  completed: 'bg-[#98C379]/10 text-[#98C379]',
  cancelled: 'bg-[#E06C75]/10 text-[#E06C75]',
};

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'completed'];
