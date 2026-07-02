import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

const CommunicationModal = ({ isOpen, onClose, type, docType, docId, refreshData }) => {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    
    // WhatsApp States
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [templateParams, setTemplateParams] = useState([]);
    
    // Email States
    const [email, setEmail] = useState('');
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        if (isOpen && docId) {
            fetchPreviewData();
        } else {
            // Reset state on close
            setPhone('');
            setMessage('');
            setTemplateParams([]);
            setEmail('');
            setHtmlContent('');
        }
    }, [isOpen, docId, type, docType]);

    const fetchPreviewData = async () => {
        setLoading(true);
        try {
            const apiBase = docType === 'proforma' ? '/api/estimates' : '/api/invoices';
            const endpoint = type === 'whatsapp' ? 'preview-whatsapp' : 'preview-email';
            
            const response = await api.get(`${apiBase}/${docId}/${endpoint}`);
            
            if (type === 'whatsapp') {
                setPhone(response.data.phone || '');
                setMessage(response.data.message || '');
                setTemplateParams(response.data.templateParams || []);
            } else {
                setEmail(response.data.email || '');
                setHtmlContent(response.data.htmlContent || '');
            }
        } catch (error) {
            console.error(`Error fetching ${type} preview:`, error);
            toast.error(error.response?.data?.message || `Failed to fetch ${type} preview`);
            onClose(); // Close if we can't preview
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const apiBase = docType === 'proforma' ? '/api/estimates' : '/api/invoices';
            const endpoint = type === 'whatsapp' ? 'send-whatsapp' : 'send-email';
            
            const payload = {};
            if (type === 'whatsapp') {
                if (!phone) {
                    toast.error("Phone number is required");
                    setSending(false);
                    return;
                }
                payload.customPhone = phone;
                payload.customMessage = message;
                payload.customTemplateParams = templateParams;
            } else {
                if (!email) {
                    toast.error("Email is required");
                    setSending(false);
                    return;
                }
                payload.customEmail = email;
                payload.customHtmlContent = htmlContent;
            }

            const response = await api.post(`${apiBase}/${docId}/${endpoint}`, payload);

            if (response.status === 200) {
                toast.success(`${type === 'whatsapp' ? 'WhatsApp' : 'Email'} sent successfully!`);
                if (refreshData) refreshData();
                onClose();
            }
        } catch (error) {
            console.error(`Error sending ${type}:`, error);
            toast.error(error.response?.data?.message || `Failed to send ${type}`);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-[1051]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {type === 'whatsapp' ? 'Preview & Send WhatsApp' : 'Preview & Send Email'} 
                        {' '} ({docType === 'proforma' ? 'Proforma Invoice' : 'Tax Invoice'})
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl font-bold leading-none"
                    >
                        &times;
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center p-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3598dc]"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {type === 'whatsapp' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input 
                                            type="text" 
                                            value={phone} 
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. 919876543210"
                                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#3598dc] focus:border-[#3598dc]"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Country code is required (e.g., 91 for India).
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea 
                                            rows={15}
                                            value={message} 
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#3598dc] focus:border-[#3598dc] font-mono text-sm whitespace-pre-wrap"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Note: Modifying this message will fallback to using a custom freeform template in AiSensy or standard Opus sender.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="client@example.com"
                                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-[#3598dc] focus:border-[#3598dc]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                            <RichTextEditor 
                                                value={htmlContent}
                                                onChange={(val) => setHtmlContent(val)}
                                                height={400}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                    <button 
                        onClick={onClose} 
                        disabled={sending}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend} 
                        disabled={loading || sending}
                        className="px-4 py-2 bg-[#3598dc] text-white rounded-md hover:bg-blue-600 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Sending...
                            </>
                        ) : (
                            <>Send {type === 'whatsapp' ? 'WhatsApp' : 'Email'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CommunicationModal;
