import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { showError, showSuccess } from "../../utils/toastMessage";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../../features/add_by_admin/crm_wat_mess/CrmWatMessage";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const AddCrmWhatsappMessage = () => {
  const dispatch = useDispatch();
  const crmMessagesState = useSelector((state) => state.crmMessages);

  // ✅ Safe extraction: ensure messages is always an array
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

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError(
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong",
      );
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
      showError("Please fill in both the Title and Message fields!");
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
        showSuccess("Message updated successfully!");
      } else {
        await dispatch(createMessage(apiFormData)).unwrap();
        showSuccess("Message added successfully!");
      }
      resetForm();
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "Operation failed",
      );
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
    try {
      await dispatch(deleteMessage(itemId)).unwrap();
      showSuccess("Message deleted successfully!");
      if (editingMessage && editingMessage._id === itemId) resetForm();
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "Deletion failed",
      );
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
    <div
      className="w-full"
      style={{
        marginTop: "30px",
        backgroundColor: "#ecf0f5",
        minHeight: "100vh",
        padding: "0",
      }}
    >
      {/* Header Section */}
      <div
        className="w-full bg-white"
        style={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <div className="flex items-center justify-between px-6 py-1">
          <h1 className="text-xl font-normal" style={{ color: "#666" }}>
            WHATSAPP MESSAGES
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "20px" }}>
        {/* Add/Edit Section */}
        <form
          className="bg-white mb-5"
          style={{ border: "1px solid #ddd" }}
          onSubmit={handleAddMessage}
        >
          <div
            className="px-5 py-1"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#555", margin: 0 }}
            >
              {editingMessage ? "EDIT MESSAGE" : "ADD MESSAGE"}
            </h2>
          </div>

          <div className="p-6">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", gap: "24px", alignItems: "center" }}
              >
                {/* Title Field */}
                <div style={{ flex: 1 }}>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#333" }}
                  >
                    Title <span style={{ color: "#f44336" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="msg_name"
                    value={formData.msg_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm"
                    style={{ ...styles.input }}
                    placeholder="Enter message title"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Attachment Field */}
                <div style={{ flex: 1 }}>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#333" }}
                  >
                    Attachment
                  </label>
                  <div style={styles.customFileInput}>
                    <input
                      id="file_attach-input"
                      type="file"
                      name="file_attach"
                      onChange={handleChange}
                      style={styles.hiddenFileInput}
                      disabled={isLoading}
                    />
                    <div style={styles.fileInputText}>
                      {formData.file_attach
                        ? formData.file_attach.name
                        : editingMessage?.file_attach &&
                            editingMessage.file_attach !== "N/A"
                          ? `Current: ${editingMessage.file_attach.split("/").pop()}`
                          : "No file chosen"}
                    </div>
                    <button
                      type="button"
                      style={styles.fileInputButton}
                      onClick={handleChooseFileClick}
                      disabled={isLoading}
                    >
                      Choose File
                    </button>
                  </div>
                </div>

                {/* Status Field */}
                <div style={{ flex: 1 }}>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#333" }}
                  >
                    Status <span style={{ color: "#f44336" }}>*</span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      height: "40px",
                    }}
                  >
                    {["Active", "Inactive"].map((s) => (
                      <label key={s} style={styles.radioLabel}>
                        <input
                          type="radio"
                          name="msg_status"
                          value={s}
                          checked={formData.msg_status === s}
                          onChange={handleChange}
                          style={{ marginRight: 8 }}
                          disabled={isLoading}
                        />
                        <span style={{ color: "#333" }}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Field */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333" }}
                >
                  Write a Message <span style={{ color: "#f44336" }}>*</span>
                </label>
                <div style={styles.richTextEditor}>
                  <div style={styles.toolbar}>
                    <button
                      type="button"
                      style={styles.toolbarBtn}
                      onClick={() => applyFormatting("B")}
                      disabled={isLoading}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      style={styles.toolbarBtn}
                      onClick={() => applyFormatting("I")}
                      disabled={isLoading}
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.toolbarBtn, ...styles.previewBtn }}
                      onClick={() => setShowInlinePreview((prev) => !prev)}
                      disabled={isLoading}
                    >
                      <span style={{ marginRight: "4px" }}>🔍</span>
                      {showInlinePreview ? "Hide Preview" : "Show Preview"}
                    </button>
                  </div>
                  <textarea
                    name="msg_descr"
                    value={formData.msg_descr}
                    onChange={handleChange}
                    style={styles.textArea}
                    placeholder="Write your message here... (Use *text* for bold/header, _text_ for italics)"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Inline Preview */}
              {showInlinePreview && (
                <div style={styles.previewBox}>
                  <h4>WhatsApp Preview:</h4>
                  <div
                    style={styles.previewContent}
                    dangerouslySetInnerHTML={getPreviewContent(
                      formData.msg_descr,
                    )}
                  />
                </div>
              )}

              {/* Submit / Cancel */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 text-sm text-white"
                  style={{
                    backgroundColor: "#3598dc",
                    border: "none",
                    borderRadius: 3,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  disabled={isLoading}
                >
                  {isLoading
                    ? editingMessage
                      ? "Updating..."
                      : "Adding..."
                    : editingMessage
                      ? "Update Message"
                      : "Add Message"}
                </button>
                {editingMessage && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm"
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#e0e0e0",
                      color: "#333",
                      borderRadius: 3,
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* List Section */}
        <div className="bg-white" style={{ border: "1px solid #ddd" }}>
          <div
            className="px-5 py-3"
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: "#555", margin: 0 }}
            >
              LIST OF MESSAGE
            </h2>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f9f9f9",
                  zIndex: 1,
                }}
              >
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(60)}
                  >
                    No.
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-left"
                    style={thStyle(150)}
                  >
                    Title
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-left"
                    style={thStyle()}
                  >
                    Message
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-left"
                    style={thStyle(120)}
                  >
                    Attachment
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(100)}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-sm font-semibold text-center"
                    style={thStyle(120)}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && messages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#3598dc",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          marginRight: 10,
                          border: "3px solid #f3f3f3",
                          borderTop: "3px solid #3598dc",
                          borderRadius: "50%",
                          width: "16px",
                          height: "16px",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Loading Messages...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 24,
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  messages.map((item, index) => (
                    <tr
                      key={item._id || index}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-sm text-center"
                        style={{ color: "#333", width: 60 }}
                      >
                        {index + 1}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333", width: 150 }}
                      >
                        {item.msg_name}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333" }}
                      >
                        {(item.msg_descr || "").length > 50
                          ? item.msg_descr.substring(0, 50) + "..."
                          : item.msg_descr || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#333", width: 120 }}
                      >
                        {item.file_attach && item.file_attach !== "N/A" ? (
                          <a
                            href="javascript:void(0)"
                            onClick={(e) => e.preventDefault()}
                          >
                            {item.file_attach.split("/").pop()}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        style={{ width: 100 }}
                      >
                        <span
                          className="inline-block px-3 py-1 text-xs text-white"
                          style={{
                            backgroundColor:
                              item.msg_status?.toLowerCase() === "active"
                                ? "#337ab7"
                                : "#d9534f",
                            borderRadius: 3,
                          }}
                        >
                          {capitalize(item.msg_status)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ textAlign: "center", width: 120 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEdit(item._id)}
                            style={{
                              ...styles.iconBtn,
                              borderColor: "#337ab7",
                              color: "#337ab7",
                              opacity: isLoading ? 0.6 : 1,
                            }}
                            title="Edit"
                            disabled={isLoading}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            style={{
                              ...styles.iconBtn,
                              borderColor: "#d9534f",
                              color: "#d9534f",
                              opacity: isLoading ? 0.6 : 1,
                            }}
                            title="Delete"
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
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

const styles = {
  input: {
    border: "1px solid #d2d6de",
    borderRadius: 3,
    padding: "8px 10px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  customFileInput: {
    border: "1px solid #d2d6de",
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    height: "40px",
  },
  hiddenFileInput: { display: "none" },
  fileInputText: {
    flexGrow: 1,
    padding: "0 10px",
    fontSize: 14,
    color: "#555",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fileInputButton: {
    backgroundColor: "#e7e7e7",
    border: "none",
    padding: "8px 12px",
    color: "#333",
    fontSize: 14,
    borderLeft: "1px solid #d2d6de",
    cursor: "pointer",
    height: "100%",
  },
  radioLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  iconBtn: {
    padding: 6,
    border: "1px solid #ccc",
    backgroundColor: "white",
    cursor: "pointer",
  },
  richTextEditor: {
    border: "1px solid #ccc",
    borderRadius: "4px",
    overflow: "hidden",
  },
  toolbar: {
    padding: "8px",
    borderBottom: "1px solid #ccc",
    backgroundColor: "#f7f7f7",
    display: "flex",
    gap: "4px",
  },
  toolbarBtn: {
    background: "none",
    border: "1px solid #ccc",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  previewBtn: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textArea: {
    width: "100%",
    minHeight: "150px",
    border: "none",
    padding: "10px",
    outline: "none",
    resize: "vertical",
    fontSize: 14,
  },
  previewBox: {
    marginTop: 16,
    padding: 16,
    border: "1px solid #3598dc",
    backgroundColor: "#eaf5ff",
  },
  previewContent: {
    padding: 8,
    backgroundColor: "white",
    border: "1px solid #eee",
    whiteSpace: "pre-wrap",
  },
};

const thStyle = (width) => ({
  color: "#333",
  borderRight: "1px solid #ddd",
  textAlign: "center",
  width: width ? width : "auto",
  padding: "12px 8px",
});

export default AddCrmWhatsappMessage;
