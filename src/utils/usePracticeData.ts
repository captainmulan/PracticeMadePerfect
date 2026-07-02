import { useEffect, useState } from "react";
import type { PracticeTask } from "../data/tasks";
import { loadDefaultAdminData } from "./contentStore";
import { loadTasksFromBrowserSqlite } from "./sqliteBrowserTaskSource";

export function usePracticeData() {
  const [data, setData] = useState(() => ({
    ...loadDefaultAdminData().practicePageData,
    tasks: [] as PracticeTask[],
  }));

  useEffect(() => {
    let active = true;

    setData((prev) => ({ ...prev, tasks: [] }));

    loadTasksFromBrowserSqlite()
      .then((tasks) => {
        if (!active) return;
        setData((prev) => ({ ...prev, tasks }));
      })
      .catch(() => {
        if (!active) return;
        setData((prev) => ({ ...prev, tasks: [] }));
      });

    return () => {
      active = false;
    };
  }, []);

  return data;
}
