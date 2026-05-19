import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import { 
    Layout, Save, Image as ImageIcon, Plus, Trash2, Edit2, 
    Type, ShieldCheck, Check, X, Columns, Rows
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SponsorComparisonManage = () => {
    const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'benefits'
    const [cards, setCards] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cards Form State
    const [cardEditingIndex, setCardEditingIndex] = useState(null);
    const [cardForm, setCardForm] = useState({
        title: '', desc: '', color: 'blue', image: ''
    });
    const [cardFile, setCardFile] = useState(null);
    const [cardPreview, setCardPreview] = useState(null);

    // Benefits Form State
    const [benefitEditingIndex, setBenefitEditingIndex] = useState(null);
    const [benefitForm, setBenefitForm] = useState({
        benefit: '',
        values: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/sponsor-comparison');
            if (response.data.success) {
                setCards(response.data.data.cards || []);
                setComparisonData(response.data.data.comparisonData || []);
            }
        } catch (error) {
            console.error('Error fetching dynamic sponsorship:', error);
            Swal.fire('Error', 'Failed to load sponsorship options', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAll = async (updatedCards = cards, updatedComparison = comparisonData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/sponsor-comparison', {
                cards: updatedCards,
                comparisonData: updatedComparison
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Saved Successfully!', timer: 1200, showConfirmButton: false });
                setCards(response.data.data.cards || []);
                setComparisonData(response.data.data.comparisonData || []);
            }
        } catch (error) {
            console.error('Save error:', error);
            Swal.fire('Error', 'Failed to save configuration', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- CARDS CRUD ---
    const handleCardFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCardFile(file);
        setCardPreview(URL.createObjectURL(file));

        // Proactively upload the file to get the URL
        const formData = new FormData();
        formData.append('image', file);
        
        setIsLoading(true);
        try {
            const response = await api.post('/api/sponsor-comparison/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setCardForm(prev => ({ ...prev, image: response.data.url }));
                toastSuccess('Image uploaded successfully!');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateCard = () => {
        if (!cardForm.title || !cardForm.desc || !cardForm.image) {
            return Swal.fire('Warning', 'Please fill all card fields (including image upload)', 'warning');
        }

        let newCards = [...cards];
        let newComparison = [...comparisonData];
        if (cardEditingIndex !== null) {
            // Update Card
            newCards[cardEditingIndex] = { ...cardForm };
            toastSuccess('Card updated in draft list!');
        } else {
            // Add Card
            newCards.push({ ...cardForm });
            
            // For existing benefit rows, append a default empty value for this new column
            newComparison = comparisonData.map(row => ({
                ...row,
                values: [...row.values, '—']
            }));
            setComparisonData(newComparison);
            toastSuccess('New card added! Default columns added to benefits table.');
        }

        setCards(newCards);
        resetCardForm();
        handleSaveAll(newCards, newComparison);
    };

    const resetCardForm = () => {
        setCardForm({ title: '', desc: '', color: 'blue', image: '' });
        setCardFile(null);
        setCardPreview(null);
        setCardEditingIndex(null);
    };

    const handleEditCard = (index) => {
        setCardEditingIndex(index);
        const card = cards[index];
        setCardForm({ ...card });
        setCardPreview(card.image.startsWith('http') || card.image.startsWith('/uploads') 
            ? (card.image.startsWith('http') ? card.image : `${SERVER_URL}${card.image}`) 
            : card.image
        );
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDeleteCard = async (index) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Deleting this sponsor category will also remove its corresponding column values in the comparison table!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete category!'
        });

        if (result.isConfirmed) {
            const newCards = cards.filter((_, i) => i !== index);
            
            // Also strip the corresponding column values for this card
            const newComparison = comparisonData.map(row => ({
                ...row,
                values: row.values.filter((_, i) => i !== index)
            }));

            setCards(newCards);
            setComparisonData(newComparison);
            handleSaveAll(newCards, newComparison);
        }
    };

    // --- BENEFITS CRUD ---
    const handleAddOrUpdateBenefit = () => {
        if (!benefitForm.benefit) {
            return Swal.fire('Warning', 'Benefit row name is required', 'warning');
        }

        let newComparison = [...comparisonData];
        // Ensure values array size matches current cards list size
        const currentValues = [...benefitForm.values];
        while (currentValues.length < cards.length) {
            currentValues.push('—');
        }

        const payload = {
            benefit: benefitForm.benefit,
            values: currentValues.slice(0, cards.length)
        };

        if (benefitEditingIndex !== null) {
            newComparison[benefitEditingIndex] = payload;
            toastSuccess('Benefit row updated in draft list!');
        } else {
            newComparison.push(payload);
            toastSuccess('Benefit row added to list!');
        }

        setComparisonData(newComparison);
        resetBenefitForm();
        handleSaveAll(cards, newComparison);
    };

    const resetBenefitForm = () => {
        setBenefitForm({ benefit: '', values: [] });
        setBenefitEditingIndex(null);
    };

    const handleEditBenefit = (index) => {
        setBenefitEditingIndex(index);
        const row = comparisonData[index];
        const initialValues = [...row.values];
        while (initialValues.length < cards.length) {
            initialValues.push('—');
        }
        setBenefitForm({
            benefit: row.benefit,
            values: initialValues
        });
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDeleteBenefit = async (index) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Remove this benefit row from the comparison chart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, remove row!'
        });

        if (result.isConfirmed) {
            const newComparison = comparisonData.filter((_, i) => i !== index);
            setComparisonData(newComparison);
            handleSaveAll(cards, newComparison);
        }
    };

    const handleBenefitValueChange = (valIdx, value) => {
        const newVals = [...benefitForm.values];
        newVals[valIdx] = value;
        setBenefitForm(prev => ({ ...prev, values: newVals }));
    };

    const toastSuccess = (msg) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: msg,
            showConfirmButton: false,
            timer: 1500
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader 
                title="SPONSORSHIP DYNAMIC MANAGER" 
                description="Dynamically manage your sponsor categories, packages, and the benefits matrix layout in real-time." 
            />

            {/* TAB SELECTOR */}
            <div className="flex gap-4 mt-6 border-b-2 border-slate-100 pb-3">
                <button 
                    onClick={() => { setActiveTab('cards'); resetCardForm(); resetBenefitForm(); }}
                    className={`flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all ${
                        activeTab === 'cards' 
                            ? 'bg-[#23471d] text-white' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                    <Columns size={16} /> Sponsor Cards (Columns)
                </button>
                <button 
                    onClick={() => { setActiveTab('benefits'); resetCardForm(); resetBenefitForm(); }}
                    className={`flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all ${
                        activeTab === 'benefits' 
                            ? 'bg-[#23471d] text-white' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                    <Rows size={16} /> Comparison Table (Benefits Matrix)
                </button>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
                <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent" />
                    Syncing with database...
                </div>
            )}

            {!isLoading && activeTab === 'cards' && (
                <div className="mt-6 flex flex-col lg:flex-row gap-6">
                    {/* CARDS LISTING */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                                <Layout size={18} className="text-[#d26019]" /> Sponsor Category Cards ({cards.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cards.map((card, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm relative group hover:border-slate-300 transition-all flex flex-col">
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-3">
                                        <img 
                                            src={card.image.startsWith('http') || card.image.startsWith('/uploads') ? (card.image.startsWith('http') ? card.image : `${SERVER_URL}${card.image}`) : card.image} 
                                            alt="" 
                                            className="w-8 h-8 object-contain" 
                                        />
                                    </div>
                                    <h3 className={`text-xs font-black uppercase mb-1 ${card.color === 'blue' ? 'text-blue-700' : 'text-green-700'}`}>{card.title}</h3>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex-1">{card.desc}</p>
                                    <div className="flex gap-1.5 justify-end mt-4 pt-3 border-t border-slate-50">
                                        <button onClick={() => handleEditCard(idx)} className="p-1.5 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs rounded">
                                            <Edit2 size={12} />
                                        </button>
                                        <button onClick={() => handleDeleteCard(idx)} className="p-1.5 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs rounded">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cards.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 italic">No sponsor cards defined yet.</div>
                            )}
                        </div>
                    </div>

                    {/* CARD FORM */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                            <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                <Plus size={16} className="text-[#d26019]" /> {cardEditingIndex !== null ? 'Modify Sponsor Card' : 'Create New Sponsor Card'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Icon / Graphic</label>
                                    <div className="relative h-28 w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group">
                                        {cardPreview ? <img src={cardPreview} className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-slate-300" size={28} />}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Plus className="text-white" /></div>
                                        <input type="file" onChange={handleCardFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Title</label>
                                    <input 
                                        type="text" 
                                        value={cardForm.title} 
                                        onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value.toUpperCase() }))} 
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-bold uppercase tracking-wider" 
                                        placeholder="e.g. TITLE SPONSOR" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color Theme</label>
                                    <select 
                                        value={cardForm.color} 
                                        onChange={(e) => setCardForm(prev => ({ ...prev, color: e.target.value }))} 
                                        className="w-full px-3 py-2 border border-slate-200 outline-none text-xs font-semibold"
                                    >
                                        <option value="blue">Blue Label (Primary)</option>
                                        <option value="green">Green Label (Secondary)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Short Description / Hook</label>
                                    <textarea 
                                        value={cardForm.desc} 
                                        onChange={(e) => setCardForm(prev => ({ ...prev, desc: e.target.value }))} 
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none h-20 resize-none text-xs leading-relaxed" 
                                        placeholder="Brief package benefits or pitch..." 
                                    />
                                </div>
                                <div className="flex gap-2.5 pt-3">
                                    <button 
                                        onClick={handleAddOrUpdateCard} 
                                        className="flex-1 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 hover:bg-[#23471d] transition-all"
                                    >
                                        <Save size={14} /> {cardEditingIndex !== null ? 'Update Card' : 'Add Category Card'}
                                    </button>
                                    {cardEditingIndex !== null && (
                                        <button 
                                            onClick={resetCardForm} 
                                            className="px-4 py-3 bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && activeTab === 'benefits' && (
                <div className="mt-6 flex flex-col lg:flex-row gap-6">
                    {/* BENEFITS GRID */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                                <Rows size={18} className="text-[#d26019]" /> Comparison Rows (Matrix Rows: {comparisonData.length})
                            </h2>
                        </div>
                        <div className="overflow-x-auto border-2 border-slate-100 rounded-b-lg">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-3 text-left text-[9px] font-bold text-slate-500 uppercase">Benefit Row Name</th>
                                        {cards.map((c, i) => (
                                            <th key={i} className="p-3 text-center text-[9px] font-bold text-slate-500 uppercase tracking-tight min-w-[70px]">
                                                {c.title.replace(' SPONSOR', '')}
                                            </th>
                                        ))}
                                        <th className="p-3 text-center text-[9px] font-bold text-slate-500 uppercase min-w-[90px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {comparisonData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-3 text-xs font-bold text-slate-800">{row.benefit}</td>
                                            {cards.map((card, cIdx) => {
                                                const val = row.values[cIdx] || '—';
                                                return (
                                                    <td key={cIdx} className="p-3 text-center text-xs font-semibold text-slate-600">
                                                        {val === '✔' ? <Check size={14} className="text-green-600 mx-auto font-black" /> : 
                                                         val === '✘' || val === '—' ? <X size={12} className="text-slate-300 mx-auto" /> : 
                                                         <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-50 border">{val}</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => handleEditBenefit(idx)} className="p-1 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded text-[10px]">
                                                        <Edit2 size={10} />
                                                    </button>
                                                    <button onClick={() => handleDeleteBenefit(idx)} className="p-1 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded text-[10px]">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {comparisonData.length === 0 && (
                                        <tr>
                                            <td colSpan={cards.length + 2} className="p-12 text-center text-slate-400 italic text-xs">
                                                No comparison rows defined yet. Add benefit rows in the panel on the right.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BENEFIT FORM */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white border-2 border-slate-100 p-6 shadow-md rounded-lg">
                            <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                                <Plus size={16} className="text-[#d26019]" /> {benefitEditingIndex !== null ? 'Modify Benefit Row' : 'Add Dynamic Benefit Row'}
                            </h2>
                            {cards.length === 0 ? (
                                <div className="p-4 text-xs italic text-slate-400 bg-slate-50 border rounded text-center leading-relaxed">
                                    ⚠️ Please add at least one Sponsor Card first before managing benefit values.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Benefit Row Name</label>
                                        <input 
                                            type="text" 
                                            value={benefitForm.benefit} 
                                            onChange={(e) => setBenefitForm(prev => ({ ...prev, benefit: e.target.value }))} 
                                            className="w-full px-3 py-2 border border-slate-200 focus:border-[#23471d] outline-none text-xs font-semibold" 
                                            placeholder="e.g. Complimentry Passes, VIP Lounge" 
                                        />
                                    </div>
                                    <div className="border-t border-slate-100 pt-3">
                                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Set Values for Columns:</h3>
                                        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                                            {cards.map((c, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-slate-50 p-2 border border-slate-100 rounded">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight flex-1">{c.title.replace(' SPONSOR', '')}</span>
                                                    <div className="flex items-center gap-1">
                                                        <select 
                                                            value={benefitForm.values[i] || '—'} 
                                                            onChange={(e) => handleBenefitValueChange(i, e.target.value)}
                                                            className="px-2 py-1 bg-white border border-slate-200 outline-none text-[10px] font-bold rounded cursor-pointer min-w-[70px]"
                                                        >
                                                            <option value="✔">✔ (Check)</option>
                                                            <option value="—">— (Cross/Empty)</option>
                                                            <option value="custom">Custom Text...</option>
                                                        </select>
                                                        {benefitForm.values[i] !== '✔' && benefitForm.values[i] !== '—' && (
                                                            <input 
                                                                type="text"
                                                                value={benefitForm.values[i] === 'custom' ? '' : benefitForm.values[i]}
                                                                onChange={(e) => handleBenefitValueChange(i, e.target.value)}
                                                                className="px-2 py-1 bg-white border border-slate-200 outline-none text-[10px] font-bold rounded w-20 text-center"
                                                                placeholder="e.g. 12 sqm"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2.5 pt-3">
                                        <button 
                                            onClick={handleAddOrUpdateBenefit} 
                                            className="flex-1 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 hover:bg-[#23471d] transition-all"
                                        >
                                            <Save size={14} /> {benefitEditingIndex !== null ? 'Update Row' : 'Add Benefit Row'}
                                        </button>
                                        {benefitEditingIndex !== null && (
                                            <button 
                                                onClick={resetBenefitForm} 
                                                className="px-4 py-3 bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SponsorComparisonManage;
