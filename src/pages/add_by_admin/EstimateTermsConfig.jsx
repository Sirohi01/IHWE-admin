import React, { useEffect, useMemo, useState } from "react";
import { Clock3, CreditCard, Edit, FileText, History, Plus, Save, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";

const emptyForm = {
  documentType: "performa",
  displayName: "Performa",
  title: "performa",
  termsAndConditions: [""],
  paymentConditions: [""],
  deliveryNotes: [""],
  specialRemark: "",
  status: "active",
};

const getAdminName = () => {
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
  return adminInfo.fullName || adminInfo.name || adminInfo.username || "Admin";
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AuditCell = ({ name, date }) => (
  <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] leading-none">
    <span className="font-semibold text-gray-700">{name || "System"}</span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-1 font-normal text-gray-500">
      <Clock3 className="h-3 w-3" />
      {formatDateTime(date)}
    </span>
  </div>
);

const ListEditor = ({ title, icon: Icon, items, onChange, placeholder }) => {
  const updateItem = (index, value) => onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  const addItem = () => onChange([...items, ""]);
  const removeItem = (index) => onChange(items.length === 1 ? [""] : items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 bg-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#23471d]" />
          <h2 className="text-sm font-bold uppercase text-gray-800">{title}</h2>
        </div>
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 rounded bg-[#23471d] px-2 py-1 text-xs font-bold text-white hover:bg-[#1a3516]">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase text-gray-500">
            <th className="w-14 border border-gray-300 px-2 py-2 text-center">S.No.</th>
            <th className="border border-gray-300 px-2 py-2 text-left">Description</th>
            <th className="w-20 border border-gray-300 px-2 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-700">{index + 1}</td>
              <td className="border border-gray-300 px-2 py-1.5">
                <input
                  value={item}
                  onChange={(event) => updateItem(index, event.target.value)}
                  placeholder={placeholder}
                  className="h-8 w-full rounded border border-gray-200 px-2 text-sm font-medium text-gray-700 outline-none focus:border-[#23471d]"
                />
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">
                <button type="button" onClick={() => removeItem(index)} className="rounded bg-red-50 p-1 text-red-600 hover:bg-red-100" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PreviewList = ({ title, icon: Icon, items, emptyText }) => (
  <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
    <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-3 py-2">
      <Icon className="h-4 w-4 text-[#23471d]" />
      <h2 className="text-sm font-bold uppercase text-gray-800">{title}</h2>
    </div>
    {items?.length ? (
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase text-gray-500">
            <th className="w-14 border border-gray-300 px-2 py-2 text-center">S.No.</th>
            <th className="border border-gray-300 px-2 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${title}-${index}`} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-700">{index + 1}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-medium text-gray-700">{item}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="px-3 py-4 text-sm font-medium text-gray-500">{emptyText}</div>
    )}
  </div>
);

const AuditHistory = ({ logs = [] }) => (
  <div className="mt-4 overflow-hidden rounded-lg border border-gray-300 bg-white">
    <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-3 py-2">
      <History className="h-4 w-4 text-[#23471d]" />
      <h2 className="text-sm font-bold uppercase text-gray-800">Audit History</h2>
    </div>
    {logs.length ? (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500">
              <th className="w-16 border border-gray-300 px-2 py-2 text-center">S.No.</th>
              <th className="w-28 border border-gray-300 px-2 py-2 text-center">Action</th>
              <th className="w-40 border border-gray-300 px-2 py-2 text-center">By</th>
              <th className="w-44 border border-gray-300 px-2 py-2 text-center">Time</th>
              <th className="border border-gray-300 px-2 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={`${log.action}-${log.at}-${index}`} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-700">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${log.action === "CREATED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="border border-gray-300 px-2 py-1.5 text-center text-xs font-semibold text-gray-700">{log.by || "System"}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center text-xs text-gray-500">{formatDateTime(log.at)}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700">{log.details || "No details"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="px-3 py-4 text-sm font-medium text-gray-500">No audit history found</div>
    )}
  </div>
);

const EstimateTermsConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [activeType, setActiveType] = useState("performa");
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/estimate-terms-config");
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setConfigs(list);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not load document terms configs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const sortedConfigs = useMemo(() => {
    const order = ["performa", "tax-invoice", "delivery-challan"];
    return [...configs].sort((a, b) => order.indexOf(a.documentType) - order.indexOf(b.documentType));
  }, [configs]);

  const activeConfig = useMemo(() => (
    sortedConfigs.find((config) => config.documentType === activeType) || sortedConfigs[0]
  ), [activeType, sortedConfigs]);

  useEffect(() => {
    if (sortedConfigs.length && !sortedConfigs.some((config) => config.documentType === activeType)) {
      setActiveType(sortedConfigs[0].documentType);
    }
  }, [activeType, sortedConfigs]);

  const startEdit = (config) => {
    setActiveType(config.documentType);
    setEditingType(config.documentType);
    setForm({
      documentType: config.documentType,
      displayName: config.displayName || "",
      title: config.title || "",
      termsAndConditions: config.termsAndConditions?.length ? config.termsAndConditions : [""],
      paymentConditions: config.paymentConditions?.length ? config.paymentConditions : [""],
      deliveryNotes: config.deliveryNotes?.length ? config.deliveryNotes : [""],
      specialRemark: config.specialRemark || "",
      status: config.status || "active",
    });
  };

  const closeEdit = () => {
    setEditingType(null);
    setForm(emptyForm);
  };

  const handleTabChange = (documentType) => {
    setActiveType(documentType);
    if (editingType !== documentType) closeEdit();
  };

  const handleSave = async () => {
    if (saving) return;

    const termsAndConditions = form.termsAndConditions.map((item) => item.trim()).filter(Boolean);
    const paymentConditions = form.paymentConditions.map((item) => item.trim()).filter(Boolean);
    const deliveryNotes = form.deliveryNotes.map((item) => item.trim()).filter(Boolean);
    const isDeliveryChallan = form.documentType === "delivery-challan";

    if (!form.displayName.trim()) return Swal.fire("Missing Field", "Document name is required", "warning");
    if (!form.title.trim()) return Swal.fire("Missing Field", "Config title is required", "warning");
    if (!termsAndConditions.length) return Swal.fire("Missing Field", "Add at least one Terms and Conditions line", "warning");
    if (isDeliveryChallan && !deliveryNotes.length) return Swal.fire("Missing Field", "Add at least one Delivery Notes line", "warning");
    if (!isDeliveryChallan && !paymentConditions.length) return Swal.fire("Missing Field", "Add at least one Payment Conditions line", "warning");

    try {
      setSaving(true);
      const response = await api.put(`/api/estimate-terms-config/${form.documentType}`, {
        ...form,
        termsAndConditions,
        paymentConditions,
        deliveryNotes,
        specialRemark: form.specialRemark.trim(),
        updatedBy: getAdminName(),
      });
      const updatedConfig = response.data?.data;
      if (updatedConfig?.documentType) {
        setConfigs((previous) => previous.map((config) => (
          config.documentType === updatedConfig.documentType ? updatedConfig : config
        )));
      }
      Swal.fire({ icon: "success", title: "Saved", text: `${form.displayName} config updated successfully`, timer: 1400, showConfirmButton: false });
      closeEdit();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save document terms config", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 shadow-md mt-6">
      <PageHeader
        title="Document Terms Config"
        description="Manage Terms and Payment Conditions for Performa, Tax Invoice and Delivery Challan"
      />

      {loading ? (
        <div className="mt-6 rounded-lg border border-gray-300 px-3 py-8 text-center text-sm font-medium text-gray-500">Loading...</div>
      ) : sortedConfigs.length ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-300">
            {sortedConfigs.map((config) => (
              <button
                key={config.documentType}
                type="button"
                onClick={() => handleTabChange(config.documentType)}
                className={`-mb-px inline-flex items-center gap-2 rounded-t-lg border px-4 py-2 text-sm font-bold ${
                  activeConfig?.documentType === config.documentType
                    ? "border-gray-300 border-b-white bg-white text-[#23471d]"
                    : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FileText className="h-4 w-4" />
                {config.displayName}
              </button>
            ))}
          </div>

          {activeConfig && (
            <div className="rounded-b-lg border border-t-0 border-gray-300 bg-white p-4">
              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                      <th className="w-14 border border-gray-300 px-2 py-1.5 text-center">S.No.</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left">Name</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left">Config Title</th>
                      <th className="w-24 border border-gray-300 px-2 py-1.5 text-center">Status</th>
                      <th className="min-w-[220px] border border-gray-300 px-2 py-1.5 text-center">Created</th>
                      <th className="min-w-[240px] border border-gray-300 px-2 py-1.5 text-center">Last Updated</th>
                      <th className="w-20 border border-gray-300 px-2 py-1.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 text-center font-semibold">1</td>
                      <td className="border border-gray-300 px-2 py-1 font-bold text-[#23471d]">{activeConfig.displayName}</td>
                      <td className="border border-gray-300 px-2 py-1 font-medium text-gray-700">{activeConfig.title}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${activeConfig.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{activeConfig.status}</span>
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <AuditCell name={activeConfig.createdBy || "System"} date={activeConfig.createdAt} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <AuditCell name={activeConfig.updatedBy || "System"} date={activeConfig.updatedAt} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <button type="button" onClick={() => startEdit(activeConfig)} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {editingType !== activeConfig.documentType && (
                <div className="mt-4 grid gap-4">
                  <PreviewList title="Terms and Conditions" icon={FileText} items={activeConfig.termsAndConditions || []} emptyText="No terms added" />
                  {activeConfig.documentType === "delivery-challan" ? (
                    <>
                      <PreviewList title="Delivery Notes" icon={CreditCard} items={activeConfig.deliveryNotes || []} emptyText="No delivery notes added" />
                      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                        <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
                          <h2 className="text-sm font-bold uppercase text-gray-800">Special Remark</h2>
                        </div>
                        <div className="px-3 py-3 text-sm font-medium leading-6 text-gray-700">
                          {activeConfig.specialRemark || "No special remark added"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <PreviewList title="Payment Conditions" icon={CreditCard} items={activeConfig.paymentConditions || []} emptyText="No payment conditions added" />
                  )}
                  <AuditHistory logs={activeConfig.auditLogs || []} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-300 px-3 py-8 text-center text-sm font-medium text-gray-500">No configs found</div>
      )}

      {editingType && activeConfig?.documentType === editingType && (
        <div className="mt-6 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-gray-800">Edit {form.displayName}</h2>
            <button type="button" onClick={closeEdit} className="rounded bg-white p-1.5 text-gray-500 hover:text-gray-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px_140px]">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Name</label>
              <input value={form.displayName} onChange={(event) => setForm((previous) => ({ ...previous, displayName: event.target.value }))} className="h-10 w-full rounded border border-gray-300 px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#23471d]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Config Title</label>
              <input value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} className="h-10 w-full rounded border border-gray-300 px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#23471d]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Status</label>
              <select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))} className="h-10 w-full rounded border border-gray-300 px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#23471d]">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[#d26019] px-4 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <ListEditor title="Terms and Conditions" icon={FileText} items={form.termsAndConditions} onChange={(items) => setForm((previous) => ({ ...previous, termsAndConditions: items }))} placeholder="Enter terms and conditions line" />
            {form.documentType === "delivery-challan" ? (
              <>
                <ListEditor title="Delivery Notes" icon={CreditCard} items={form.deliveryNotes} onChange={(items) => setForm((previous) => ({ ...previous, deliveryNotes: items }))} placeholder="Enter delivery note line" />
                <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                  <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
                    <h2 className="text-sm font-bold uppercase text-gray-800">Special Remark</h2>
                  </div>
                  <div className="p-3">
                    <textarea
                      rows={4}
                      value={form.specialRemark}
                      onChange={(event) => setForm((previous) => ({ ...previous, specialRemark: event.target.value }))}
                      placeholder="Enter special remark"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#23471d]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <ListEditor title="Payment Conditions" icon={CreditCard} items={form.paymentConditions} onChange={(items) => setForm((previous) => ({ ...previous, paymentConditions: items }))} placeholder="Enter payment condition line" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateTermsConfig;
