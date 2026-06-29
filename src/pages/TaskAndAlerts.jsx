import React from 'react';
import { 
    Users, FileText, Package, IndianRupee, Bell, 
    FileCheck, Wrench, ClipboardList, Hourglass, 
    Ticket, LayoutTemplate, Mail, ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../features/company/companySlice';

const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  return Array.isArray(sliceState)
    ? sliceState
    : Array.isArray(sliceState?.data)
    ? sliceState.data
    : Array.isArray(sliceState?.[fallbackKey])
    ? sliceState[fallbackKey]
    : [];
};

const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    const endValue = parseInt(value, 10);
    const hasLeadingZero = typeof value === 'string' && value.startsWith('0') && value.length > 1;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || isNaN(endValue)) return;

        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            setCount(Math.floor(easeProgress * endValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, endValue, duration]);

    if (isNaN(endValue)) return <span ref={ref}>{value}</span>;

    const displayValue = hasLeadingZero && count < 10 ? `0${count}` : count;
    return <span ref={ref}>{displayValue}</span>;
};

const TaskAndAlerts = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const companiesState = useSelector((state) => state.companies);
    const companiesArray = getArrayFromSlice(companiesState, 'companies');
    
    const [pendingDocs, setPendingDocs] = useState([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [documentPage, setDocumentPage] = useState(1);
    
    const [accOrders, setAccOrders] = useState([]);
    const [isLoadingAcc, setIsLoadingAcc] = useState(true);
    const [accPage, setAccPage] = useState(1);
    const ACC_PER_PAGE = 5;
    
    const DOCS_PER_PAGE = 5;
    
    useEffect(() => {
        dispatch(fetchCompanies());
        
        // Fetch pending documents
        setIsLoadingDocs(true);
        api.get('/api/client-documents/admin/pending')
            .then(res => {
                setPendingDocs(res.data || []);
                setIsLoadingDocs(false);
            })
            .catch(err => {
                console.error("Error fetching pending documents:", err);
                setIsLoadingDocs(false);
            });

        // Fetch accessory orders
        setIsLoadingAcc(true);
        api.get('/api/stall-accessories/orders')
            .then(res => {
                setAccOrders(res.data.data || []);
                setIsLoadingAcc(false);
            })
            .catch(err => {
                console.error("Error fetching accessory orders:", err);
                setIsLoadingAcc(false);
            });
    }, [dispatch]);

    // Mock Data based on screenshot
    const notifications = [
        { title: "GST certificate uploaded by ABC Pharma", time: "10:30 AM", type: "warning" },
        { title: "Logo artwork uploaded by City Dental", time: "10:10 AM", type: "warning" },
        { title: "Electricity request submitted by Herbal Care", time: "09:55 AM", type: "warning" },
        { title: "Payment received from Happy Miles", time: "09:20 AM", type: "warning" },
        { title: "Stall upgrade request by ABC Pharma", time: "09:10 AM", type: "warning" }
    ];

    const documents = pendingDocs.length > 0 ? pendingDocs.map(doc => {
        // Fallback: If backend didn't attach companyName, try finding it
        let compName = doc.companyName;
        if (!compName || compName === "Unknown Client") {
            const comp = companiesArray.find(c => 
                String(c._id) === String(doc.client_id) || 
                String(c.id) === String(doc.client_id) ||
                String(c.clientId) === String(doc.client_id)
            );
            compName = comp ? comp.companyName : "Unknown Client";
        }
        
        return {
            _id: doc._id,
            client_id: doc.client_id,
            company: compName,
            doc: doc.document_name,
            status: doc.status
        };
    }) : [
        { company: "ABC Pharma Pvt. Ltd.", doc: "GST Certificate", status: "Pending" },
        { company: "City Dental Systems", doc: "PAN Card", status: "Pending" },
        { company: "Herbal Care India", doc: "Logo Artwork", status: "Pending" },
        { company: "Airx Innovation Pvt. Ltd.", doc: "Product Catalogue", status: "Verified" },
        { company: "Happy Miles Journey Pvt. Ltd.", doc: "Company Profile", status: "Verified" }
    ];

    const payments = [
        { company: "ABC Pharma Pvt. Ltd.", amount: "₹ 99,000", status: "Paid", time: "10:30 AM" },
        { company: "City Dental Systems", amount: "₹ 1,76,000", status: "Partial", time: "10:10 AM" },
        { company: "Herbal Care India", amount: "₹ 1,32,000", status: "Due", time: "09:55 AM" },
        { company: "Airx Innovation Pvt. Ltd.", amount: "₹ 99,000", status: "Paid", time: "09:40 AM" },
        { company: "Happy Miles Journey Pvt. Ltd.", amount: "₹ 1,16,820", status: "Paid", time: "09:20 AM" }
    ];

    const activities = [
        { action: "GST certificate uploaded", company: "ABC Pharma", time: "10:30 AM" },
        { action: "Logo updated", company: "City Dental Systems", time: "10:10 AM" },
        { action: "Furniture request submitted", company: "Herbal Care India", time: "09:55 AM" },
        { action: "Payment received", company: "Happy Miles Journey", time: "09:20 AM" },
        { action: "Stall size upgraded", company: "Airx Innovation", time: "09:10 AM" }
    ];

    const approvals = [
        { item: "Stall Branding Artwork", company: "City Dental Systems", priority: "High" },
        { item: "Fascia Name Approval", company: "Herbal Care India", priority: "Normal" },
        { item: "Booth Design Approval", company: "ABC Pharma", priority: "High" },
        { item: "Additional Lighting", company: "Airx Innovation", priority: "Normal" },
        { item: "Product Display Approval", company: "Happy Miles Journey", priority: "Normal" }
    ];

    const passes = [
        { type: "Additional Exhibitor Pass", company: "ABC Pharma", count: "2 Passes", status: "New" },
        { type: "Visitor Pass", company: "City Dental Systems", count: "5 Passes", status: "New" },
        { type: "Service Pass", company: "Herbal Care India", count: "3 Passes", status: "Approved" },
        { type: "Vehicle Pass", company: "Airx Innovation", count: "2 Passes", status: "Approved" },
        { type: "Exhibitor Pass", company: "Happy Miles Journey", count: "4 Passes", status: "New" }
    ];

    const modifications = [
        { type: "Stall Size Upgrade (12 sqm)", company: "ABC Pharma", status: "Under Review" },
        { type: "Stall Layout Change", company: "City Dental Systems", status: "Under Review" },
        { type: "Additional Display Area", company: "Herbal Care India", status: "Under Review" },
        { type: "Stall Color Change", company: "Airx Innovation", status: "Approved" },
        { type: "New Graphics Request", company: "Happy Miles Journey", status: "Under Review" }
    ];

    const communications = [
        { type: "Email to ABC Pharma", subject: "Stall Confirmation", time: "10:30 AM" },
        { type: "WhatsApp to City Dental", subject: "Payment Reminder", time: "10:10 AM" },
        { type: "Email from Herbal Care", subject: "Service Request", time: "09:55 AM" },
        { type: "Call with Airx Innovation", subject: "Stall Upgrade", time: "09:40 AM" },
        { type: "Email to Happy Miles Journey", subject: "Pass Details", time: "09:20 AM" }
    ];

    const StatusBadge = ({ status, type = "default" }) => {
        const colors = {
            "Pending": "bg-orange-50 text-orange-500",
            "Verified": "bg-green-50 text-green-500",
            "Paid": "bg-green-50 text-green-500",
            "Partial": "bg-blue-50 text-blue-500",
            "Due": "bg-red-50 text-red-500",
            "New": "bg-blue-50 text-blue-500",
            "In Progress": "bg-purple-50 text-purple-500",
            "High": "bg-red-50 text-red-500",
            "Normal": "bg-orange-50 text-orange-500",
            "Low": "bg-green-50 text-green-500",
            "Approved": "bg-green-50 text-green-500",
            "Under Review": "bg-orange-50 text-orange-500"
        };
        const colorClass = colors[status] || "bg-gray-100 text-gray-500";
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
                {status}
            </span>
        );
    };

    const CardHeader = ({ icon: Icon, title, colorClass, viewAllLink, currentPage, totalPages, onPrev, onNext }) => {
        const bgTint = colorClass.replace('text-', 'bg-').replace('500', '50').replace('600', '50');
        const borderTint = colorClass.replace('text-', 'border-').replace('500', '100').replace('600', '100');
        const textTint = colorClass.replace('500', '800').replace('600', '900');

        return (
            <div className={`flex justify-between items-center -mx-5 -mt-5 mb-4 p-3 px-5 ${bgTint} border-b ${borderTint} rounded-t-2xl`}>
                <div className="flex items-center gap-2">
                    <Icon size={16} className={colorClass} strokeWidth={2.5} />
                    <h3 className={`text-xs font-bold ${textTint} uppercase tracking-wide`}>{title}</h3>
                </div>
                {viewAllLink ? (
                    <Link to={viewAllLink} className={`text-[10px] font-bold ${colorClass} hover:underline uppercase tracking-wide`}>
                        View All
                    </Link>
                ) : (
                    totalPages > 1 ? (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={onPrev} 
                                disabled={currentPage === 1}
                                className={`text-gray-400 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700'}`}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-600">{currentPage} / {totalPages}</span>
                            <button 
                                onClick={onNext} 
                                disabled={currentPage === totalPages}
                                className={`text-gray-400 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700'}`}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    ) : null
                )}
            </div>
        );
    };

    const CardFooter = ({ label, count, colorClass, badgeColor }) => (
        <div className="mt-4 pt-3 border-t flex justify-between items-center">
            <span className={`text-xs font-bold ${colorClass}`}>{label}</span>
            <span className={`px-2 py-1 rounded text-white text-[10px] font-bold ${badgeColor}`}>{count}</span>
        </div>
    );

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Page Title */}
              {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    {
                        title: "TOTAL EXHIBITORS",
                        value: "236",
                        desc: <span className="flex items-center justify-center gap-1"><ArrowUpRight size={14}/> 18 this week</span>,
                        icon: Users,
                        iconBg: "bg-blue-100",
                        bg: "bg-gradient-to-br from-white from-50% to-blue-50",
                        text: "text-blue-600"
                    },
                    {
                        title: "DOCUMENTS PENDING",
                        value: "18",
                        desc: "Needs Verification",
                        icon: FileText,
                        iconBg: "bg-purple-100",
                        bg: "bg-gradient-to-br from-white from-50% to-purple-50",
                        text: "text-purple-600"
                    },
                    {
                        title: "SERVICE REQUESTS",
                        value: "06",
                        desc: "Needs Action",
                        icon: Package,
                        iconBg: "bg-orange-100",
                        bg: "bg-gradient-to-br from-white from-50% to-orange-50",
                        text: "text-orange-600"
                    },
                    {
                        title: "PAYMENTS DUE",
                        value: "12",
                        desc: "₹ 42.5 Lakh Due",
                        icon: IndianRupee,
                        iconBg: "bg-green-100",
                        bg: "bg-gradient-to-br from-white from-50% to-green-50",
                        text: "text-green-600"
                    },
                    {
                        title: "PENDING APPROVALS",
                        value: "08",
                        desc: "Awaiting Response",
                        icon: Hourglass,
                        iconBg: "bg-yellow-100",
                        bg: "bg-gradient-to-br from-white from-50% to-yellow-50",
                        text: "text-yellow-600"
                    },
                    {
                        title: "PASS REQUESTS",
                        value: "24",
                        desc: "New Requests",
                        icon: Mail,
                        iconBg: "bg-cyan-100",
                        bg: "bg-gradient-to-br from-white from-50% to-cyan-50",
                        text: "text-cyan-600"
                    }
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => {}}
                            className={`group cursor-pointer relative ${item.bg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}
                                    >
                                        <Icon className={`w-5 h-5 ${item.text}`} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                                            <AnimatedCounter value={item.value} />
                                        </p>
                                        <p className="text-[9px] font-extrabold text-slate-700 leading-tight">
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-bold mt-2 ${item.text} text-center`}>
                                    {item.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Grid of Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Notifications */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={Bell} title="Notifications" colorClass="text-orange-500" />
                        <div className="space-y-4">
                            {notifications.map((n, i) => (
                                <div key={i} className="flex justify-between items-start gap-4">
                                    <div className="flex gap-2 items-start">
                                        <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-gray-700">{n.title}</p>
                                    </div>
                                    <span className="text-[10px] font-semibold text-blue-500 shrink-0">{n.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="Total Unread" count="12" colorClass="text-gray-600" badgeColor="bg-orange-500" />
                </div>

                {/* 2. Document Verification */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader 
                            icon={FileCheck} 
                            title="Document Verification" 
                            colorClass="text-purple-600" 
                            currentPage={documentPage}
                            totalPages={Math.ceil(documents.length / DOCS_PER_PAGE)}
                            onPrev={() => setDocumentPage(p => Math.max(1, p - 1))}
                            onNext={() => setDocumentPage(p => Math.min(Math.ceil(documents.length / DOCS_PER_PAGE), p + 1))}
                        />
                        <div className="space-y-3.5 min-h-[160px]">
                            {isLoadingDocs ? (
                                Array(5).fill(0).map((_, idx) => (
                                    <div key={idx} className="flex justify-between items-center animate-pulse p-1 -mx-1">
                                        <div className="flex-1 pr-2"><div className="h-3 bg-gray-200 rounded w-24"></div></div>
                                        <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-20"></div></div>
                                        <div><div className="h-4 bg-gray-200 rounded-full w-12"></div></div>
                                    </div>
                                ))
                            ) : documents.length > 0 ? (
                                documents.slice((documentPage - 1) * DOCS_PER_PAGE, documentPage * DOCS_PER_PAGE).map((d, i) => (
                                    <div 
                                        key={i} 
                                        className="flex justify-between items-center cursor-pointer hover:bg-purple-50/50 p-1 -mx-1 rounded transition-colors"
                                        onClick={() => d.client_id ? navigate(`/client-documents/${d.client_id}`) : null}
                                    >
                                        <div className="flex-1 overflow-hidden pr-2">
                                            <p className="text-[11px] font-medium text-[#0055DA] hover:underline cursor-pointer truncate">{d.company}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-semibold text-[#124170] truncate">{d.doc}</p>
                                        </div>
                                        <StatusBadge status={d.status} />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-xs text-gray-400 py-4 flex items-center justify-center h-full">No pending documents</div>
                            )}
                        </div>
                    </div>
                    <CardFooter label="Pending Documents" count={pendingDocs.length > 0 ? pendingDocs.length : 18} colorClass="text-gray-600" badgeColor="bg-purple-500" />
                </div>

                {/* 3. Payment Updates */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={IndianRupee} title="Payment Updates" colorClass="text-green-600" />
                        <div className="space-y-3.5">
                            {payments.map((p, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 truncate">{p.company}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <p className="text-[10px] font-bold text-gray-600 whitespace-nowrap">{p.amount}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-semibold text-blue-500 shrink-0 whitespace-nowrap w-12 text-right">{p.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Total Due</span>
                        <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold">₹ 42.5 Lakh</span>
                    </div>
                </div>

                {/* 4. Material / Service Requests */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <CardHeader icon={Wrench} title="Material / Service Requests" colorClass="text-blue-600" />
                            {accOrders.length > ACC_PER_PAGE && (
                                <div className="flex items-center gap-1.5 bg-gray-50 rounded px-1.5 py-0.5">
                                    <button 
                                        onClick={() => setAccPage(p => Math.max(1, p - 1))}
                                        disabled={accPage === 1}
                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-600 min-w-[20px] text-center">
                                        {accPage} <span className="font-normal text-gray-400">/</span> {Math.ceil(accOrders.length / ACC_PER_PAGE) || 1}
                                    </span>
                                    <button 
                                        onClick={() => setAccPage(p => Math.min(Math.ceil(accOrders.length / ACC_PER_PAGE), p + 1))}
                                        disabled={accPage === Math.ceil(accOrders.length / ACC_PER_PAGE) || accOrders.length === 0}
                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3.5 min-h-[160px]">
                            {isLoadingAcc ? (
                                Array(5).fill(0).map((_, idx) => (
                                    <div key={idx} className="flex justify-between items-center animate-pulse p-1 -mx-1">
                                        <div className="flex-[2] pr-2"><div className="h-3 bg-gray-200 rounded w-24"></div></div>
                                        <div className="flex-[1.5]"><div className="h-3 bg-gray-200 rounded w-20"></div></div>
                                        <div className="flex-1 flex justify-end"><div className="h-4 bg-gray-200 rounded w-12"></div></div>
                                    </div>
                                ))
                            ) : accOrders.length > 0 ? (
                                accOrders.slice((accPage - 1) * ACC_PER_PAGE, accPage * ACC_PER_PAGE).map((order, i) => {
                                    const productName = order.items && order.items.length > 0 
                                        ? `${order.items[0].name}${order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ''}`
                                        : 'Accessories';
                                    return (
                                        <div key={i} className="flex justify-between items-center gap-2 hover:bg-blue-50/50 p-1 -mx-1 rounded transition-colors">
                                            <div className="flex-[2] overflow-hidden">
                                                <p className="text-[11px] font-bold text-gray-700 truncate">{productName}</p>
                                            </div>
                                            <div className="flex-[1.5] overflow-hidden">
                                                <p 
                                                    className="text-[10px] font-medium text-[#0055DA] hover:underline cursor-pointer truncate"
                                                    onClick={() => navigate(`/accessory-orders?search=${encodeURIComponent(order.exhibitorName || '')}`)}
                                                >
                                                    {order.exhibitorName || 'Unknown Company'}
                                                </p>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-[11px] font-bold text-[#23471d]">₹{order.grandTotal?.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-xs text-gray-400 py-4 flex items-center justify-center h-full">No accessory orders</div>
                            )}
                        </div>
                    </div>
                    <CardFooter label="New Requests" count={accOrders.length} colorClass="text-blue-600" badgeColor="bg-blue-600" />
                </div>

                {/* 5. Activity Log */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={ClipboardList} title="Activity Log" colorClass="text-teal-600" viewAllLink="/activity-log" />
                        <div className="space-y-4">
                            {activities.map((a, i) => (
                                <div key={i} className="flex justify-between items-center gap-2">
                                    <div className="flex-[2] overflow-hidden">
                                        <p className="text-[11px] font-bold text-gray-700 truncate">{a.action}</p>
                                    </div>
                                    <div className="flex-[1.5] overflow-hidden">
                                        <p className="text-[10px] font-semibold text-gray-500 truncate">{a.company}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="text-[10px] font-semibold text-blue-500">{a.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="Total Activities" count="85" colorClass="text-teal-600" badgeColor="bg-teal-600" />
                </div>

                {/* 6. Pending Approvals */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={Hourglass} title="Pending Approvals" colorClass="text-orange-500" />
                        <div className="space-y-3.5">
                            {approvals.map((a, i) => (
                                <div key={i} className="flex justify-between items-center gap-2">
                                    <div className="flex-[2] overflow-hidden">
                                        <p className="text-[11px] font-bold text-gray-700 truncate">{a.item}</p>
                                    </div>
                                    <div className="flex-[1.5] overflow-hidden">
                                        <p className="text-[10px] font-semibold text-gray-500 truncate">{a.company}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <StatusBadge status={a.priority} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="Total Pending" count="8" colorClass="text-gray-600" badgeColor="bg-orange-500" />
                </div>

                {/* 7. Pass Requests */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={Ticket} title="Pass Requests" colorClass="text-purple-600" />
                        <div className="space-y-3.5">
                            {passes.map((p, i) => (
                                <div key={i} className="flex justify-between items-center gap-2">
                                    <div className="flex-[2] overflow-hidden">
                                        <p className="text-[11px] font-bold text-gray-700 truncate">{p.type}</p>
                                    </div>
                                    <div className="flex-[1.5] overflow-hidden">
                                        <p className="text-[10px] font-semibold text-gray-500 truncate">{p.company}</p>
                                    </div>
                                    <div className="flex-[1] text-center">
                                        <p className="text-[10px] font-bold text-gray-600">{p.count}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <StatusBadge status={p.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="New Requests" count="4" colorClass="text-purple-600" badgeColor="bg-purple-600" />
                </div>

                {/* 8. Stall Modification Requests */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={LayoutTemplate} title="Stall Modification Requests" colorClass="text-green-600" />
                        <div className="space-y-3.5">
                            {modifications.map((m, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="flex-[1.5] overflow-hidden">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 truncate">{m.type}</p>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 truncate">{m.company}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge status={m.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="Total Requests" count="5" colorClass="text-gray-600" badgeColor="bg-green-600" />
                </div>

                {/* 9. Communication History */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between" style={{ boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" }}>
                    <div>
                        <CardHeader icon={Mail} title="Communication History" colorClass="text-blue-600" />
                        <div className="space-y-4">
                            {communications.map((c, i) => (
                                <div key={i} className="flex justify-between items-center gap-2">
                                    <div className="flex-[2] overflow-hidden">
                                        <p className="text-[11px] font-bold text-gray-700 truncate">{c.type}</p>
                                    </div>
                                    <div className="flex-[1.5] overflow-hidden">
                                        <p className="text-[10px] font-semibold text-gray-500 truncate">{c.subject}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="text-[10px] font-semibold text-blue-500">{c.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <CardFooter label="Total Communications" count="36" colorClass="text-gray-600" badgeColor="bg-blue-600" />
                </div>

            </div>

        </div>
    );
};

export default TaskAndAlerts;
