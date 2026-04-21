import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `official-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const seedOfficials = [
  {
    id: "official-1",
    fullName: "Ramesh Kumar",
    email: "ramesh.official@krsa.com",
    phone: "9876543210",
    designation: "Technical Official",
    status: "active",
    password: "password123",
    createdAt: "2026-04-10T10:30:00Z",
    logs: [
      {
        id: "log-1",
        action: "Approved Skater",
        target: "John Doe",
        timestamp: "2026-04-20T14:20:00Z"
      },
      {
        id: "log-2",
        action: "Created Event",
        target: "State Meet 2026",
        timestamp: "2026-04-19T11:15:00Z"
      },
      {
        id: "log-3",
        action: "Updated Club Details",
        target: "Velocity Blades",
        timestamp: "2026-04-18T09:45:00Z"
      }
    ]
  },
  {
    id: "official-2",
    fullName: "Sushma Rao",
    email: "sushma.official@krsa.com",
    phone: "9123456789",
    designation: "District Coordinator",
    status: "active",
    password: "password123",
    createdAt: "2026-04-12T15:20:00Z",
    logs: [
      {
        id: "log-4",
        action: "Rejected Request",
        target: "Academy Alpha",
        timestamp: "2026-04-21T10:00:00Z"
      },
      {
        id: "log-5",
        action: "Published Circular",
        target: "Safety Guidelines",
        timestamp: "2026-04-15T16:30:00Z"
      }
    ]
  }
];

export const useOfficialsStore = create()(
  persist(
    (set) => ({
      officials: seedOfficials,

      addOfficial: (payload) =>
        set((state) => ({
          officials: [
            {
              id: createId(),
              ...payload,
              status: payload.status || "active",
              createdAt: new Date().toISOString(),
              logs: []
            },
            ...state.officials
          ]
        })),

      updateOfficial: (id, payload) =>
        set((state) => ({
          officials: state.officials.map((o) => (o.id === id ? { ...o, ...payload } : o))
        })),

      deleteOfficial: (id) =>
        set((state) => ({
          officials: state.officials.filter((o) => o.id !== id)
        })),

      addLog: (officialId, action, target) =>
        set((state) => ({
          officials: state.officials.map((o) =>
            o.id === officialId
              ? {
                  ...o,
                  logs: [
                    {
                      id: `log-${Date.now()}`,
                      action,
                      target,
                      timestamp: new Date().toISOString()
                    },
                    ...o.logs
                  ]
                }
              : o
          )
        }))
    }),
    {
      name: "krsa-officials-store"
    }
  )
);
