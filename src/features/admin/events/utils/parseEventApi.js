/** Unwrap event document from axios interceptor + ApiResponse shapes. */
export const unwrapEventPayload = (response) => {
  const body = response?.data ?? response;
  if (!body || typeof body !== "object") return null;

  if (body._id || body.header) {
    return body;
  }

  const inner = body.data;
  if (inner && typeof inner === "object" && (inner._id || inner.header)) {
    return inner;
  }

  return null;
};

export const unwrapApiMessage = (response) =>
  response?.message || response?.data?.message || "";

export const unwrapSkatingCategories = (response) => {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};
