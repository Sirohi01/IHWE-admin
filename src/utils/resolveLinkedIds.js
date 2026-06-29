import api from "../lib/api";
export const resolveLinkedIds = async (id) => {
  const ids = new Set([id]);
  const addClientIds = (client) => {
    [
      client?._id,
      client?.clientId,
      client?.companyId,
      client?.exhibitorRegistrationId,
    ].filter(Boolean).forEach((value) => ids.add(String(value)));
  };

  try {
    const res = await api.get(`/api/companies/lookup/${id}`);
    const client = res.data;
    addClientIds(client);
    if (client?._source === "exhibitor" && client.clientId) {
      ids.add(client.clientId);
    } else if (client?._source === "company" && client.exhibitorRegistrationId) {
      ids.add(client.exhibitorRegistrationId);
    }
  } catch (err) {
    console.error("Failed to resolve linked company/exhibitor ids", err);
  }

  try {
    const companyRes = await api.get(`/api/companies/${id}`);
    addClientIds(companyRes.data?.data || companyRes.data);
  } catch (err) {
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      console.error("Failed to resolve company id", err);
    }
  }

  try {
    const exhibitorRes = await api.get(`/api/exhibitor-registration/${id}`);
    addClientIds(exhibitorRes.data?.data || exhibitorRes.data);
  } catch (err) {
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      console.error("Failed to resolve exhibitor id", err);
    }
  }

  return Array.from(ids);
};
