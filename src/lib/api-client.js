import axios from "axios";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { "Content-Type": "application/json" }
});
