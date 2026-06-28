import { useEffect } from "react";
import { useStageNav } from "../context/StageNavContext";

export function useStageNavRegistration(
  current: number,
  total: number,
  canPrevious: boolean,
  canNext: boolean,
  onPrevious: () => void,
  onNext: () => void,
) {
  const { setStageNav } = useStageNav();

  useEffect(() => {
    if (total <= 0) {
      setStageNav(null);
      return;
    }

    setStageNav({
      current,
      total,
      canPrevious,
      canNext,
      onPrevious,
      onNext,
    });
    return () => setStageNav(null);
  }, [current, total, canPrevious, canNext, onPrevious, onNext, setStageNav]);
}
