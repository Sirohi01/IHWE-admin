import PMSFinalSubmission from './PMSFinalSubmission';
import { useAdminPmsApplication } from './useAdminPmsApplication';
import { useNavigate, useParams } from 'react-router-dom';

export default function PMSReimbursementApprovedPage() {
    const { id } = useParams();
    const pms = useAdminPmsApplication(id);
    const navigate = useNavigate();
    if (pms.loading) return <div className="p-6 text-sm">Loading final submission...</div>;

    return (
        <PMSFinalSubmission
            data={pms.data}
            saving={pms.saving}
            onBack={() => navigate(`/pms-application/${pms.data?._id || id}/edit/review`)}
            onSaveDraft={(agreed) => pms.saveStep(4, { declarationAgreed: agreed, saveAsDraft: true })}
            onSubmit={async (agreed) => { await pms.saveStep(4, { declarationAgreed: agreed }); await pms.submit(); }}
        />
    );
}
