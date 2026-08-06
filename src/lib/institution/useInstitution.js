import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useInstitution — loads the current user's institution (tenant context).
 * Tenant membership lives on the user as `institution_id`; switching updates
 * the user, which re-scopes every tenant-isolated RLS query automatically.
 */
export function useInstitution() {
  const [institution, setInstitution] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.institution_id) {
        try { setInstitution(await base44.entities.Institution.get(u.institution_id)); }
        catch { setInstitution(null); }
      } else setInstitution(null);
    } catch { setInstitution(null); setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return { institution, user, loading, reload: load };
}