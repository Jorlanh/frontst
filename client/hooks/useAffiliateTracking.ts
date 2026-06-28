import { useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export function useAffiliateTracking(setAffiliateData: (data: any) => void) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const affid = urlParams.get('affid');

    // Track referral params in localStorage
    const ref = urlParams.get('ref');
    const src = urlParams.get('src');
    if (ref) localStorage.setItem('studr_referral_id', ref);
    if (src) localStorage.setItem('studr_referral_source', src);

    if (!affid) return;
    fetch(`${API_URL}/affiliate/${affid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAffiliateData(data); })
      .catch(() => {});
  }, []);
}
