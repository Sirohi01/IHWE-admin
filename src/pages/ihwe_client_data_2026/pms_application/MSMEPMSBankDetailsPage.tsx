import MSMEPMSBankDetails from './MSMEPMSBankDetails';
import { useAdminPmsApplication } from './useAdminPmsApplication';
import { useNavigate, useParams } from 'react-router-dom';
export default function MSMEPMSBankDetailsPage() {
    const { id } = useParams();
    const pms = useAdminPmsApplication(id);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading bank details...</div>;
    return <><MSMEPMSBankDetails data={pms.data} saving={pms.saving} onBack={() => navigate(`/pms-application/${pms.data?._id || id}/edit`)} onUpload={pms.uploadDocument} onSaveDraft={(bankDetails) => pms.saveStep(2, { bankDetails, saveAsDraft: true })} onContinue={async (bankDetails) => { if (pms.data?.status !== 'Approved') await pms.saveStep(2, { bankDetails }); navigate(`/pms-application/${pms.data?._id || id}/edit/documents`); }} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
