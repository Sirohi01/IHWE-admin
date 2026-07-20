import MSMEPMSDocumentsUpload from './MSMEPMSDocumentsUpload';
import { useAdminPmsApplication } from './useAdminPmsApplication';
import { useNavigate, useParams } from 'react-router-dom';
export default function MSMEPMSDocumentsUploadPage() {
    const { id } = useParams();
    const pms = useAdminPmsApplication(id);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading documents...</div>;
    return <><MSMEPMSDocumentsUpload data={pms.data} saving={pms.saving} onBack={() => navigate(`/pms-application/${pms.data?._id || id}/edit/bank-details`)} onUpload={pms.uploadDocument} onDelete={pms.deleteDocument} onContinue={async () => { if (pms.data?.status !== 'Approved') await pms.saveStep(3, {}); navigate(`/pms-application/${pms.data?._id || id}/edit/review`); }} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
