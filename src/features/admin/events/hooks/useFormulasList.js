import { useEffect, useState } from "react";
import { formulaApi } from "@/api/formula-api";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Failed to load formulas.";

export function useFormulasList() {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    formulaApi
      .getAllLight()
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data ?? res;
        const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
        setFormulas(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(extractError(err));
          setFormulas([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { formulas, formulasLoading: loading };
}
