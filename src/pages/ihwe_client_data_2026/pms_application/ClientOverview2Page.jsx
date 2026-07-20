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

    const fetchApplication = useCallback(async () => {
        setLoading(true);
        try {
            const result = await pmsApi.getById(id);
            setData(result);
        } catch (err) {
            console.error('Failed to load application', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchApplication();
    }, [id, fetchApplication]);

    const handleEdit = () => {
        navigate(`/admin/pms/${id}/edit`);
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await pmsApi.updateStatus(id, 'Approved');
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
            await pmsApi.updateStatus(id, 'Disapproved', reason);
            await fetchApplication();
        } catch (err) {
            console.error('Disapprove failed', err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-6 text-sm">Loading application...</div>;

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