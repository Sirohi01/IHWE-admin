import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MsmePmsTracking from './MsmePmsTracking';
import api, { pmsApi } from '../../../lib/api';

export default function MsmePmsTrackingPage() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingPortal, setSavingPortal] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    const [savingUdyam, setSavingUdyam] = useState(false);
    const [savingOtp, setSavingOtp] = useState(false);
    const [savingAction, setSavingAction] = useState(false);
    const [runningScreening, setRunningScreening] = useState(false);
    const [uploadingDocType, setUploadingDocType] = useState('');

    const fetchApplication = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            let result = await pmsApi.getById(id);
            if (!result) result = await pmsApi.getForEdit(id);
            setData(result);
        } catch {
            try {
                setData(await pmsApi.getForEdit(id));
            } catch (err2) {
                console.error('Failed to load MSME PMS application', err2);
                const backendMessage = err2?.response?.data?.message || '';
                setError(
                    backendMessage === 'Linked exhibitor not found'
                        ? "This company hasn't completed exhibitor registration yet — the MSME PMS application becomes available once Book a Stand is submitted for them."
                        : backendMessage || 'Application could not be loaded.'
                );
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchApplication();
    }, [id, fetchApplication]);

    const recordId = data?._id || id;

    const handlers = {
        runningScreening,
        savingPortal,
        savingContact,
        savingUdyam,
        savingOtp,
        savingAction,
        uploadingDocType,

        onSaveStage: async (stage) => {
            try {
                const next = await pmsApi.updateStage(recordId, stage);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to update stage', err);
            }
        },
        onGoToStage2: async () => {
            try {
                const next = await pmsApi.updateStage(recordId, 2);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to move to stage 2', err);
            }
        },

        onSaveContact: async (values) => {
            setSavingContact(true);
            try {
                const [firstName, ...rest] = String(values.contactPerson || '').split(' ');
                await api.put(`/api/exhibitor-registration/${data.exhibitorId}`, {
                    'contact1.firstName': firstName || '',
                    'contact1.lastName': rest.join(' '),
                    'contact1.designation': values.designation,
                    'contact1.mobile': values.mobileNumber,
                    'contact1.email': values.emailId,
                    landlineNo: values.landlineNo,
                    address: values.address,
                });
                await fetchApplication();
            } catch (err) {
                console.error('Failed to save contact details', err);
            } finally {
                setSavingContact(false);
            }
        },

        onSaveUdyamDetails: async (values) => {
            setSavingUdyam(true);
            try {
                const next = await pmsApi.updateUdyamDetails(recordId, values);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to save Udyam details', err);
            } finally {
                setSavingUdyam(false);
            }
        },

        onSavePortalOtpContact: async (values) => {
            setSavingOtp(true);
            try {
                const next = await pmsApi.updatePortalOtpContact(recordId, values);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to save portal OTP contact', err);
            } finally {
                setSavingOtp(false);
            }
        },

        onSavePortal: async (values) => {
            setSavingPortal(true);
            try {
                const next = await pmsApi.updatePortal(recordId, values);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to save portal status', err);
            } finally {
                setSavingPortal(false);
            }
        },

        onUploadAcknowledgement: async (file) => {
            try {
                const next = await pmsApi.uploadPortalAcknowledgement(recordId, file);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to upload acknowledgement', err);
            }
        },

        onRunAiScreening: async () => {
            setRunningScreening(true);
            try {
                const result = await pmsApi.runAiScreening(recordId);
                if (result?.success && result.data) setData(result.data);
                else if (result?.message) console.warn(result.message);
            } catch (err) {
                console.error('Failed to run AI screening', err);
            } finally {
                setRunningScreening(false);
            }
        },

        onSetDocumentStatus: async (documentId, fields) => {
            try {
                const next = await pmsApi.updateDocumentStatus(recordId, documentId, fields);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to update document status', err);
            }
        },

        onResolveAction: async () => {
            setSavingAction(true);
            try {
                const next = await pmsApi.setActionRequired(recordId, { resolved: true });
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to resolve action', err);
            } finally {
                setSavingAction(false);
            }
        },

        onRaiseAction: async (values) => {
            setSavingAction(true);
            try {
                const next = await pmsApi.setActionRequired(recordId, values);
                if (next) setData(next);
            } catch (err) {
                console.error('Failed to raise action', err);
            } finally {
                setSavingAction(false);
            }
        },

        onUploadDocument: async (documentType, file) => {
            setUploadingDocType(documentType);
            try {
                await pmsApi.uploadDocumentById(recordId, documentType, file);
                setData(await pmsApi.getById(recordId));
            } catch (err) {
                console.error('Failed to upload document', err);
            } finally {
                setUploadingDocType('');
            }
        },
    };

    if (loading) return <div className="p-6 text-sm">Loading application...</div>;
    if (error || !data) return <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || 'Application not found.'}</div>;

    return <MsmePmsTracking data={data} handlers={handlers} />;
}
