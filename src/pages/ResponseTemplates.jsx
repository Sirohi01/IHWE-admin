import React, { useState, useEffect } from 'react';
import { 
    Save, Mail, MessageSquare, Info, 
    Briefcase, CalendarCheck, PhoneCall, Eye, 
    ChevronRight, Copy, Layout, Trash2, Edit,
    Users, Ticket, GraduationCap, Building2,
    RefreshCw, Type, Smartphone, List, CheckCircle,
    Image as ImageIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';
import PageHeader from '../components/PageHeader';

const FORM_TYPES = [
    { id: 'corporate-visitor', label: 'Corporate Visitor', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'general-visitor', label: 'General Visitor', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'health-camp-visitor', label: 'Health Camp Visitor', icon: CalendarCheck, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'buyer-registration', label: 'Buyer Registration', icon: Ticket, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'exhibitor-registration', label: 'Exhibitor Registration', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'speaker-nomination', label: 'Speaker Nomination', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'contact-enquiry', label: 'Contact Enquiry', icon: Mail, color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const PLACEHOLDERS = {
    'corporate-visitor': ['[[NAME]]', '[[REG_ID]]', '[[EMAIL]]', '[[MOBILE]]', '[[CITY]]', '[[COUNTRY]]', '[[PURPOSE]]', '[[INTEREST]]', '[[QR_CODE]]'],
    'general-visitor': ['[[NAME]]', '[[REG_ID]]', '[[EMAIL]]', '[[MOBILE]]', '[[CITY]]', '[[COUNTRY]]', '[[PURPOSE]]', '[[INTEREST]]'],
    'health-camp-visitor': ['[[NAME]]', '[[REG_ID]]', '[[EMAIL]]', '[[MOBILE]]', '[[CITY]]', '[[COUNTRY]]', '[[PURPOSE]]', '[[INTEREST]]'],
    'buyer-registration': ['[[NAME]]', '[[EMAIL]]', '[[PHONE]]', '[[COMPANY]]', '[[CITY]]', '[[COUNTRY]]'],
    'exhibitor-registration': ['[[EXHIBITOR_NAME]]', '[[STALL_NO]]', '[[EVENT_NAME]]', '[[TOTAL_AMOUNT]]', '[[CURRENCY]]', '[[LOGIN_URL]]', '[[PASSWORD]]'],
    'speaker-nomination': ['[[FULL_NAME]]', '[[TOPIC]]', '[[EXPERTISE]]', '[[DESIGNATION]]', '[[ORGANIZATION]]', '[[CITY]]'],
    'contact-enquiry': ['[[NAME]]', '[[EMAIL]]', '[[PHONE]]', '[[SERVICE]]', '[[MESSAGE]]'],
};

const ResponseTemplates = () => {
    const [selectedType, setSelectedType] = useState('corporate-visitor');
    const [template, setTemplate] = useState({
        emailSubject: '',
        emailBody: '',
        whatsappBody: '',
        headerImage: null,
        footerImage: null,
    });
    const [headerImageFile, setHeaderImageFile] = useState(null);
    const [footerImageFile, setFooterImageFile] = useState(null);
    const [headerImagePreview, setHeaderImagePreview] = useState('');
    const [footerImagePreview, setFooterImagePreview] = useState('');
    const [removeHeaderImage, setRemoveHeaderImage] = useState(false);
    const [removeFooterImage, setRemoveFooterImage] = useState(false);
    const [allTemplates, setAllTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState('email');

    // Fetch all templates for the list
    const fetchAllTemplates = async () => {
        try {
            const response = await api.get('/api/message-templates');
            if (response.data.success) {
                setAllTemplates(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching all templates:', error);
        }
    };

    // Fetch single template for the editor
    const fetchTemplate = async (type) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/message-templates/${type}`);
            if (response.data.success) {
                const d = response.data.data;
                setTemplate({
                    emailSubject: d.emailSubject || '',
                    emailBody: d.emailBody || '',
                    whatsappBody: d.whatsappBody || '',
                    headerImage: d.headerImage || null,
                    footerImage: d.footerImage || null,
                });
                setHeaderImagePreview(d.headerImage ? `${SERVER_URL}${d.headerImage}` : '');
                setFooterImagePreview(d.footerImage ? `${SERVER_URL}${d.footerImage}` : '');
            } else {
                setTemplate({ emailSubject: '', emailBody: '', whatsappBody: '', headerImage: null, footerImage: null });
                setHeaderImagePreview('');
                setFooterImagePreview('');
            }
        } catch (error) {
            setTemplate({ emailSubject: '', emailBody: '', whatsappBody: '', headerImage: null, footerImage: null });
            setHeaderImagePreview('');
            setFooterImagePreview('');
        } finally {
            setLoading(false);
        }
        // Reset file inputs on type change
        setHeaderImageFile(null);
        setFooterImageFile(null);
        setRemoveHeaderImage(false);
        setRemoveFooterImage(false);
    };

    useEffect(() => {
        fetchAllTemplates();
    }, []);

    useEffect(() => {
        fetchTemplate(selectedType);
    }, [selectedType]);

    const handleSave = async () => {
        if (!template.emailSubject || !template.emailBody) {
             Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Email Subject and Body are required.' });
             return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('formType', selectedType);
            formData.append('emailSubject', template.emailSubject);
            formData.append('emailBody', template.emailBody);
            formData.append('whatsappBody', template.whatsappBody || '');
            if (headerImageFile) formData.append('headerImage', headerImageFile);
            if (footerImageFile) formData.append('footerImage', footerImageFile);
            if (removeHeaderImage) formData.append('removeHeaderImage', 'true');
            if (removeFooterImage) formData.append('removeFooterImage', 'true');

            const response = await api.post('/api/message-templates/upsert', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Saved!', text: 'Response template updated successfully.', timer: 1500, showConfirmButton: false });
                setHeaderImageFile(null);
                setFooterImageFile(null);
                setRemoveHeaderImage(false);
                setRemoveFooterImage(false);
                fetchAllTemplates();
                fetchTemplate(selectedType);
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to save template' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelect = (field, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (field === 'header') {
                setHeaderImageFile(file);
                setHeaderImagePreview(reader.result);
                setRemoveHeaderImage(false);
            } else {
                setFooterImageFile(file);
                setFooterImagePreview(reader.result);
                setRemoveFooterImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (field) => {
        if (field === 'header') {
            setHeaderImageFile(null);
            setHeaderImagePreview('');
            setRemoveHeaderImage(true);
        } else {
            setFooterImageFile(null);
            setFooterImagePreview('');
            setRemoveFooterImage(true);
        }
    };

    const handleDelete = async (type) => {
        const result = await Swal.fire({
            title: 'Delete Template?',
            text: `Are you sure you want to clear the template for ${type}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/message-templates/${type}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'The template has been cleared.', 'success');
                    fetchAllTemplates();
                    if (selectedType === type) {
                        setTemplate({ emailSubject: '', emailBody: '', whatsappBody: '' });
                    }
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete template', 'error');
            }
        }
    };

    const copyToClipboard = (tag) => {
        navigator.clipboard.writeText(tag);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Copied ${tag}`,
            showConfirmButton: false,
            timer: 1500
        });
    };

    const getTemplateStatus = (typeId) => {
        const found = allTemplates.find(t => t.formType === typeId);
        return found ? { exists: true, data: found } : { exists: false };
    };

    const renderEmailPreview = () => {
        const headerSection = headerImagePreview
            ? `<div style="line-height:0;"><img src="${headerImagePreview}" alt="Header" style="width:100%;display:block;" /></div>`
            : `<div style="background:linear-gradient(135deg,#23471d,#3d6b33);padding:30px;text-align:center;color:white;"><h1 style="margin:0;font-size:22px;">IHWE 2026</h1></div>`;
        const footerSection = footerImagePreview
            ? `<div style="line-height:0;"><img src="${footerImagePreview}" alt="Footer" style="width:100%;display:block;" /></div>`
            : `<div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #f3f4f6;"><p>&copy; 2026 IHWE | Global Health Connect. All rights reserved.</p></div>`;

        const shell = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .content { padding: 40px; background: #ffffff; }
                    .qr-section { text-align:center; margin:24px 0; padding:20px; background:#f9fafb; border-radius:8px; border:1px dashed #d1d5db; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${headerSection}
                    <div class="content">
                        ${template.emailBody || '<p style="color: #999; font-style: italic;">No body content defined...</p>'}
                        ${selectedType === 'corporate-visitor' ? `<div class="qr-section"><p style="font-weight:700;color:#23471d;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">QR Code will appear here</p><div style="width:150px;height:150px;background:#f3f4f6;border:2px dashed #d1d5db;margin:0 auto;display:flex;align-items:center;justify-content:center;border-radius:8px;"><span style="font-size:11px;color:#9ca3af;">QR CODE</span></div><p style="margin:10px 0 0;font-size:12px;color:#6b7280;">Registration ID: NGT/IHWE/CV/100001</p></div>` : ''}
                    </div>
                    ${footerSection}
                </div>
            </body>
            </html>
        `;
        return shell;
    };

    const currentForm = FORM_TYPES.find(f => f.id === selectedType);

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader 
                title="RESPONSE TEMPLATES MANAGEMENT" 
                description="Manage automated confirmation messages for all website forms"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                {/* LEFT: Editor & Placeholders (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Template Editor card */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Edit className="w-5 h-5 text-[#d26019]" /> Edit Message Template
                        </h2>
                        
                        <div className="bg-gray-50 p-3 mb-6 border border-gray-200 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${currentForm?.bg}`}>
                                {currentForm && <currentForm.icon className={currentForm.color} size={20} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Form</p>
                                <p className="text-sm font-bold text-gray-800">{currentForm?.label}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                                    <Type size={14} className="text-[#d26019]" /> Email Subject
                                </label>
                                <input
                                    type="text"
                                    value={template.emailSubject}
                                    onChange={(e) => setTemplate({...template, emailSubject: e.target.value})}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm font-medium"
                                    placeholder="Enter email subject line..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                                    <Mail size={14} className="text-[#d26019]" /> Email Body (Rich Text)
                                </label>
                                <div className="border border-gray-200 rounded overflow-hidden">
                                     <RichTextEditor 
                                        value={template.emailBody}
                                        onChange={(val) => setTemplate({...template, emailBody: val})}
                                        minHeight="300px"
                                        placeholder="Compose your dynamic email body..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                                    <Smartphone size={14} className="text-green-600" /> WhatsApp Message
                                </label>
                                <textarea
                                    value={template.whatsappBody}
                                    onChange={(e) => setTemplate({...template, whatsappBody: e.target.value})}
                                    rows={5}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-green-600 outline-none text-sm shadow-sm transition-all"
                                    placeholder="Enter whatsapp message text..."
                                />
                            </div>

                            {/* Header Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                                    <ImageIcon size={14} className="text-blue-600" /> Email Header Image
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded p-3 relative group hover:border-blue-400 transition-colors">
                                    {headerImagePreview ? (
                                        <div className="relative">
                                            <img src={headerImagePreview} alt="Header" className="w-full h-20 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage('header')}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center cursor-pointer py-2">
                                            <ImageIcon size={24} className="text-gray-300 mb-1" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to upload header image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect('header', e)} />
                                        </label>
                                    )}
                                    {!headerImagePreview && (
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageSelect('header', e)} />
                                    )}
                                </div>
                            </div>

                            {/* Footer Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                                    <ImageIcon size={14} className="text-orange-600" /> Email Footer Image
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded p-3 relative group hover:border-orange-400 transition-colors">
                                    {footerImagePreview ? (
                                        <div className="relative">
                                            <img src={footerImagePreview} alt="Footer" className="w-full h-20 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage('footer')}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center cursor-pointer py-2">
                                            <ImageIcon size={24} className="text-gray-300 mb-1" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to upload footer image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect('footer', e)} />
                                        </label>
                                    )}
                                    {!footerImagePreview && (
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageSelect('footer', e)} />
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    className="flex-1 py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    {saving ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Saving...' : 'Save Template'}
                                </button>
                                
                                <button
                                    onClick={() => handleDelete(selectedType)}
                                    disabled={loading || saving}
                                    className="px-5 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all font-bold group"
                                    title="Delete/Clear Template"
                                >
                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placeholders Library card */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <List className="w-5 h-5" /> Available Placeholders
                        </h2>
                        <p className="text-[11px] text-gray-400 font-bold uppercase mb-4 tracking-tighter">
                            Click to copy a tag. Use these in your text to insert user data.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PLACEHOLDERS[selectedType]?.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => copyToClipboard(tag)}
                                    className="px-3 py-1.5 bg-gray-50 hover:bg-[#23471d] hover:text-white text-[#23471d] font-mono text-[10px] border border-gray-200 transition-all flex items-center gap-2 group font-black rounded-sm"
                                >
                                    {tag}
                                    <Copy size={10} className="opacity-40 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT: Table of all templates (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* List Table Card */}
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-5 py-4 flex items-center justify-between">
                            <h2 className="text-white font-black text-sm flex items-center gap-3 tracking-widest uppercase">
                                <List className="w-5 h-5 text-[#d26019]" /> All Message Templates
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                {FORM_TYPES.length} FORMS
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">No.</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Form Type</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Subject Summary</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Last Update</th>
                                        <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {FORM_TYPES.map((form, idx) => {
                                        const status = getTemplateStatus(form.id);
                                        return (
                                            <tr 
                                                key={form.id} 
                                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedType === form.id ? 'bg-green-50/50' : ''}`}
                                                onClick={() => setSelectedType(form.id)}
                                            >
                                                <td className="px-6 py-4 text-sm font-black text-gray-300">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded ${form.bg}`}>
                                                            <form.icon className={form.color} size={16} />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-800">{form.label}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-gray-600 line-clamp-1 italic max-w-xs">
                                                        {status.data?.emailSubject || '---'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {status.exists ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-tighter">
                                                            <CheckCircle size={10} /> Saved
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-400 uppercase tracking-tighter">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                     <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-[#d26019] text-[9px] uppercase">
                                                            {status.data?.lastUpdatedBy?.username || '--'}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase">
                                                            {status.data?.updatedAt ? new Date(status.data.updatedAt).toLocaleDateString() : '--'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            className={`p-2 rounded-lg transition-all ${selectedType === form.id ? 'bg-[#23471d] text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                                                            title="Edit Template"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(form.id); }}
                                                            title="Delete Template"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-700 flex items-center gap-3">
                                <Eye size={18} className="text-[#d26019]" /> Live Template Preview
                            </h3>
                            <div className="flex bg-gray-200 p-1 rounded-lg">
                                <button 
                                    onClick={() => setPreviewMode('email')}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'email' ? 'bg-white shadow-sm text-[#23471d]' : 'text-gray-500'}`}
                                >
                                    Email
                                </button>
                                <button 
                                    onClick={() => setPreviewMode('whatsapp')}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'whatsapp' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-100 flex justify-center">
                            {previewMode === 'email' ? (
                                <div className="w-full max-w-[500px] h-[600px] bg-white border-8 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
                                     <div className="p-4 bg-gray-50 border-b border-gray-100 pt-8">
                                          <p className="text-[10px] font-black text-gray-300 uppercase">Sub: {template.emailSubject || '---'}</p>
                                     </div>
                                     <iframe 
                                        title="Email Preview"
                                        srcDoc={renderEmailPreview()}
                                        className="w-full h-full border-none bg-white"
                                     />
                                </div>
                            ) : (
                                <div className="w-[320px] h-[550px] bg-[#e5ddd5] border-8 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col">
                                    <div className="bg-[#075e54] p-6 text-white pt-10">
                                        <p className="text-xs font-bold">IHWE 2026</p>
                                        <p className="text-[8px] opacity-70">Automated Notification</p>
                                    </div>
                                    <div className="p-4 space-y-4 overflow-y-auto">
                                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow relative text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-w-[85%]">
                                            {template.whatsappBody || 'No WhatsApp content...'}
                                            <span className="block text-right text-[8px] text-gray-400 mt-1">✓✓ 4:32 PM</span>
                                        </div>
                                    </div>
                                    <div className="mt-auto bg-gray-100 p-3 border-t border-gray-200">
                                        <div className="bg-white h-8 rounded-full px-4 flex items-center text-[10px] text-gray-400">
                                            Reply Restricted
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResponseTemplates;
