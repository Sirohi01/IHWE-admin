import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientOverview2 from './ClientOverview2';
import { pmsApi } from '../../../lib/api';

export default function ClientOverview2Page() {
    const { id } = useParams(); // route: /admin/pms/:id  (matches GET /:id and PATCH /:id/status)
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const fetchApplication = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const result = await pmsApi.getById(id);
            setData(result);
        } catch (err) {
            console.error('Failed to load application', err);
            setData(null);
            setError(err?.response?.data?.message || 'Application could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchApplication();
    }, [id, fetchApplication]);

    const handleEdit = () => {
        navigate(`/pms-application/${data?._id || id}/edit`);
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await pmsApi.updateStatus(data?._id || id, 'Approved');
            await fetchApplication();
        } catch (err) {
            console.error('Approve failed', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleDisapprove = async (reason) => {
        setProcessing(true);
        try {
            await pmsApi.updateStatus(data?._id || id, 'Rejected', reason);
            await fetchApplication();
        } catch (err) {
            console.error('Disapprove failed', err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-6 text-sm">Loading application...</div>;
    if (error || !data) return <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || 'Application not found.'}</div>;

    return (
        <ClientOverview2
            data={data}
            processing={processing}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onDisapprove={handleDisapprove}
        />
    );
}
