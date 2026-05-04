import api from "@/lib/axios";

export const contactUsApi = {
  get: () => api.get("/guest/v1/contact-us"),
  upsert: (data) => api.post("/guest/v1/contact-us", data)
};
