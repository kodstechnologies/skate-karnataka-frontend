import { create } from "zustand";
import { persist } from "zustand/middleware";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `circular-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeFile = (fileValue) => {
  if (!fileValue) {
    return null;
  }

  if (typeof fileValue === "string") {
    return { name: fileValue, dataUrl: "" };
  }

  return {
    name: fileValue.name ?? "",
    dataUrl: fileValue.dataUrl ?? ""
  };
};

const defaultCircularFields = {
  title: "",
  content: "",
  contentType: "image",
  circularImage: null,
  videoTitle: "",
  videoBanner: null,
  videoFile: null,
  targetType: "State",
  selectedState: "",
  selectedDistrict: "",
  selectedClub: "",
  audience: ""
};

const withDefaultFields = (circular) => ({
  ...defaultCircularFields,
  ...circular,
  circularImage: normalizeFile(circular.circularImage),
  videoBanner: normalizeFile(circular.videoBanner),
  videoFile: normalizeFile(circular.videoFile)
});

const normalizePayload = (payload) => ({
  title: payload.title.trim(),
  content: payload.content.trim(),
  contentType: payload.contentType,
  circularImage: normalizeFile(payload.circularImage),
  videoTitle: payload.videoTitle.trim(),
  videoBanner: normalizeFile(payload.videoBanner),
  videoFile: normalizeFile(payload.videoFile),
  targetType: payload.targetType,
  selectedState: payload.selectedState,
  selectedDistrict: payload.selectedDistrict,
  selectedClub: payload.selectedClub,
  audience: payload.audience
});

export const useCircularsStore = create(
  persist(
    (set) => ({
      circulars: [],
      addCircular: (payload) =>
        set((state) => ({
          circulars: [{ id: createId(), ...normalizePayload(payload) }, ...state.circulars]
        })),
      updateCircular: (id, payload) =>
        set((state) => ({
          circulars: state.circulars.map((item) =>
            item.id === id ? { ...item, ...normalizePayload(payload) } : item
          )
        })),
      deleteCircular: (id) =>
        set((state) => ({
          circulars: state.circulars.filter((item) => item.id !== id)
        }))
    }),
    {
      name: "krsa-circulars-store",
      merge: (persistedState, currentState) => {
        const nextState = { ...currentState, ...(persistedState ?? {}) };
        return {
          ...nextState,
          circulars: (nextState.circulars ?? currentState.circulars).map(withDefaultFields)
        };
      }
    }
  )
);
