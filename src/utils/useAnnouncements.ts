import { useEffect, useState } from "react";
import type { Announcement } from "../types/announcement";
import { ensureAnnouncementsSeeded, getActiveAnnouncements } from "./indexedDb";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await ensureAnnouncementsSeeded();
        const data = await getActiveAnnouncements();
        if (!active) return;
        setAnnouncements(data);
        setLoaded(true);
      } catch (err) {
        if (!active) return;
        setError(String(err));
        setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { announcements, loaded, error };
}
