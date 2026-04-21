import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOfficialsStore } from "@/features/admin/officials/store/officials-store";

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      role: null, // 'admin' (State) or 'subadmin' (State Official)
      isAuthenticated: false,

      login: (email, password) => {
        const normalizedEmail = email.toLowerCase();

        // 1. Check for Master Admin (Hardcoded for now as requested earlier)
        if (normalizedEmail === "admin@krsa.com") {
          set({
            user: { email, name: "Soumyan" },
            role: "admin",
            isAuthenticated: true
          });
          return "admin";
        }

        // 2. Check for State Official from store
        const official = useOfficialsStore
          .getState()
          .officials.find(
            (o) => o.email.toLowerCase() === normalizedEmail && o.password === password
          );

        if (official) {
          set({
            user: { email: official.email, name: official.fullName },
            role: "subadmin",
            isAuthenticated: true
          });
          return "subadmin";
        }

        // 3. Fallback for older "any official email" logic if no store match found
        // (to keep previous functionality working if needed)
        if (normalizedEmail.includes("official")) {
          set({
            user: { email, name: "Official User" },
            role: "subadmin",
            isAuthenticated: true
          });
          return "subadmin";
        }

        // 4. Default fallback (generic admin for other emails)
        set({
          user: { email, name: "Admin" },
          role: "admin",
          isAuthenticated: true
        });
        return "admin";
      },

      logout: () => {
        set({ user: null, role: null, isAuthenticated: false });
      }
    }),
    {
      name: "krsa-auth-store"
    }
  )
);
