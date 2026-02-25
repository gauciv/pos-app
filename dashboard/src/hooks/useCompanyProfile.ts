import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPut } from '@/lib/api';

interface CompanyProfile {
  id: string;
  company_name: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  receipt_footer: string | null;
  updated_at: string | null;
}

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<CompanyProfile>('/company-profile');
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<Omit<CompanyProfile, 'id' | 'updated_at'>>) => {
    const updated = await apiPut<CompanyProfile>('/company-profile', data);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
