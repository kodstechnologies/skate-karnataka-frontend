import { clubFormulaApi } from "@/api/club-formula-api";
import { districtFormulaApi } from "@/api/district-formula-api";
import { formulaApi } from "@/api/formula-api";

export const PORTAL_FORMULA_CONFIG = {
  admin: {
    api: formulaApi,
    optionsApi: null,
    basePath: "/events/formula",
    dashboardPath: "/dashboard",
    listLabel: "formula"
  },
  club: {
    api: clubFormulaApi,
    optionsApi: clubFormulaApi,
    basePath: "/club/formula",
    dashboardPath: "/club/dashboard",
    listLabel: "club formula"
  },
  district: {
    api: districtFormulaApi,
    optionsApi: districtFormulaApi,
    basePath: "/district/formula",
    dashboardPath: "/district/dashboard",
    listLabel: "district formula"
  }
};

export const isOrgFormulaPortal = (portalMode) =>
  portalMode === "club" || portalMode === "district";

export const getPortalFormulaConfig = (portalMode = "admin") =>
  PORTAL_FORMULA_CONFIG[portalMode] ?? PORTAL_FORMULA_CONFIG.admin;

/** @param {"club"|"district"|null|undefined} orgType */
export const getOrgFormulaPortalMode = (orgType) => {
  if (orgType === "club" || orgType === "district") return orgType;
  return "admin";
};

export const getOrgFormulaCreatePath = (orgType) =>
  `${getPortalFormulaConfig(getOrgFormulaPortalMode(orgType)).basePath}/create`;
