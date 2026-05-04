import api from "@/lib/axios";

const multipartHeaders = { "Content-Type": "multipart/form-data" };

export const aboutApi = {
  // GET latest about record
  getLatest: async () => {
    return api.get("/guest/v1/display-latest-about");
  },
  // POST create new about
  create: async (data) => {
    return api.post("/guest/v1/guest-about", data, { headers: multipartHeaders });
  },
  // PATCH update about (no ID — single record)
  update: async (data) => {
    return api.patch("/guest/v1/guest-about", data, { headers: multipartHeaders });
  },
  // DELETE about (no ID — deletes all/latest)
  delete: async () => {
    return api.delete("/guest/v1/guest-about");
  }
};
