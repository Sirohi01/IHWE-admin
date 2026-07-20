import { useExhibitorCtx } from '@/context/ExhibitorContext';
import MSMEPMSBankDetails from './MSMEPMSBankDetails';
import { useMsmePmsApplication } from '@/hooks/useMsmePmsApplication';
import { useNavigate } from 'react-router-dom';
export default function MSMEPMSBankDetailsPage() {
    const { data } = useExhibitorCtx();
    const pms = useMsmePmsApplication(data);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading bank details...</div>;
    return <><MSMEPMSBankDetails data={pms.data} saving={pms.saving} onUpload={pms.uploadDocument} onSaveDraft={(bankDetails) => pms.saveStep(2, { bankDetails, saveAsDraft: true })} onContinue={async (bankDetails) => { if (pms.data?.status !== 'Approved') await pms.saveStep(2, { bankDetails }); navigate('/exhibitor-dashboard/msme/documents-upload'); }} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
