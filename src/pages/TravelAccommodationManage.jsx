import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    MapPin, Save, Plus, Trash2, Edit,
    Hotel, Car, Train, Mail, Phone,
    Globe, HelpCircle, Image as ImageIcon, MapPinned, Info
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'Car', icon: Car },
    { name: 'Train', icon: Train },
    { name: 'MapPin', icon: MapPin },
    { name: 'MapPinned', icon: MapPinned },
    { name: 'Info', icon: Info },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return <Info {...props} />;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const TravelAccommodationManage = () => {
    const [data, setData] = useState({
        venueHeading: "Venue Location",
        mapIframe: '',
        commuteHeading: "Commute Options",
        commuteSubtitle: "How to reach the venue",
        accommodationHeading: "Accommodation Options",
        accommodationSubtitle: "Enjoy a comfortable stay near the venue.",
        helpHeading: "Need Help Booking?",
        helpDescription: "For travel assistance...",
        contactEmail: "travel@ihwe.com",
        contactPhone: "+91-98765-43210",
        commuteOptions: [],
        hotelOptions: []
    });

    const [isLoading, setIsLoading] = useState(false);
    
    // Commute Form & State
    const [commuteForm, setCommuteForm] = useState({ icon: 'Car', title: '', description: '' });
    const [isEditingCommute, setIsEditingCommute] = useState(false);
    const [editingCommuteId, setEditingCommuteId] = useState(null);
    
    // Hotel Form & State
    const [hotelForm, setHotelForm] = useState({ 
        title: '', image: '', tag: '', distance: '', rate: '', stars: 5, alt: '' 
    });
    const [hotelImageFile, setHotelImageFile] = useState(null);
    const [hotelImagePreview, setHotelImagePreview] = useState('');
    const [isEditingHotel, setIsEditingHotel] = useState(false);
    const [editingHotelId, setEditingHotelId] = useState(null);
    const hotelFileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/travel-accommodation');
            if (res.data.success) setData(res.data.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetCommuteForm = () => {
        setCommuteForm({ icon: 'Car', title: '', description: '' });
        setIsEditingCommute(false);
        setEditingCommuteId(null);
    };

    const handleEditCommute = (item) => {
        setCommuteForm({ icon: item.icon, title: item.title, description: item.description });
        setIsEditingCommute(true);
        setEditingCommuteId(item._id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleSubmitCommute = async () => {
        if (!commuteForm.title || !commuteForm.description) {
            Swal.fire('Warning', 'Title and description are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            const endpoint = isEditingCommute 
                ? `/api/travel-accommodation/commute/${editingCommuteId}` 
                : '/api/travel-accommodation/commute/add';
            const method = isEditingCommute ? 'put' : 'post';

            const res = await api[method](endpoint, commuteForm);
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: isEditingCommute ? 'Updated!' : 'Added!', timer: 1200, showConfirmButton: false });
                resetCommuteForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Action failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateHeadings = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/travel-accommodation/update-headings', {
                venueHeading: data.venueHeading,
                mapIframe: data.mapIframe,
                commuteHeading: data.commuteHeading,
                commuteSubtitle: data.commuteSubtitle,
                accommodationHeading: data.accommodationHeading,
                accommodationSubtitle: data.accommodationSubtitle,
                helpHeading: data.helpHeading,
                helpDescription: data.helpDescription,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone
            });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Global Settings Saved!', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save settings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCommute = async (id) => {
        const result = await Swal.fire({ title: 'Delete?', text: "Permanent action", icon: 'warning', showCancelButton: true });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/travel-accommodation/commute/${id}`);
            fetchData();
        } catch (error) { Swal.fire('Error', 'Delete failed', 'error'); }
    };

    const handleHotelImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setHotelImageFile(file);
        setHotelImagePreview(URL.createObjectURL(file));
    };

    const resetHotelForm = () => {
        setHotelForm({ title: '', image: '', tag: '', distance: '', rate: '', stars: 5, alt: '' });
        setHotelImagePreview('');
        setHotelImageFile(null);
        setIsEditingHotel(false);
        setEditingHotelId(null);
        if (hotelFileInputRef.current) hotelFileInputRef.current.value = '';
    };

    const handleEditHotel = (hotel) => {
        setHotelForm({ 
            title: hotel.title, 
            image: hotel.image, 
            tag: hotel.tag, 
            distance: hotel.distance, 
            rate: hotel.rate, 
            stars: hotel.stars, 
            alt: hotel.alt 
        });
        setHotelImagePreview(`${SERVER_URL}${hotel.image}`);
        setIsEditingHotel(true);
        setEditingHotelId(hotel._id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleSubmitHotel = async () => {
        if (!hotelForm.title || !hotelForm.rate || (!hotelImageFile && !hotelForm.image)) {
            Swal.fire('Warning', 'Title, Rate and Image are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let finalImageUrl = hotelForm.image;
            if (hotelImageFile) {
                const formData = new FormData();
                formData.append('image', hotelImageFile);
                const uploadRes = await api.post('/api/travel-accommodation/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) finalImageUrl = uploadRes.data.url;
            }
            
            const endpoint = isEditingHotel 
                ? `/api/travel-accommodation/hotel/${editingHotelId}` 
                : '/api/travel-accommodation/hotel/add';
            const method = isEditingHotel ? 'put' : 'post';

            const res = await api[method](endpoint, { ...hotelForm, image: finalImageUrl });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: isEditingHotel ? 'Hotel Updated!' : 'Hotel Added!', timer: 1200, showConfirmButton: false });
                resetHotelForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Save failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteHotel = async (id) => {
        const result = await Swal.fire({ title: 'Delete hotel?', icon: 'warning', showCancelButton: true });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/travel-accommodation/hotel/${id}`);
            fetchData();
        } catch (error) { Swal.fire('Error', 'Delete failed', 'error'); }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter">
            <PageHeader 
                title="TRAVEL & ACCOMMODATION MANAGEMENT" 
                description="Manage venue location, commute options, and hotel recommendations."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                
                {/* ── SECTION 1: GLOBAL HEADINGS & MAP ── */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-100 p-6 shadow-sm rounded-lg">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <MapPinned className="w-5 h-5 text-[#d26019]" /> Global Settings & Map
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Venue Title</label>
                                <input type="text" value={data.venueHeading} onChange={(e)=>setData({...data, venueHeading: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Google Maps Iframe Embed Code</label>
                                <textarea value={data.mapIframe} onChange={(e)=>setData({...data, mapIframe: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md h-24 text-xs font-mono" placeholder='<iframe src="..." ...></iframe>' />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Commute Section Title</label>
                                    <input type="text" value={data.commuteHeading} onChange={(e)=>setData({...data, commuteHeading: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Commute Subtitle</label>
                                    <input type="text" value={data.commuteSubtitle} onChange={(e)=>setData({...data, commuteSubtitle: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hotel Section Title</label>
                                    <input type="text" value={data.accommodationHeading} onChange={(e)=>setData({...data, accommodationHeading: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hotel Subtitle</label>
                                    <input type="text" value={data.accommodationSubtitle} onChange={(e)=>setData({...data, accommodationSubtitle: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none rounded-md" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-xs font-black text-[#d26019] uppercase mb-3">Concierge & Help Section</h3>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Help Heading" value={data.helpHeading} onChange={(e)=>setData({...data, helpHeading: e.target.value})} className="w-full px-4 py-2 border border-gray-200 text-sm" />
                                    <textarea placeholder="Help Description" value={data.helpDescription} onChange={(e)=>setData({...data, helpDescription: e.target.value})} className="w-full px-4 py-2 border border-gray-200 text-sm h-20" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="email" placeholder="Email" value={data.contactEmail} onChange={(e)=>setData({...data, contactEmail: e.target.value})} className="w-full px-4 py-2 border border-gray-200 text-sm" />
                                        <input type="text" placeholder="Phone/WA" value={data.contactPhone} onChange={(e)=>setData({...data, contactPhone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 text-sm" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleUpdateHeadings} className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3516] transition-all flex items-center justify-center gap-2 rounded-md shadow-lg">
                                <Save size={18} /> Update Global Content
                            </button>
                        </div>
                    </div>

                    {/* ── SECTION 2: COMMUTE OPTIONS ── */}
                    <div className="bg-white border-2 border-gray-100 p-6 shadow-sm rounded-lg">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <Car className="w-5 h-5" /> Managed Commute Items
                        </h2>
                        <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <select value={commuteForm.icon} onChange={(e)=>setCommuteForm({...commuteForm, icon: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded text-sm outline-none">
                                    {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                                <input type="text" placeholder="Card Title (e.g. By Road)" value={commuteForm.title} onChange={(e)=>setCommuteForm({...commuteForm, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded text-sm outline-none" />
                            </div>
                            <textarea placeholder="Instructional Text" value={commuteForm.description} onChange={(e)=>setCommuteForm({...commuteForm, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded text-sm outline-none h-20" />
                            <div className="flex gap-2">
                                <button onClick={handleSubmitCommute} className="flex-1 py-2 bg-[#d26019] text-white font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 rounded shadow-md">
                                    {isEditingCommute ? <><Edit size={14} /> Update Commute Card</> : <><Plus size={14} /> Add Commute Card</>}
                                </button>
                                {isEditingCommute && (
                                    <button onClick={resetCommuteForm} className="px-4 py-2 border border-gray-300 text-gray-600 font-bold text-xs uppercase rounded hover:bg-gray-50">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 rounded">
                            <table className="w-full text-xs">
                                <thead className="bg-[#23471d] text-white">
                                    <tr>
                                        <th className="px-3 py-2 text-left uppercase">Icon</th>
                                        <th className="px-3 py-2 text-left uppercase">Title</th>
                                        <th className="px-3 py-2 text-right uppercase w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.commuteOptions?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-3 py-2"><IconComponent name={item.icon} size={16} className="text-[#23471d]" /></td>
                                            <td className="px-3 py-2 font-bold text-gray-700">{item.title}</td>
                                            <td className="px-3 py-2 text-right flex justify-end gap-2">
                                                <button onClick={()=>handleEditCommute(item)} className="text-blue-400 hover:text-blue-600 transition-colors">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={()=>handleDeleteCommute(item._id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 3: ACCOMMODATION (HOTELS) ── */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-100 p-6 shadow-sm rounded-lg">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Hotel className="w-5 h-5 text-[#d26019]" /> Recommended Hotels 
                        </h2>
                        
                        {/* Hotel Form */}
                        <div className="bg-slate-50 p-6 rounded-lg space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Hotel Name" value={hotelForm.title} onChange={(e)=>setHotelForm({...hotelForm, title: e.target.value})} className="w-full px-4 py-2 text-sm rounded border border-gray-300 outline-none" />
                                <input type="text" placeholder="Tag (e.g. Most Popular)" value={hotelForm.tag} onChange={(e)=>setHotelForm({...hotelForm, tag: e.target.value})} className="w-full px-4 py-2 text-sm rounded border border-gray-300 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Distance (e.g. 5km)" value={hotelForm.distance} onChange={(e)=>setHotelForm({...hotelForm, distance: e.target.value})} className="w-full px-4 py-2 text-sm rounded border border-gray-300 outline-none" />
                                <input type="text" placeholder="Rate (e.g. ₹8,000/night)" value={hotelForm.rate} onChange={(e)=>setHotelForm({...hotelForm, rate: e.target.value})} className="w-full px-4 py-2 text-sm rounded border border-gray-300 outline-none" />
                            </div>
                            
                            {/* Image Upload for Hotel */}
                            <div>
                                <label className="block text-[10px] font-black text-[#d26019] uppercase mb-1">Hotel Photo [1920x1080]</label>
                                {hotelImagePreview ? (
                                    <div className="relative h-40 border rounded overflow-hidden group">
                                        <img src={hotelImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button onClick={()=>{setHotelImageFile(null); setHotelImagePreview('');}} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-[#23471d] transition-all bg-white hover:bg-slate-50">
                                        <ImageIcon className="text-gray-400 mb-2" size={32} />
                                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Click to upload hotel interior</span>
                                        <input type="file" ref={hotelFileInputRef} className="hidden" accept="image/*" onChange={handleHotelImageChange} />
                                    </label>
                                )}
                                <input type="text" placeholder="Image Alt Tag (SEO)" value={hotelForm.alt} onChange={(e)=>setHotelForm({...hotelForm, alt: e.target.value})} className="w-full px-4 py-2 mt-2 text-[11px] rounded border border-gray-300 outline-none shadow-inner" />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleSubmitHotel} className="flex-1 py-3 bg-[#23471d] text-white font-bold rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    {isEditingHotel ? <><Edit size={18} /> Update Hotel Recommendation</> : <><Plus size={18} /> Add Hotel Recommendation</>}
                                </button>
                                {isEditingHotel && (
                                    <button onClick={resetHotelForm} className="px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-md hover:bg-gray-100 transition-all">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hotels Table */}
                        <div className="overflow-x-auto border border-gray-100 rounded">
                            <table className="w-full text-xs">
                                <thead className="bg-[#23471d] text-white">
                                    <tr>
                                        <th className="px-3 py-3 text-left">IMAGE</th>
                                        <th className="px-3 py-3 text-left">HOTEL NAME</th>
                                        <th className="px-3 py-3 text-left">RATE</th>
                                        <th className="px-3 py-3 text-right w-24">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.hotelOptions?.map((hotel, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2">
                                                <img src={hotel.image.startsWith('http') ? hotel.image : `${SERVER_URL}${hotel.image}`} alt={hotel.alt} className="w-16 h-12 object-cover rounded shadow-sm border border-gray-200" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="font-bold text-gray-800">{hotel.title}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-tight">{hotel.distance}</div>
                                            </td>
                                            <td className="px-3 py-2 font-black text-[#d26019]">{hotel.rate}</td>
                                            <td className="px-3 py-2 text-right space-x-2">
                                                <button onClick={()=>handleEditHotel(hotel)} className="text-blue-400 hover:text-blue-600 transition-colors p-1">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={()=>handleDeleteHotel(hotel._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelAccommodationManage;
