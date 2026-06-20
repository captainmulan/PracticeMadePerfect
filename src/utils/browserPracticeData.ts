import { useEffect, useState } from "react";
import { getPracticePageData } from "./contentStore";
import { loadTasksFromBrowserSqlite } from "./sqliteBrowserTaskSource";

export function usePracticeData() {
  const [data, setData] = useState(getPracticePageData());

  useEffect(() => {
    let active = true;
    loadTasksFromBrowserSqlite()
      .then((tasks) => {
        if (!active) return;
        setData((prev) => ({ ...prev, tasks }));
      })
      .catch(() => {
        // Fallback to default/local storage data if browser SQLite isn't available.
      });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
