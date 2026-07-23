import api from "../lib/api";

export const PROFORMA_EVENT_NAME = "9th Edition of International Health & Wellness Expo (IHWE Global Edition)";
export const PROFORMA_PLACE_OF_SUPPLY = "Hall Nos. 12, Pragati Maidan, New Delhi - 110001, Bharat";

const roundAmount = (value) => Math.round(Number(value || 0));

export const placeOfSupplyFromState = (state = "") => {
  const lower = String(state || "").toLowerCase();
  if (lower.includes("delhi")) return "Delhi (07)";
  if (lower.includes("maharashtra")) return "Maharashtra (27)";
  if (lower.includes("uttar")) return "Uttar Pradesh (09)";
  if (lower.includes("haryana")) return "Haryana (06)";
  return state || "";
};

export const loadClientLikeProforma = async (id) => {
  if (!id) return null;

  try {
    const res = await api.get(`/api/companies/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      throw err;
    }
  }

  try {
    const res = await api.get(`/api/exhibitor-registration/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      throw err;
    }
  }

  const lookupRes = await api.get(`/api/companies/lookup/${id}`);
  return lookupRes.data?.data || lookupRes.data;
};

export const getLinkedClientIds = (id, client) => {
  return Array.from(new Set([
    id,
    client?._id,
    client?.clientId,
    client?.companyId,
    client?.exhibitorRegistrationId,
  ].filter(Boolean).map(String)));
};

export const getClientDisplayData = (client = {}) => {
  const firstContact = Array.isArray(client.contacts) ? client.contacts[0] : null;
  const contactName = firstContact
    ? [firstContact.firstName, firstContact.surname, firstContact.name].filter(Boolean)[0]
    : "";
  const address = client.address || client.companyAddress || [client.addressLine1, client.city, client.state].filter(Boolean).join(", ");

  return {
    name: client.companyName || client.exhibitorName || "",
    address,
    contactPerson: client.contactPerson || contactName || "",
    phone: client.mobile || client.contact1?.mobile || firstContact?.mobile || "",
    gst: client.gst || client.gstNo || client.gstNumber || "",
    country: client.country || "India",
    state: client.state || "",
    city: client.city || "",
    pincode: client.pinCode || client.pincode || "",
  };
};

export const fetchLatestEstimateForClient = async (id, client) => {
  const linkedIds = getLinkedClientIds(id, client);

  for (const clientId of linkedIds) {
    try {
      const res = await api.get(`/api/estimates/grouped/${clientId}`);
      if (res.data?.success && res.data?.count > 0) {
        return res.data.data[0];
      }
    } catch (err) {
      console.error("Failed to fetch grouped estimate", clientId, err);
    }
  }

  return null;
};

const getEstimateGstPct = (item) => {
  const gstRate = item.gstPct || item.gstRate || "18%";
  const igstPer = item.igst_per && Number(item.igst_per) > 0 ? `${item.igst_per}%` : "";
  const cgstPer = item.cgst_per && Number(item.cgst_per) > 0 ? `${Number(item.cgst_per) * 2}%` : "";
  return String(gstRate).match(/\d+/) ? String(gstRate).match(/\d+/)[0] + "%" : igstPer || cgstPer || "18%";
};

