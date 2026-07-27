import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, CalendarCheck, UserCheck } from "lucide-react";
import Swal from "sweetalert2";
import { updateCompany, bulkAssignCompanies } from "../../features/company/companySlice";
import SearchableDropdown from "../../components/SearchableDropdown";

// Assigns Events (multi-select) and/or a handling Person to one company
// (mode="single", replaces that company's event list exactly as checked) or
// many companies at once (mode="bulk", additively assigns — existing
// per-company event tags are kept, not overwritten).
const AssignModal = ({ mode, companyIds, initialEventIds = [], initialForwardTo = "", events, admins, onClose, onDone }) => {
  const dispatch = useDispatch();
  const [selectedEventIds, setSelectedEventIds] = useState(initialEventIds.map(String));
  const [selectedPerson, setSelectedPerson] = useState(initialForwardTo || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedEventIds(initialEventIds.map(String));
    setSelectedPerson(initialForwardTo || "");
  }, [initialEventIds, initialForwardTo]);

  const toggleEvent = (id) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const personOptions = (admins || []).map((u) => ({
    label: u.fullName || u.username,
    value: u.username,
  }));

  const handleSubmit = async () => {
    if (mode === "bulk" && selectedEventIds.length === 0 && !selectedPerson) {
      Swal.fire({ title: "Nothing to assign", text: "Pick at least one event or a person.", icon: "warning", confirmButtonColor: "#23471d" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "single") {
        await dispatch(
          updateCompany({
            id: companyIds[0],
            data: {
              events: selectedEventIds,
              ...(selectedPerson ? { forwardTo: selectedPerson } : {}),
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          bulkAssignCompanies({
            companyIds,
            eventIds: selectedEventIds.length ? selectedEventIds : undefined,
            forwardTo: selectedPerson || undefined,
          })
        ).unwrap();
      }
      Swal.fire({ title: "Assigned!", text: "Companies were assigned successfully.", icon: "success", confirmButtonColor: "#23471d", timer: 1800 });
      onDone();
    } catch (err) {
      Swal.fire({ title: "Error", text: typeof err === "string" ? err : "Failed to assign.", icon: "error", confirmButtonColor: "#23471d" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-visible">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight uppercase">
              {mode === "bulk" ? `Assign ${companyIds.length} Companies` : "Assign Company"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {mode === "bulk"
                ? "Tag selected events and/or forward to a person. Existing event tags on each company are kept."
                : "Choose which events this company belongs to, and who it's forwarded to."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
              <CalendarCheck className="w-3.5 h-3.5" /> Events
            </label>
            <div className="border border-gray-300 rounded-sm max-h-48 overflow-y-auto divide-y divide-gray-100">
              {(events || []).length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-400 text-center">No events found. Create one first.</div>
              ) : (
                events.map((ev) => (
                  <label key={ev._id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[#eef5ec]">
                    <input
                      type="checkbox"
                      className="accent-[#23471d]"
                      checked={selectedEventIds.includes(String(ev._id))}
                      onChange={() => toggleEvent(String(ev._id))}
                    />
                    <span className="font-medium text-gray-800">{ev.event_fullName || ev.event_name}</span>
                    {ev.event_name && ev.event_fullName && (
                      <span className="text-[11px] text-gray-400">({ev.event_name})</span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
              <UserCheck className="w-3.5 h-3.5" /> Forward To
            </label>
            <SearchableDropdown
              options={personOptions}
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              placeholder={mode === "bulk" ? "Leave blank to keep current assignee" : "Select a person"}
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-sm flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-sm transition-colors uppercase tracking-wider shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 text-xs font-bold text-white rounded-sm transition-all shadow-sm uppercase tracking-wider ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#23471d] hover:bg-[#1a3516]"
            }`}
          >
            {submitting ? "Saving..." : "Save Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
