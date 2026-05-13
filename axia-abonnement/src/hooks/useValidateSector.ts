import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface SectorResult {
  valid: boolean;
  score: number;
  message: string;
}

export function useValidateSector(
  intitule: string,
  description: string,
  secteur: string,
) {
  const [result, setResult] = useState<SectorResult | null>(null);
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!secteur || intitule.trim().length < 3 || description.trim().length < 5) {
      setResult(null);
      return;
    }

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.post(
          "http://localhost:8000/validate-sector",
          { intitule, description, secteur },
          { headers: { "x-api-key": "axia-ml-secret-2025" } },
        );
        setResult(res.data as SectorResult);
      } catch {
        setResult(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [intitule, description, secteur]);

  return { result, checking };
}