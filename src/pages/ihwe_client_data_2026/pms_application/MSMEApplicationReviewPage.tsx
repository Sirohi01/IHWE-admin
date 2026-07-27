import MSMEPMSReviewConfirmation from './MSMEApplicationReview';
import { useAdminPmsApplication } from './useAdminPmsApplication';
import { useNavigate, useParams } from 'react-router-dom';
export default function MSMEApplicationReviewPage() {
    const { id } = useParams();
    const pms = useAdminPmsApplication(id);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading application review...</div>;
    return <><MSMEPMSReviewConfirmation data={pms.data} saving={pms.saving} onBack={() => navigate(`/pms-application/${pms.data?._id || id}/edit/documents`)} onContinue={() => navigate(`/pms-application/${pms.data?._id || id}/edit/submit`)} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
