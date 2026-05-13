import { createContext, useContext, type ReactNode } from "react";
import { useChurnPredictions, type ChurnPrediction } from "../hooks/useChurnPredictions";

interface ChurnCtx {
  riskMap: Map<string, ChurnPrediction>;
  riskMapByUsername: Map<string, ChurnPrediction>;
  loading: boolean;
  error: string | null;
}

const ChurnContext = createContext<ChurnCtx>({
  riskMap: new Map(), riskMapByUsername: new Map(), loading: true, error: null,
});

export function ChurnProvider({ children }: { children: ReactNode }) {
  const data = useChurnPredictions();
  return <ChurnContext.Provider value={data}>{children}</ChurnContext.Provider>;
}

export const useChurn = () => useContext(ChurnContext);