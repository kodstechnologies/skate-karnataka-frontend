import { useEffect, useState } from "react";
import { formulaApi } from "@/api/formula-api";
import { getPortalFormulaConfig, isOrgFormulaPortal } from "@/features/admin/events/utils/portalFormulaConfig";
import toast from "react-hot-toast";

const extractError = (err) =>
  err?.response?.data?.message || err?.message || "Failed to load formulas.";

/**
 * @param {{ portalMode?: "admin" | "club" | "district" }} options
 */
export function useFormulasList({ portalMode = "admin" } = {}) {
  const [formulas, setFormulas] = useState([]);
  const [formulaSource, setFormulaSource] = useState("both");
  const [loading, setLoading] = useState(true);
  const config = getPortalFormulaConfig(portalMode);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const request = isOrgFormulaPortal(portalMode)
      ? config.optionsApi.getOptions()
      : formulaApi.getAllLight();

    request
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data ?? res;
        if (isOrgFormulaPortal(portalMode)) {
          const inner = payload?.data ?? payload;
          setFormulaSource(inner?.formulaSource ?? "both");
          const list = inner?.formulas ?? [];
          setFormulas(Array.isArray(list) ? list : []);
          return;
        }
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
  }, [portalMode, config.optionsApi]);

  return { formulas, formulasLoading: loading, formulaSource };
}
