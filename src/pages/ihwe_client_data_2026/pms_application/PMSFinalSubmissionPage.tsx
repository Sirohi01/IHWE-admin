import { useExhibitorCtx } from '@/context/ExhibitorContext';
import PMSFinalSubmission from './PMSFinalSubmission';
import { useMsmePmsApplication } from '@/hooks/useMsmePmsApplication';
import { useNavigate } from 'react-router-dom';

export default function PMSReimbursementApprovedPage() {
    const { data } = useExhibitorCtx();
    const pms = useMsmePmsApplication(data);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading final submission...</div>;

    return (
        <PMSFinalSubmission
            data={pms.data}
            saving={pms.saving}
            onBack={() => navigate('/exhibitor-dashboard/msme/application-review')}
            onSaveDraft={(agreed) => pms.saveStep(4, { declarationAgreed: agreed, saveAsDraft: true })}
            onSubmit={async (agreed) => { await pms.saveStep(4, { declarationAgreed: agreed }); await pms.submit(); }}
        />
    );
}
