import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../../features/add_by_admin/crm_wat_mess/CrmWatMessage";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const AddCrmWhatsappMessage = () => {
  const dispatch = useDispatch();
  const crmMessagesState = useSelector((state) => state.crmMessages);

  const messages = Array.isArray(crmMessagesState?.messages)
    ? crmMessagesState.messages
    : [];
  const isLoading = crmMessagesState?.loading ?? false;
  const error = crmMessagesState?.error ?? null;

  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    msg_name: "",
    msg_descr: "",
    msg_status: "Active",
    file_attach: null,
  });
  const [showInlinePreview, setShowInlinePreview] = useState(false);

  const inputCls = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
  const labelCls = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error",
        text: typeof error === "string" ? error : error?.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file_attach" && files) {
      setFormData((prev) => ({ ...prev, file_attach: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      msg_name: "",
      msg_descr: "",
      msg_status: "Active",
      file_attach: null,
    });
    setEditingMessage(null);
    setShowInlinePreview(false);
  };

  const handleAddMessage = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.msg_name.trim() || !formData.msg_descr.trim()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in both the Title and Message fields!",
        icon: "warning",
        confirmButtonColor: "#23471d",
      });
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append("msg_name", formData.msg_name.trim());
    apiFormData.append("msg_descr", formData.msg_descr.trim());
    apiFormData.append("msg_status", formData.msg_status.toLowerCase());
    if (formData.file_attach) {
      apiFormData.append("file_attach", formData.file_attach);
    }

    try {
      if (editingMessage) {
        await dispatch(
          updateMessage({ id: editingMessage._id, formData: apiFormData }),
        ).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated WhatsApp template '${formData.msg_name}'`,
            section: "System Configuration",
            data: { action: "UPDATE", type: "WHATSAPP_TEMPLATE", name: formData.msg_name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Message updated successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      } else {
        await dispatch(createMessage(apiFormData)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Added new WhatsApp template '${formData.msg_name}'`,
            section: "System Configuration",
            data: { action: "ADD", type: "WHATSAPP_TEMPLATE", name: formData.msg_name }
          }));
        }

        Swal.fire({
          title: "Success!",
          text: "Message added successfully!",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
      }
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Operation Failed",
        text: typeof err === "string" ? err : err?.message || "Operation failed",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const handleEdit = (itemId) => {
    const itemToEdit = messages.find((item) => item._id === itemId);
    if (itemToEdit) {
      setFormData({
        msg_name: itemToEdit.msg_name,
        msg_descr: itemToEdit.msg_descr,
        msg_status: capitalize(itemToEdit.msg_status || "Inactive"),
        file_attach: null,
      });
      setEditingMessage(itemToEdit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (itemId) => {
    if (isLoading) return;
    const msgToDelete = messages.find(m => m._id === itemId);
    if (!msgToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete message template '${msgToDelete.msg_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteMessage(itemId)).unwrap();
        
        // Log activity
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted WhatsApp template '${msgToDelete.msg_name}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "WHATSAPP_TEMPLATE", name: msgToDelete.msg_name }
          }));
        }

        Swal.fire({
          title: "Deleted!",
          text: "Message has been deleted.",
          icon: "success",
          confirmButtonColor: "#23471d",
        });
        if (editingMessage && editingMessage._id === itemId) resetForm();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: typeof err === "string" ? err : err?.message || "Deletion failed",
          icon: "error",
          confirmButtonColor: "#23471d",
        });
      }
    }
  };

  const applyFormatting = (tag) => {
    const textarea = document.querySelector('textarea[name="msg_descr"]');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.msg_descr.substring(start, end);
    let newText = "";
    if (tag === "B" || tag === "H") {
      newText = `*${selectedText}*`;
    } else if (tag === "I") {
      newText = `_${selectedText}_`;
    }
    const newMessage =
      formData.msg_descr.substring(0, start) +
      newText +
      formData.msg_descr.substring(end);
    setFormData((prev) => ({ ...prev, msg_descr: newMessage }));
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + 1;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const getPreviewContent = (text) => {
    let previewHtml = text;
    previewHtml = previewHtml.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    previewHtml = previewHtml.replace(/_(.*?)_/g, "<em>$1</em>");
    previewHtml = previewHtml.replace(/\n/g, "<br />");
    return { __html: previewHtml };
  };

  const handleChooseFileClick = () => {
    document.getElementById("file_attach-input").click();
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
            WHATSAPP MESSAGE CONFIGURATION
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Communication Settings | CRM Management
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Form Container */}
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              {editingMessage ? "Edit Message Template" : "Compose New Message"}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            <form onSubmit={handleAddMessage}>
              <div className="flex flex-col gap-8">
                {/* Top Row: Title, File, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                  {/* Title */}
                  <div>
                    <label className={labelCls}>Message Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="msg_name"
                      value={formData.msg_name}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="e.g., Visitor Invitation"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Attachment */}
                  <div>
                    <label className={labelCls}>File Attachment</label>
                    <div className="relative group">
                      <input
                        id="file_attach-input"
                        type="file"
                        name="file_attach"
                        onChange={handleChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <div className="flex">
                        <div 
                          className="flex-grow h-8 border border-slate-400 rounded-l-[2px] px-3 flex items-center text-[11px] text-slate-500 bg-slate-50 truncate"
                        >
                          {formData.file_attach
                            ? formData.file_attach.name
                            : editingMessage?.file_attach && editingMessage.file_attach !== "N/A"
                              ? `Current: ${editingMessage.file_attach.split("/").pop()}`
                              : "No file selected"}
                        </div>
                        <button
                          type="button"
                          onClick={handleChooseFileClick}
                          disabled={isLoading}
                          className="h-8 px-4 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-r-[2px] hover:bg-slate-900 transition-colors"
                        >
                          Browse
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={labelCls}>Template Status <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-6 h-8">
                      <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="msg_status"
                          value="Active"
                          checked={formData.msg_status === "Active"}
                          onChange={handleChange}
                          className="accent-[#23471d]"
                          disabled={isLoading}
                        />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="msg_status"
                          value="Inactive"
                          checked={formData.msg_status === "Inactive"}
                          onChange={handleChange}
                          className="accent-[#23471d]"
                          disabled={isLoading}
                        />
                        Inactive
                      </label>
                    </div>
                  </div>
                </div>

                {/* Message Field with Formatting */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className={labelCls}>Message Content <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => applyFormatting("B")}
                        disabled={isLoading}
                        className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-50 rounded-[2px]"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("I")}
                        disabled={isLoading}
                        className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white text-slate-700 text-[12px] italic hover:bg-slate-50 rounded-[2px]"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInlinePreview((prev) => !prev)}
                        disabled={isLoading}
                        className={`px-3 h-7 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-[2px] ${
                          showInlinePreview ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    name="msg_descr"
                    value={formData.msg_descr}
                    onChange={handleChange}
                    className="w-full min-h-[160px] border border-slate-400 rounded-[2px] p-4 text-[13px] text-slate-700 font-medium focus:border-[#23471d] focus:ring-1 focus:ring-[#23471d]/10 outline-none transition-all placeholder:text-slate-300 leading-relaxed"
                    placeholder="Type your message here... Use *text* for Bold and _text_ for Italic."
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Inline Preview (WhatsApp Themed) */}
                {showInlinePreview && (
                  <div className="bg-[#e5ddd5] rounded-[4px] p-6 relative overflow-hidden animate-slideDown">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#075e54]/20"></div>
                    <div className="flex flex-col max-w-[85%]">
                      <div className="bg-white rounded-r-[8px] rounded-bl-[8px] p-3 shadow-sm relative">
                        <div className="text-[12px] font-bold text-[#075e54] mb-1">Preview</div>
                        <div 
                           className="text-[13px] text-slate-800 leading-relaxed wp-preview-text"
                           dangerouslySetInnerHTML={getPreviewContent(formData.msg_descr)}
                        />
                        <div className="text-[9px] text-slate-400 text-right mt-1">10:00 AM</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                {editingMessage && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
                    disabled={isLoading}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : editingMessage ? "Update Template" : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white uppercase tracking-tight">
                  Message Template Registry
                </h2>
                <p className="text-sm text-green-100 mt-0.5">
                  Total {messages.length} templates configured
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-20">S.No</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left w-[20%]">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left">Message Snippet</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-left w-[15%]">File</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-white uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && messages.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm italic">Loading templates...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm italic">No templates found</td></tr>
                ) : (
                  messages.map((item, index) => (
                    <tr key={item._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">{index + 1}</td>
                      <td 
                        onClick={() => handleEdit(item._id)}
                        className="px-6 py-4 text-sm text-red-600 hover:text-red-800 cursor-pointer hover:underline font-medium uppercase tracking-tight"
                      >
                        {item.msg_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.msg_descr}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.file_attach && item.file_attach !== "N/A" ? (
                          <span className="text-[#337ab7] font-bold flex items-center gap-2 cursor-pointer hover:underline">
                            🖇️ {item.file_attach.split("/").pop()}
                          </span>
                        ) : <span className="text-gray-300 italic">None</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.msg_status?.toLowerCase() === "active" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {item.msg_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(item._id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition" title="Edit" disabled={isLoading}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete" disabled={isLoading}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCrmWhatsappMessage;
