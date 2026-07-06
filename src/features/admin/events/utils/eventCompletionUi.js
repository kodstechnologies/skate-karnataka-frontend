import { resolveEventDisplayStatus } from "@/features/admin/events/utils/resolveEventDisplayStatus";

/** True when the event has finished (matches the "Completed" badge on event cards). */
export const isEventCompleted = (event) =>
  resolveEventDisplayStatus(event) === "completed";
