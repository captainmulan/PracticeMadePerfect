import { useEffect, useState } from "react";
import { loadAdminData, hasAdminData } from "./contentStore";
import { loadTasksFromBrowserSqlite } from "./sqliteBrowserTaskSource";

export function usePracticeData() {
  const [data, setData] = useState(loadAdminData().practicePageData);

  useEffect(() => {
    let active = true;

    loadTasksFromBrowserSqlite()
      .then((tasks) => {
        if (!active) return;
        if (!hasAdminData()) {
          setData((prev) => ({ ...prev, tasks }));
        }
      })
      .catch(() => {
        // If SQLite cannot load in-browser, keep existing localStorage/default data.
      });

    return () => {
      active = false;
    };
  }, []);

  return data;
}
