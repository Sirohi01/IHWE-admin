import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Plus,
    Type,
    Save,
    Image as ImageIcon,
    Edit,
    Check,
    Users,
    X,
    Layout,
    Linkedin,
    Mail,
    Quote,
    Link as LinkIcon
} from 'lucide-react';
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';


const OurTeam = () => {
    const [data, setData] = useState({
        subheading: 'OUR TEAM',
        heading: 'Guiding Visionary Spaces',
        highlightText: 'Visionary Spaces',
        description: 'Decades of expertise in crafting premium interiors and architectural excellence.',
        footerQuote: '"Our leadership\'s commitment to excellence ensures that each project reflects the highest standards of luxury and innovation."',
        buttonText: 'Work With Us',
        buttonUrl: '#',
        members: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState(null);

    const [memberForm, setMemberForm] = useState({
        name: '',
        position: '',
        altText: '',
        linkedinUrl: '',
        mailUrl: '',
        image: null
    });

    const [memberImagePreview, setMemberImagePreview] = useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/our-team');
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching Our Team data:', error);
            Swal.fire('Error', 'Failed to fetch section data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGlobalSubmit = async (e) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            const response = await api.post('/api/our-team/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description,
                footerQuote: data.footerQuote,
                buttonText: data.buttonText,
                buttonUrl: data.buttonUrl
            });

            if (response.data.success) {
                Swal.fire('Success', 'Section content updated successfully!', 'success');
                fetchData();
            }
        } catch (error) {
            console.error('Error saving headings:', error);
            Swal.fire('Error', 'Failed to update section content', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMemberImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMemberForm(prev => ({ ...prev, image: file }));
            setMemberImagePreview(URL.createObjectURL(file));
        }
    };

    const resetMemberForm = () => {
        setMemberForm({
            name: '',
            position: '',
            altText: '',
            linkedinUrl: '',
            mailUrl: '',
            image: null
        });
        setMemberImagePreview(null);
        setEditMode(false);
        setCurrentMemberId(null);
    };

    const openAddForm = () => {
        resetMemberForm();
        setEditMode(false);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const openEditForm = (member) => {
        setEditMode(true);
        setCurrentMemberId(member._id);
        setMemberForm({
            name: member.name,
            position: member.position,
            altText: member.altText || '',
            linkedinUrl: member.linkedinUrl || '',
            mailUrl: member.mailUrl || '',
            image: null
        });
        setMemberImagePreview(member.image ? (member.image.startsWith('http') ? member.image : `${SERVER_URL}${member.image}`) : null);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleMemberSubmit = async () => {
        if (!memberForm.name || !memberForm.position || (!editMode && !memberForm.image)) {
            Swal.fire('Error', 'Name, Position and Image are required', 'error');
            return;
        }

        setIsActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', memberForm.name);
            formData.append('position', memberForm.position);
            formData.append('altText', memberForm.altText);
            formData.append('linkedinUrl', memberForm.linkedinUrl);
            formData.append('mailUrl', memberForm.mailUrl);

            if (memberForm.image) {
                formData.append('image', memberForm.image);
            }

            let response;
            if (editMode) {
                response = await api.put(`/api/our-team/members/${currentMemberId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/our-team/members', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire('Success', editMode ? 'Member updated successfully' : 'Member added successfully', 'success');
                setShowForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error saving member:', error);
            Swal.fire('Error', 'Failed to save team member', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteMember = async (member) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete "${member.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/our-team/members/${member._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Member has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting member:', error);
                Swal.fire('Error', 'Failed to delete member', 'error');
            }
        }
    };

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => <div className="font-semibold">{index + 1}</div>
        },
        {
            key: "image",
            label: "PHOTO",
            render: (row) => (
                <img
                    src={`${SERVER_URL}${row.image}`}
                    alt={row.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                />
            )
        },
        {
            key: "name",
            label: "NAME",
            render: (row) => <div className="font-medium text-gray-800">{row.name}</div>
        },
        {
            key: "position",
            label: "DESIGNATION",
            render: (row) => <div className="text-gray-500 text-sm italic">{row.position}</div>
        },
        {
            key: "socials",
            label: "SOCIAL LINKS",
            render: (row) => (
                <div className="flex gap-2">
                    {row.linkedinUrl && <Linkedin className="w-4 h-4 text-blue-600" />}
                    {row.mailUrl && <Mail className="w-4 h-4 text-red-500" />}
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="OUR TEAM MANAGEMENT"
                description="Manage leadership team and section content"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Layout className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Section Content</h2>
                        </div>

                        <form onSubmit={handleGlobalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Highlight Text</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm resize-none"
                                />
                            </div>

                            <hr className="border-gray-100 my-4" />

                            <div className="flex items-center gap-2 mb-2">
                                <Quote className="w-3.5 h-3.5 text-[#DE802B]" />
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Footer Quote</label>
                            </div>
                            <textarea
                                value={data.footerQuote}
                                onChange={(e) => setData({ ...data, footerQuote: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm resize-none bg-orange-50/20"
                            />

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Button Text</label>
                                    <input
                                        type="text"
                                        value={data.buttonText}
                                        onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Button URL</label>
                                    <input
                                        type="text"
                                        value={data.buttonUrl}
                                        onChange={(e) => setData({ ...data, buttonUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isActionLoading}
                                className="w-full mt-6 py-2.5 bg-[#9E2A3A] text-white font-semibold rounded hover:bg-[#80222F] transition-colors flex items-center justify-center gap-2 uppercase text-xs shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isActionLoading ? 'Saving...' : 'Save Section Content'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Members Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Member Management Form */}
                    {showForm && (
                        <div ref={formRef} className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-[#1e3a8a] uppercase tracking-tight font-serif">
                                    {editMode ? 'Edit Team Member' : 'Add Team Member'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Form Left Side */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Full Name *</label>
                                        <input
                                            type="text"
                                            value={memberForm.name}
                                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800"
                                            placeholder="Ex: Mr. Vijay Sharma"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Designation / Position *</label>
                                        <input
                                            type="text"
                                            value={memberForm.position}
                                            onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800"
                                            placeholder="Ex: Managing Director"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Image Alt Text</label>
                                            <input
                                                type="text"
                                                value={memberForm.altText}
                                                onChange={(e) => setMemberForm({ ...memberForm, altText: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded text-sm placeholder:text-gray-300"
                                                placeholder="Profile photo description"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Right Side */}
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest flex items-center gap-2">
                                                <Linkedin className="w-3 h-3 text-blue-600" /> Linkedin URL
                                            </label>
                                            <input
                                                type="text"
                                                value={memberForm.linkedinUrl}
                                                onChange={(e) => setMemberForm({ ...memberForm, linkedinUrl: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-xs font-mono"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-red-500" /> Email / Mail URL
                                            </label>
                                            <input
                                                type="text"
                                                value={memberForm.mailUrl}
                                                onChange={(e) => setMemberForm({ ...memberForm, mailUrl: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400 rounded text-xs font-mono"
                                                placeholder="mailto:example@domain.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Member Photo *</label>
                                        <div className="border border-dashed border-gray-300 p-4 text-center relative group min-h-[120px] flex items-center justify-center bg-gray-50/30 rounded-lg hover:border-[#1e3a8a] transition-colors overflow-hidden">
                                            <input
                                                type="file"
                                                onChange={handleMemberImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                            />
                                            {memberImagePreview ? (
                                                <div className="relative w-full">
                                                    <img src={memberImagePreview} alt="Preview" className="w-full h-28 object-cover rounded shadow-sm" />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <ImageIcon className="w-6 h-6 text-gray-300 mb-2" />
                                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Drop member photo here</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2 border border-gray-300 font-semibold text-gray-500 hover:bg-white rounded transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMemberSubmit}
                                    disabled={isActionLoading}
                                    className="px-8 py-2 bg-[#1e3a8a] text-white font-semibold rounded hover:bg-[#162a63] transition-all shadow flex items-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50"
                                >
                                    {isActionLoading ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : <Check className="w-4 h-4" />}
                                    {editMode ? 'Save Changes' : 'Confirm Member'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Members List Table */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#1e3a8a] flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Management Team</h2>
                                <p className="text-[10px] text-blue-100 uppercase mt-0.5 font-medium">{data.members.length} Members listed</p>
                            </div>
                            {!showForm && (
                                <button
                                    onClick={openAddForm}
                                    className="px-4 py-1.5 bg-white text-[#1e3a8a] font-semibold text-[10px] uppercase rounded flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Team Member
                                </button>
                            )}
                        </div>
                        <div className="p-4 text-xs">
                            {isLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <Table
                                    columns={columns}
                                    data={data.members}
                                    onEdit={openEditForm}
                                    onDelete={handleDeleteMember}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurTeam;
