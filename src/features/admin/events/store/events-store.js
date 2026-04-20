import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeImage = (imageValue) => {
  if (!imageValue) {
    return null;
  }

  if (typeof imageValue === "string") {
    return {
      name: imageValue,
      dataUrl: ""
    };
  }

  return {
    name: imageValue.name ?? "",
    dataUrl: imageValue.dataUrl ?? ""
  };
};

const defaultEventFields = {
  title: "",
  description: "",
  address: "",
  registrationStartDateTime: "",
  registrationEndDateTime: "",
  eventStartDateTime: "",
  eventEndDateTime: "",
  eventType: "",
  eventFor: "",
  status: "draft",
  price: "",
  coverImage: null
};

const withDefaultFields = (event) => ({
  ...defaultEventFields,
  ...event,
  coverImage: normalizeImage(event.coverImage)
});

const seedEvents = [
  {
    id: createId(),
    title: "KRSA State Roller Championship 2026",
    description:
      "A state-level championship for speed, artistic, and inline categories with district-wise participation.",
    address: "Kanteerava Stadium, Bengaluru",
    registrationStartDateTime: "2026-05-01T09:00",
    registrationEndDateTime: "2026-05-20T18:00",
    eventStartDateTime: "2026-06-01T08:00",
    eventEndDateTime: "2026-06-03T20:00",
    eventType: "state",
    eventFor: "Karnataka",
    status: "public",
    price: "1200",
    coverImage: null
  },
  {
    id: createId(),
    title: "Mysuru District Selection Trials",
    description:
      "District selection event for junior and senior skaters to qualify for the state team.",
    address: "Chamundi Sports Track, Mysuru",
    registrationStartDateTime: "2026-04-15T10:00",
    registrationEndDateTime: "2026-04-28T19:00",
    eventStartDateTime: "2026-05-04T07:30",
    eventEndDateTime: "2026-05-04T17:30",
    eventType: "district",
    eventFor: "Mysuru",
    status: "draft",
    price: "450",
    coverImage: null
  },
  {
    id: createId(),
    title: "Coastal Speed Club Summer Camp",
    description: "Focused endurance and sprint drills camp hosted by Coastal Speed Club.",
    address: "Malpe Sports Complex, Udupi",
    registrationStartDateTime: "2026-04-10T09:30",
    registrationEndDateTime: "2026-04-22T17:30",
    eventStartDateTime: "2026-05-10T06:30",
    eventEndDateTime: "2026-05-14T19:00",
    eventType: "club",
    eventFor: "Coastal Speed Club",
    status: "public",
    price: "850",
    coverImage: null
  }
].map(withDefaultFields);

const normalizePayload = (payload) => ({
  title: payload.title.trim(),
  description: payload.description.trim(),
  address: payload.address.trim(),
  registrationStartDateTime: payload.registrationStartDateTime,
  registrationEndDateTime: payload.registrationEndDateTime,
  eventStartDateTime: payload.eventStartDateTime,
  eventEndDateTime: payload.eventEndDateTime,
  eventType: payload.eventType,
  eventFor: payload.eventFor,
  status: payload.status,
  price: payload.price.trim(),
  coverImage: payload.coverImage ? normalizeImage(payload.coverImage) : null
});

export const useEventsStore = create(
  persist(
    (set) => ({
      events: seedEvents,
      addEvent: (payload) =>
        set((state) => ({
          events: [{ id: createId(), ...normalizePayload(payload) }, ...state.events]
        })),
      updateEvent: (id, payload) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...normalizePayload(payload) } : event
          )
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        }))
    }),
    {
      name: "krsa-events-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };

        return {
          ...nextState,
          events: (nextState.events ?? currentState.events).map(withDefaultFields)
        };
      }
    }
  )
);
