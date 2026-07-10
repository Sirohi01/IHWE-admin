import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Edit, FileText, Plus, Save, Trash2, X } from "lucide-react";
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

const EstimateTermsConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState(emptyForm);
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

  const startEdit = (config) => {
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

  const handleSave = async () => {
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
      await api.put(`/api/estimate-terms-config/${form.documentType}`, {
        ...form,
        termsAndConditions,
        paymentConditions,
        deliveryNotes,
        specialRemark: form.specialRemark.trim(),
        updatedBy: getAdminName(),
      });
      Swal.fire({ icon: "success", title: "Saved", text: `${form.displayName} config updated successfully`, timer: 1400, showConfirmButton: false });
      closeEdit();
      fetchConfigs();
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

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-xs uppercase text-gray-600">
              <th className="w-16 border border-gray-300 px-3 py-2 text-center">S.No.</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Config Title</th>
              <th className="w-28 border border-gray-300 px-3 py-2 text-center">Status</th>
              <th className="w-36 border border-gray-300 px-3 py-2 text-center">Updated By</th>
              <th className="w-24 border border-gray-300 px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="border border-gray-300 px-3 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : sortedConfigs.length ? (
              sortedConfigs.map((config, index) => (
                <tr key={config.documentType} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-1.5 font-bold text-[#23471d]">{config.displayName}</td>
                  <td className="border border-gray-300 px-3 py-1.5 font-medium text-gray-700">{config.title}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${config.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{config.status}</span>
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center text-xs text-gray-500">{config.updatedBy || "System"}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center">
                    <button type="button" onClick={() => startEdit(config)} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="border border-gray-300 px-3 py-6 text-center text-gray-500">No configs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingType && (
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
