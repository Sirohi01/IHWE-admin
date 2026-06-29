import api from "../lib/api";
export const resolveLinkedIds = async (id) => {
  const ids = new Set([id]);
  try {
    const res = await api.get(`/api/companies/lookup/${id}`);
    const client = res.data;
    if (client?._source === "exhibitor" && client.clientId) {
      ids.add(client.clientId);
    } else if (client?._source === "company" && client.exhibitorRegistrationId) {
      ids.add(client.exhibitorRegistrationId);
    }
  } catch (err) {
    console.error("Failed to resolve linked company/exhibitor ids", err);
  }
  return Array.from(ids);
};
