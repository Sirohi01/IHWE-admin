import { useCallback, useEffect, useState } from 'react';
import { pmsApi } from '../../../lib/api';

const normalize = application => {
    if (!application) return null;
    const applicant = application.applicantDetails || {};
    const savedBank = application.bankDetails || application.bank || {};
    const invoiceValue = Number(application.payment?.invoiceValue || application.invoiceValue || 0);
    const savedClaim = application.claim || {};
    const stallCharges = Number(savedClaim.stallCharges ?? invoiceValue ?? 0);
    const claimValues = [stallCharges, savedClaim.hotelStay, savedClaim.travel, savedClaim.courier, savedClaim.marketing]
        .map(value => Number(value || 0));
    const totalClaimed = savedClaim.totalClaimed != null
        ? Number(savedClaim.totalClaimed)
        : claimValues.reduce((sum, value) => sum + value, 0);
    return {
        ...application,
        ...applicant,
        emailId: applicant.emailId || application.contact1?.email || application.emailId,
        bank: {
            ...savedBank,
            accountHolder: savedBank.accountHolderName || savedBank.accountHolder,
            branch: savedBank.branchName || savedBank.branch,
            ifsc: savedBank.ifscCode || savedBank.ifsc,
        },
        documents: (application.documents || []).map(document => ({
            ...document,
            url: document.url || document.path,
        })),
        claim: {
            ...savedClaim,
            stallCharges,
            hotelStay: Number(savedClaim.hotelStay || 0),
            travel: Number(savedClaim.travel || 0),
            courier: Number(savedClaim.courier || 0),
            marketing: Number(savedClaim.marketing || 0),
            totalClaimed,
            eligibleAmount: savedClaim.eligibleAmount != null
                ? Number(savedClaim.eligibleAmount)
                : Math.min(totalClaimed, 150000),
        },
        msme: {
            ...(application.msme || {}),
            udyamRegNo: applicant.udyamRegNo || application.msme?.udyamRegNo,
            msmeCategory: applicant.msmeCategory || application.msme?.msmeCategory,
        },
    };
};

export function useAdminPmsApplication(id) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            setData(normalize(await pmsApi.getById(id)));
        } catch (err) {
            setError(err?.response?.data?.message || 'Application could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const run = async (operation) => {
        setSaving(true);
        setError('');
        try {
            const appId = data?._id || id;
            await operation(appId);
            const refreshed = normalize(await pmsApi.getById(appId));
            setData(refreshed);
            return refreshed;
        } catch (err) {
            const message = err?.response?.data?.message || 'Application could not be saved.';
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return {
        data, loading, saving, error,
        saveStep: (step, payload) => run(appId => pmsApi.saveStepById(appId, step, payload)),
        uploadDocument: (type, file) => run(appId => pmsApi.uploadDocumentById(appId, type, file)),
        deleteDocument: type => run(appId => pmsApi.deleteDocumentById(appId, type)),
        submit: () => run(async appId => { await pmsApi.submitById(appId); return pmsApi.getById(appId); }),
    };
}
