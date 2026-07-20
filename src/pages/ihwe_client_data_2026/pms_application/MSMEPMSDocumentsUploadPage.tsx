import { useExhibitorCtx } from '@/context/ExhibitorContext';
import MSMEPMSDocumentsUpload from './MSMEPMSDocumentsUpload';
import { useMsmePmsApplication } from '@/hooks/useMsmePmsApplication';
import { useNavigate } from 'react-router-dom';
export default function MSMEPMSDocumentsUploadPage() {
    const { data } = useExhibitorCtx();
    const pms = useMsmePmsApplication(data);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading documents...</div>;
    return <><MSMEPMSDocumentsUpload data={pms.data} saving={pms.saving} onUpload={pms.uploadDocument} onDelete={pms.deleteDocument} onContinue={async () => { if (pms.data?.status !== 'Approved') await pms.saveStep(3, {}); navigate('/exhibitor-dashboard/msme/application-review'); }} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
