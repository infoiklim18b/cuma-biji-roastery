import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserId() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? "");
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? "");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { userId, loading };
}
