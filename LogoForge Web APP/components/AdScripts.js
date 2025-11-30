"use client";
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdScripts() {
  useEffect(() => {
    async function injectAds() {
      const { data } = await supabase.from('settings').select('*');
      if (!data) return;

      const headScript = data.find(s => s.key === 'ad_script_head')?.value;
      const popunder = data.find(s => s.key === 'ad_popunder_code')?.value;

      // Inject Head Script (AdSense/Global)
      if (headScript) {
        const script = document.createElement('script');
        script.innerHTML = headScript; 
        document.head.appendChild(script);
      }

      // Inject Popunder (Adsterra)
      if (popunder) {
        const script = document.createElement('script');
        script.innerHTML = popunder;
        document.body.appendChild(script);
      }
    }
    injectAds();
  }, []);

  return null;
}
