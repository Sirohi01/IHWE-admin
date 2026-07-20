import { useExhibitorCtx } from '@/context/ExhibitorContext';
import MSMEPMSApplication from './MSMEPMSApplication';
import { useMsmePmsApplication } from '@/hooks/useMsmePmsApplication';
import { useNavigate } from 'react-router-dom';
export default function MSMEPMSApplicationPage() {
    const { data } = useExhibitorCtx();
    const pms = useMsmePmsApplication(data);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading PMS application...</div>;
    return <><MSMEPMSApplication data={pms.data} saving={pms.saving} onSaveDraft={(form, selectedExpenses) => pms.saveStep(1, { applicantDetails: form, selectedExpenses, saveAsDraft: true })} onContinue={async (form, selectedExpenses) => { if (pms.data?.status !== 'Approved') await pms.saveStep(1, { applicantDetails: form, selectedExpenses }); navigate('/exhibitor-dashboard/msme/bank-details'); }} />{pms.error && <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-xs text-white">{pms.error}</div>}</>;
}