export const estimateItemsToInvoiceItems = (estimateItems = []) => {
  return estimateItems.map((item, idx) => {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 1;
    const size = item.size || "";
    const area = item.area || "";
    const normalizedSize = String(size).trim();
    const sizeAsNumber = Number(normalizedSize);
    const multiplier = Number(area) > 0 ? Number(area) : (Number.isFinite(sizeAsNumber) && sizeAsNumber > 0 ? sizeAsNumber : 1);
    const amount = roundAmount(Number(item.amount) || rate * qty * multiplier);
    const discountPct = Number(item.discountPct ?? item.disc ?? 0);
    const taxableValue = roundAmount(Number(item.taxableValue) || amount - (amount * discountPct) / 100);
    const gstPct = getEstimateGstPct(item);
    const gstRate = parseFloat(gstPct) || 0;
    const gstAmount = roundAmount(Number(item.gstAmount ?? item.tax) || taxableValue * (gstRate / 100));
    const total = roundAmount(Number(item.total ?? item.finalAmount) || taxableValue + gstAmount);

    return {
      id: item._id || Date.now() + idx,
      description: item.description || "",
      hsn: item.hsn || "",
      qty,
      size: normalizedSize || size || "",
      area: item.area || (Number.isFinite(sizeAsNumber) && sizeAsNumber > 0 ? String(sizeAsNumber) : normalizedSize || ""),
      unit: item.unit || "Nos",
      rate,
      amount,
      discountPct,
      taxableValue,
      gstPct,
      gstAmount,
      total,
    };
  });
};

export const estimateItemsToDebitNoteItems = (estimateItems = []) => {
  return estimateItemsToInvoiceItems(estimateItems).map((item) => ({
    id: item.id,
    description: item.description,
    hsn: item.hsn,
    qty: item.qty,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
    gstPct: item.gstPct,
    gstAmount: item.gstAmount,
    total: item.total,
    area: item.area,
    size: item.size,
    discountPct: item.discountPct,
  }));
};

export const estimateToInvoiceForm = (estimate, client, prev = {}) => {
  const clientData = getClientDisplayData(client);
  const companyName = estimate?.company_name || clientData.name;
  const companyAddress = estimate?.company_addr || clientData.address;
  const eventAddress = estimate?.event_place_of_supply || estimate?.consignee_addr || PROFORMA_PLACE_OF_SUPPLY;

  return {
    ...prev,
    companyId: estimate?.companyId || client?.clientId || client?._id || prev.companyId,
    clientName: companyName || prev.clientName,
    gstin: estimate?.company_gst_no || estimate?.gst_no || clientData.gst || prev.gstin,
    invoiceType: estimate?.est_type || prev.invoiceType || "Intrastate",
    invoiceDate: prev.invoiceDate,
    billingAddress: companyAddress || prev.billingAddress,
    shippingAddress: eventAddress || prev.shippingAddress,
    company_name: companyName || prev.company_name,
    company_addr: companyAddress || prev.company_addr,
    event_name: estimate?.event_name || PROFORMA_EVENT_NAME,
    consignee_name: estimate?.event_name || estimate?.consignee_name || PROFORMA_EVENT_NAME,
    consignee_addr: eventAddress || prev.consignee_addr,
    billingState: estimate?.state || clientData.state || prev.billingState,
    billingPin: estimate?.pincode || clientData.pincode || prev.billingPin,
    country: estimate?.country || clientData.country || prev.country,
    state: estimate?.state || clientData.state || prev.state,
    city: estimate?.city || clientData.city || prev.city,
    placeOfSupply: placeOfSupplyFromState(estimate?.state || clientData.state || prev.placeOfSupply),
    remarks: estimate?.remarks || prev.remarks,
  };
};

export const clientToInvoiceForm = (client, id, prev = {}) => {
  const clientData = getClientDisplayData(client);
  return {
    ...prev,
    companyId: client?.clientId || client?._id || id || prev.companyId,
    clientName: clientData.name || prev.clientName,
    gstin: clientData.gst || prev.gstin,
    billingAddress: clientData.address || prev.billingAddress,
    shippingAddress: clientData.address || prev.shippingAddress,
    company_name: clientData.name || prev.company_name,
    company_addr: clientData.address || prev.company_addr,
    consignee_name: clientData.name || prev.consignee_name,
    consignee_addr: clientData.address || prev.consignee_addr,
    billingState: clientData.state || prev.billingState,
    billingPin: clientData.pincode || prev.billingPin,
    country: clientData.country || prev.country,
    state: clientData.state || prev.state,
    city: clientData.city || prev.city,
    placeOfSupply: placeOfSupplyFromState(clientData.state || prev.placeOfSupply),
  };
};
