import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface StageNavState {
  current: number;
  total: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

interface StageNavContextValue {
  stageNav: StageNavState | null;
  setStageNav: (nav: StageNavState | null) => void;
}

const StageNavContext = createContext<StageNavContextValue | null>(null);

export function StageNavProvider({ children }: { children: ReactNode }) {
  const [stageNav, setStageNavState] = useState<StageNavState | null>(null);

  const setStageNav = useCallback((nav: StageNavState | null) => {
    setStageNavState(nav);
  }, []);

  const value = useMemo(
    () => ({
      stageNav,
      setStageNav,
    }),
    [stageNav, setStageNav],
  );

  return <StageNavContext.Provider value={value}>{children}</StageNavContext.Provider>;
}

export function useStageNav() {
  const context = useContext(StageNavContext);
  if (!context) {
    throw new Error("useStageNav must be used within StageNavProvider");
  }
  return context;
}
