import { useExhibitorCtx } from '@/context/ExhibitorContext';
import MSMEPMSReviewConfirmation from './MSMEApplicationReview';
import { useMsmePmsApplication } from '@/hooks/useMsmePmsApplication';
import { useNavigate } from 'react-router-dom';
export default function MSMEApplicationReviewPage() {
    const { data } = useExhibitorCtx();
    const pms = useMsmePmsApplication(data);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading application review...</div>;
    return <><MSMEPMSReviewConfirmation data={pms.data} saving={pms.saving} onContinue={() => navigate('/exhibitor-dashboard/msme/pms-approved')} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
