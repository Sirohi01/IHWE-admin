import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import mainpic from '../assets/header.png';
import api from '../lib/api';

const formatDate = (date) => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtNum = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const toWords = (n) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (num) => {
    if (num === 0) return 'Zero';
    if (num < 20) return ones[num];
    if (num < 100) return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${ones[num % 10]}` : ''}`;
    if (num < 1000) return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${convert(num % 100)}` : ''}`;
    if (num < 100000) return `${convert(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${convert(num % 1000)}` : ''}`;
    if (num < 10000000) return `${convert(Math.floor(num / 100000))} Lakh${num % 100000 ? ` ${convert(num % 100000)}` : ''}`;
    return `${convert(Math.floor(num / 10000000))} Crore${num % 10000000 ? ` ${convert(num % 10000000)}` : ''}`;
  };
  return `RUPEES ${convert(Math.round(Number(n || 0)))} Only.`;
};

const detailRow = (label, value) => (
  <tr>
    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>{label}</td>
    <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
    <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{value || '-'}</td>
  </tr>
);

const CreditNotePreviewTemplate = ({ note, company, settings }) => {
  const items = note.items || [];
  const totalTaxable = note.taxableAmount ?? items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalGstAmount = Number(note.cgstAmount || 0) + Number(note.sgstAmount || 0) + Number(note.igstAmount || 0);
  const grandTotal = note.totalAmount ?? items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const isIgst = Number(note.igstAmount || 0) > 0;
  const c1 = company?.contacts?.[0] || company?.contact1 || {};
  const clientName = note.clientName || company?.companyName || company?.exhibitorName || '-';
  const clientAddress = [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country]
    .filter(Boolean)
    .join(', ');
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const sigUrl = settings?.authorizedSignature ? (settings.authorizedSignature.startsWith('http') ? settings.authorizedSignature : `${BASE_URL}${settings.authorizedSignature}`) : null;
  const stampUrl = settings?.companyStamp ? (settings.companyStamp.startsWith('http') ? settings.companyStamp : `${BASE_URL}${settings.companyStamp}`) : null;

  return (
    <div className="bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 4, paddingTop: 2, paddingBottom: 2 }}>
        <div style={{ fontWeight: 400, fontSize: 18, color: '#0d1f3c', textTransform: 'uppercase' }}>CREDIT NOTE</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Client Name &amp; Address</th>
            <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Credit Note Source</th>
            <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '24%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Credit Note Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{clientName}</div>
              <div style={{ marginTop: 2, textTransform: 'capitalize' }}>{clientAddress || '-'}</div>
              <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                <tbody>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{c1.mobile || company?.landline || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{c1.email || company?.email || '-'}</td>
                  </tr>
                  {(company?.gstNo || company?.gstin) && (
                    <tr>
                      <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>GSTIN.</td>
                      <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                      <td style={{ border: 'none', padding: '1px 0' }}>{company.gstNo || company.gstin}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{note.toDocumentType || 'Document'}</div>
              <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                <tbody>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Against No.</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{note.toInvoiceNo || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Original Amount</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{fmtNum(note.originalAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Reason</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0', textTransform: 'capitalize' }}>{String(note.reason || '-').replaceAll('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Reference</td>
                    <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                    <td style={{ border: 'none', padding: '1px 0' }}>{note.reference || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 11 }}>
              <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%' }}>
                <tbody>
                  {detailRow('Credit Note No.', note.debit_note_no)}
                  {detailRow('Credit Note Date', formatDate(note.debit_note_date || note.added))}
                  {detailRow('Created Date', formatDate(note.added))}
                  {detailRow('Created By', note.added_by || 'Admin')}
                  {detailRow('Source Type', note.toDocumentType)}
                  {detailRow('Source No.', note.toInvoiceNo)}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
            {[
              { label: 'S.No.', width: '4%' },
              { label: 'Item Description', width: '50%' },
              { label: 'HSN Code', width: '9%' },
              { label: 'Qty.', width: '6%' },
              { label: 'Unit', width: '8%' },
              { label: 'Rate', width: '10%' },
              { label: 'GST', width: '6%' },
              { label: 'Total', width: '12%' },
            ].map((head) => (
              <th key={head.label} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', textAlign: 'center', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold', width: head.width }}>{head.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px' }}>
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{item.description || '-'}</div>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.hsn || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.qty || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.unit || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(item.rate)}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.gstPct || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(item.total)}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ height: 24 }}>
              {Array(8).fill(0).map((__, j) => <td key={j} style={{ border: '1px solid #ccc' }} />)}
            </tr>
          ))}
          <tr style={{ textTransform: 'uppercase' }}>
            <td colSpan={7} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', background: '#f8fafc' }}>Taxable Value</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalTaxable)}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
            {['S.No.', 'HSN/SAC No.', 'Item Value', 'Qty.', 'CGST(%)', 'Amount', 'SGST(%)', 'Amount', 'IGST(%)', 'Amount', 'Total Tax'].map((head) => (
              <th key={head} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const gstRate = parseFloat(item.gstPct) || 0;
            const gstAmount = Number(item.gstAmount || 0);
            const halfGst = gstRate / 2;
            const halfGstAmount = gstAmount / 2;
            const itemValue = Number(item.amount || item.total || 0) - gstAmount;
            return (
              <tr key={`tax-${index}`}>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item.hsn || '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{fmtNum(itemValue)}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item.qty || '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? `${halfGst}%` : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmount) : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? `${halfGst}%` : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmount) : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? `${gstRate}%` : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{isIgst ? fmtNum(gstAmount) : '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(gstAmount)}</td>
              </tr>
            );
          })}
          <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>GST Amount in Words (INR)</td>
            <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{toWords(totalGstAmount).toUpperCase()}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Total GST Amount</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalGstAmount)}</td>
          </tr>
          <tr style={{ height: 8 }}>
            {Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }} />)}
          </tr>
          <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Amount in Words (INR)</td>
            <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{toWords(grandTotal).toUpperCase()}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Grand Total</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', fontSize: 13 }}>{fmtNum(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Remarks:</div>
              <div>{note.remarks || note.reference || '-'}</div>
              {note.attachmentUrl && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Paperclip size={12} />
                  <span>{note.attachmentUrl}</span>
                </div>
              )}
            </td>
            <td style={{ width: '40%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Declaration:</div>
              <div>This credit note is issued against the source document mentioned above.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
            <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '50%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>Client Signature</th>
            <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '50%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>For Namo Gange Wellness Pvt. Ltd.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
              <div style={{ height: 80 }} />
              <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
            </td>
            <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
              <div style={{ height: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                {sigUrl && <img src={sigUrl} alt="Signature" style={{ maxHeight: 60, maxWidth: 130 }} />}
                {stampUrl && <img src={stampUrl} alt="Stamp" style={{ maxHeight: 60, maxWidth: 60 }} />}
              </div>
              <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12, textAlign: 'center', color: '#666', marginTop: 8, paddingTop: 6 }}>
        <b>Registered Address:</b> First Floor, E-1, Opposite KFC, Kalkaji Main Market, South Delhi-110019, Delhi, India
      </div>
      <div style={{ fontSize: 11, textAlign: 'center', color: '#999', marginTop: 4 }}>
        This is a computer generated document and does not require a physical signature.
      </div>
    </div>
  );
};

const DebitNoteView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const printRef = useRef();
  const [note, setNote] = useState(null);
  const [company, setCompany] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/debitnotes/${id}`);
        setNote(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load credit note', err);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadNote();
  }, [id]);

  useEffect(() => {
    const loadCompany = async () => {
      if (!note?.companyId) return;
      try {
        const res = await api.get(`/api/companies/lookup/${note.companyId}`);
        setCompany(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load credit note company', err);
      }
    };

    loadCompany();
  }, [note?.companyId]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        setSettings(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };

    loadSettings();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'credit-note',
  });

  if (loading) {
    return <div className="text-center p-10">Loading credit note details...</div>;
  }

  if (!note) {
    return (
      <div className="bg-gray-100 p-6 min-h-screen">
        <div className="max-w-[1000px] mx-auto bg-white border border-gray-200 p-5 text-gray-600">
          Credit note not found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <div className="max-w-[1000px] mx-auto flex justify-end mb-2 gap-2">
        <button
          onClick={() => navigate(note.companyId ? `/debit-note-list/${note.companyId}` : '/debit-note-list/all')}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={handlePrint}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Print Credit Note"
        >
          <FaPrint size={18} />
        </button>
      </div>
      <div ref={printRef}>
        <CreditNotePreviewTemplate note={note} company={company} settings={settings} />
      </div>
    </div>
  );
};

export default DebitNoteView;
