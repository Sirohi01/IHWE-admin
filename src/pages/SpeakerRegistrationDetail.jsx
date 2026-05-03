import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Award, Users } from 'lucide-react';
import api from "../lib/api";

const Button = ({ children, onClick, className, variant, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm flex items-center gap-2";
    const variants = {
        primary: "bg-gray-800 text-white hover:bg-gray-700",
        outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
    };
    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variant === 'outline' ? variants.outline : variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const SpeakerRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [speaker, setSpeaker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSpeakerDetail();
    }, [id]);

    const fetchSpeakerDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/speaker/${id}`);
            if (response.data.success) {
                setSpeaker(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching speaker detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // const handlePrint = () => {
    //     window.print();
    // };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!speaker) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Speaker not found</h2>
                <Button onClick={() => navigate('/speaker-registration-list')} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    const printStyles = `
    @media print {
      /* Hide everything except print content */
      body * { visibility: hidden; }
      .print-container, .print-container * { visibility: visible; }
      .print-container { 
        position: absolute; 
        left: 0; 
        top: 0; 
        width: 100%; 
        padding: 0;
        margin: 0;
        background: white;
      }
      
      /* Hide non-printable elements */
      .no-print { display: none !important; }
      nav, aside, footer, header { display: none !important; }
      
      /* Print specific styles */
      .print-section { 
        break-inside: avoid; 
        page-break-inside: avoid; 
        margin-bottom: 15px !important; 
      }
      .detail-row { 
        break-inside: avoid; 
        page-break-inside: avoid; 
        margin-bottom: 8px; 
      }
      
      /* Page setup */
      @page { 
        size: A4; 
        margin: 1.5cm; 
      }
      
      /* Typography */
      h1, h2, h3 { page-break-after: avoid; }
      
      /* Remove backgrounds and borders for print */
      .bg-gradient-to-r { 
        background: #fff !important; 
        border: 1px solid #ddd !important; 
      }
      
      /* Image sizing */
      img { 
        max-width: 80px !important; 
        max-height: 80px !important;
      }
    }
    
    @media screen {
      .print-container { 
        max-width: 1200px; 
        margin: 0 auto; 
        background: white; 
        padding: 20px; 
      }
    }
  `;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '—';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (Array.isArray(value)) {
            return value.length === 0 ? '—' : value.join(', ');
        }
        return value;
    };

    const DetailRow = ({ label, value, fullWidth = false }) => (
        <div className={`detail-row ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                {label}
            </span>
            <p className="text-xs text-gray-900 font-medium break-words leading-snug">
                {formatValue(value)}
            </p>
        </div>
    );

    const Section = ({ title, icon: Icon, children }) => (
        <div className="print-section mb-6">
            <div className="border-b-2 border-orange-300 pb-2 mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-orange-600 no-print" />}
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {title}
                    </h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {children}
            </div>
        </div>
    );

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    return (
        <>
            <style>{printStyles}</style>
            <div className="print-container">
                <div className="max-w-8xl mx-auto">
                    {/* Header with buttons */}
                    <div className="flex justify-between items-start mb-6 no-print pt-4">
                        <div>
                            <Button
                                onClick={() => navigate('/speaker-registration-list')}
                                variant="outline"
                                className="mb-3"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>
                            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mt-2">
                                Speaker Profile
                            </h1>
                            <div className="mt-2">
                                <span className={`px-4 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeClass(speaker.status)}`}>
                                    {speaker.status}
                                </span>
                            </div>
                        </div>
                        {/* <div className="flex gap-3">
                            <Button
                                onClick={handlePrint}
                                variant="primary"
                                className="bg-gray-800 hover:bg-gray-700"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                        </div> */}
                    </div>

                    {/* Print version header */}
                    <div className="hidden print:block mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                            Speaker Profile
                        </h1>
                        <div className="mt-2">
                            <span className={`px-4 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeClass(speaker.status)}`}>
                                {speaker.status}
                            </span>
                        </div>
                    </div>

                    {/* Speaker Photo & Basic Info Card */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 mb-6 border border-orange-200 print-section">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            {speaker.speakerPhotoUrl && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={speaker.speakerPhotoUrl}
                                        alt={speaker.fullName}
                                        className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-lg"
                                    />
                                </div>
                            )}
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{speaker.fullName}</h2>
                                <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Briefcase className="w-3 h-3 text-orange-600 no-print" />
                                        <span className="font-semibold">{speaker.designation}</span>
                                        <span className="text-gray-500">at</span>
                                        <span className="font-semibold">{speaker.organization}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-3 h-3 text-orange-600 no-print" />
                                        <span>{speaker.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-3 h-3 text-orange-600 no-print" />
                                        <span>{speaker.mobile}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="w-3 h-3 text-orange-600 no-print" />
                                        <span>{speaker.city}</span>
                                    </div>
                                    {speaker.linkedin && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Users className="w-3 h-3 text-orange-600 no-print" />
                                            <span className="text-xs break-all">{speaker.linkedin}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {speaker.companyLogoUrl && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={speaker.companyLogoUrl}
                                        alt="Company Logo"
                                        className="w-20 h-20 rounded-lg object-contain bg-white p-2 border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Background */}
                    <Section title="Professional Background" icon={Briefcase}>
                        <DetailRow label="Industry Category" value={speaker.industryCategory} />
                        <DetailRow label="Total Experience" value={speaker.totalExperience} />
                        <DetailRow label="Areas of Expertise" value={speaker.expertise} fullWidth />
                        <DetailRow label="Brief Profile" value={speaker.briefProfile} fullWidth />
                    </Section>

                    {/* Session Details */}
                    <Section title="Session Details" icon={FileText}>
                        <DetailRow label="Preferred Topic" value={speaker.preferredTopic} fullWidth />
                        <DetailRow label="Topic Description" value={speaker.topicDescription} fullWidth />
                        <DetailRow label="Preferred Track" value={speaker.preferredTrack} />
                        <DetailRow label="Session Type" value={speaker.sessionType} />
                        <DetailRow label="Spoken Before" value={speaker.spokenBefore} />
                        {speaker.eventDetails && (
                            <DetailRow label="Previous Event Details" value={speaker.eventDetails} fullWidth />
                        )}
                    </Section>

                    {/* Expectations & Requirements */}
                    <Section title="Expectations & Requirements" icon={Award}>
                        <DetailRow label="Expectations from Event" value={speaker.expectations} fullWidth />
                    </Section>

                    {/* Attachments */}
                    {speaker.presentationUrl && (
                        <Section title="Attachments" icon={Download}>
                            <div className="col-span-full">
                                <a
                                    href={speaker.presentationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Presentation
                                </a>
                            </div>
                        </Section>
                    )}

                    {/* Consent & Registration Info */}
                    <Section title="Consent & Registration" icon={Calendar}>
                        <DetailRow label="Data Usage Consent" value={speaker.consent1} />
                        <DetailRow label="Terms & Conditions" value={speaker.consent2} />
                        <DetailRow 
                            label="Registration Date" 
                            value={speaker.createdAt ? new Date(speaker.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'} 
                        />
                    </Section>
                </div>
            </div>
        </>
    );
};

export default SpeakerRegistrationDetail;
