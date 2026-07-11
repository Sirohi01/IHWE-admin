import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SquarePen, Phone, Mail, Globe } from 'lucide-react';
import { FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import mainpic from '../../assets/header.png';
import api, { SERVER_URL } from '../../lib/api';

const PLACE_OF_SUPPLY = 'Delhi (07)';
const NAVY = '#0d1f3c';
const EVENT_TITLE = '9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)';

const formatDate = (date) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtNum = (value) => Math.round(Number(value || 0)).toLocaleString('en-IN');

const formatSize = (value) => {
  if (!value) return '-';
  const valStr = String(value).toLowerCase().replace(/m$/, '').trim();
  return `${valStr.replace(/\s*[xX*]\s*/g, 'X').trim()} m`;
};

const formatArea = (value) => {
  if (!value) return '-';
  const valStr = String(value).toLowerCase().replace(/sqm$/, '').replace(/sq\.m$/, '').trim();
  return `${valStr} sqm`;
};

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
  return `Rupees ${convert(Math.round(Number(n || 0)))} Only.`;
};

// Safety net for records saved while preparedBy/reviewedBy were briefly stored as a
// raw JSON string instead of a real object (fixed server-side, but old records may
// still have the string form until they're re-saved).
const asNamedPerson = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string' && value.trim()) {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return {};
};

const detailRow = (label, value, opts = {}) => (
  <tr key={label}>
    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>{label}</td>
    <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
    <td style={{ border: 'none', padding: '1px 0', ...(opts.style || {}) }}>{value || '—'}</td>
  </tr>
);

const WhatsAppIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
);

const FooterBlock = ({ settings }) => (
  <div className="avoid-break" style={{ position: 'relative', height: 82, overflow: 'hidden', border: '1px solid #ccc', borderTop: 'none' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: NAVY, zIndex: 0 }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 10, fontWeight: 600, color: NAVY, zIndex: 2, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><WhatsAppIcon /> {settings?.contactPhone || '+91 96549 00525'}</div>
      <div style={{ width: 1, height: 12, background: '#ccc' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {settings?.contactEmail || 'info@namogangewellness.com'}</div>
      <div style={{ width: 1, height: 12, background: '#ccc' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} /> {settings?.contactWebsite || 'www.namogangewellness.com'}</div>
    </div>
    <div style={{ position: 'absolute', top: 28, left: 0, right: 0, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#666', zIndex: 2, background: '#fff' }}>
      <span><b style={{ color: '#333' }}>Note:</b> Applicable TDS, if deducted, must be supported with TDS certificate / Form 16A.</span>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10.5, zIndex: 2 }}>
      <span>This is a computer generated document and does not require a physical signature.</span>
    </div>
  </div>
);

const SectionIconHeader = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: NAVY, color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', padding: '4px 6px' }}>
    {Icon && <Icon size={14} strokeWidth={2} />}
    {label}
  </div>
);

const CreditNotePrintTemplate = ({ note, company, settings }) => {
  const items = (note.items || []).map((it) => {
    const qty = it.quantity || 1;
    const rate = it.rate != null ? it.rate : it.cn_amount;
    const grossAmount = rate * qty;
    // taxableValue is the post-discount amount (what the "Total" column of the item
    // table shows, matching the Invoice printout); discountPct is derived from it
    // when not stored directly.
    const taxableValue = it.taxableValue != null ? it.taxableValue : grossAmount;
    const discountPct = it.discountPct != null ? it.discountPct : (grossAmount > 0 ? ((grossAmount - taxableValue) / grossAmount) * 100 : 0);
    const gstPct = it.gstPct || '18%';
    // Older credit notes were saved before per-item GST tracking existed — fall back to
    // computing it from the item's own rate so the printout never shows a hard ₹0.
    const gstAmount = it.gstAmount || (taxableValue * (parseFloat(gstPct) / 100));
    return {
      description: it.item,
      hsn: it.hsn || '',
      qty,
      unit: it.unit || 'Nos',
      rate,
      amount: taxableValue,
      area: it.area,
      size: it.size,
      discountPct,
      gstPct,
      gstAmount,
      total: it.total || (taxableValue + gstAmount),
    };
  });

  const totalTaxable = note.taxableAmount || items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const totalGstAmount = note.gstAmount || items.reduce((sum, it) => sum + (Number(it.gstAmount) || 0), 0);
  const grandTotal = note.totalAmount || (totalTaxable + totalGstAmount);
  const tdsAmount = Number(note.tdsAmount || 0);
  const netAdjustment = grandTotal - tdsAmount;
  const isIgst = false;

  const c1 = company?.contacts?.[0] || company?.contact1 || {};
  const companyName = note.clientName || company?.companyName || company?.exhibitorName || '—';
  const address = [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country]
    .filter(Boolean).join(', ');

  const mediaUrl = (val) => !val ? null : (val.startsWith('http') ? val : `${SERVER_URL}${val}`);
  const sigUrl = mediaUrl(settings?.authorizedSignature);
  const stampUrl = mediaUrl(settings?.companyStamp);

  return (
    <div className="bg-white border border-slate-300 p-6 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="invoice-header-image" style={{ marginBottom: 0, textAlign: 'center' }}>
        <img loading="lazy" decoding="async" src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
      </div>

      <div
        className="invoice-title-bar"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 22, marginBottom: 0, paddingTop: 10, paddingBottom: 4, color: NAVY, textTransform: 'uppercase' }}
      >
        <div style={{ fontWeight: 500, fontSize: 18, lineHeight: 1, textAlign: 'center' }}>CREDIT NOTE</div>
        <div className="invoice-copy-label" style={{ position: 'absolute', right: 0, bottom: 3, fontWeight: 600, fontSize: 11, lineHeight: 1, paddingRight: 2, whiteSpace: 'nowrap', textAlign: 'right', letterSpacing: '-0.35px' }}>ORIGINAL COPY</div>
      </div>

      {/* Billed To + Credit Note Details + Reason */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4, border: '1px solid #ccc' }}>
        <colgroup><col style={{ width: '38%' }} /><col style={{ width: '38%' }} /><col style={{ width: '24%' }} /></colgroup>
        <thead>
          <tr>
            <th style={{ border: 'none', borderRight: '1px solid #fff', padding: 0 }}><SectionIconHeader icon={SquarePen} label="Billed To (Customer Details)" /></th>
            <th style={{ border: 'none', borderRight: '1px solid #fff', padding: 0 }}><SectionIconHeader icon={SquarePen} label="Credit Note Details" /></th>
            <th style={{ border: 'none', padding: 0 }}><SectionIconHeader icon={SquarePen} label="Reason for Credit Note" /></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '8px', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 2 }}>{companyName}</div>
              <div style={{ marginBottom: 12 }}>{address || '—'}</div>
              <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: 1.5, width: '100%' }}>
                <tbody>
                  {detailRow('Contact Person', [c1.title, c1.firstName, c1.surname].filter(Boolean).join(' '))}
                  {detailRow('Contact No.', c1.mobile || company?.landline)}
                  {detailRow('Email', c1.email || company?.email)}
                  {detailRow('GSTIN/PAN', note.gstin || company?.gstNumber)}
                </tbody>
              </table>
            </td>
            <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '8px', verticalAlign: 'top' }}>
              <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: 1.5, width: '100%' }}>
                <tbody>
                  {detailRow('Credit Note No.', note.create_note_no)}
                  {detailRow('Credit Note Date', formatDate(note.credit_note_date))}
                  {detailRow('Original Invoice No.', note.reference_invoice_no)}
                  {detailRow('Original Invoice Date', formatDate(note.invoice_date))}
                  {detailRow('Place of Supply', PLACE_OF_SUPPLY)}
                </tbody>
              </table>
            </td>
            <td style={{ border: 'none', padding: '8px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{note.credit_note_type || '—'}</div>
              <div>{note.reason || '—'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Item Details */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <thead>
          <tr style={{ background: NAVY, color: '#fff', textTransform: 'uppercase' }}>
            {[
              { label: 'S.No.', width: '3%' },
              { label: 'Item Description', width: '38%' },
              { label: 'HSN Code', width: '7%' },
              { label: 'Qty.', width: '4%' },
              { label: 'Size', width: '7%' },
              { label: 'Area', width: '7%' },
              { label: 'Unit', width: '6%' },
              { label: 'Rate', width: '7%' },
              { label: 'Discount', width: '8%' },
              { label: 'Total', width: '13%' },
            ].map((h) => (
              <th key={h.label} style={{ border: `1px solid ${NAVY}`, padding: '3px 2px', textAlign: 'center', fontSize: 10, background: NAVY, color: '#fff', fontWeight: 'bold', width: h.width }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px' }}>
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{EVENT_TITLE}</div>
                <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap' }}>{item.description}</div>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.hsn || '—'}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.qty}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{formatSize(item.area)}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{formatArea(item.size)}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(item.rate)}</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{Math.round(item.discountPct || 0)}%</td>
              <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(item.amount)}</td>
            </tr>
          ))}
          <tr style={{ background: '#f8fafc' }}>
            <td colSpan={9} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', textTransform: 'uppercase' }}>Taxable Value</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalTaxable)}</td>
          </tr>
        </tbody>
      </table>

      {/* GST Details + Adjustment Summary */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody>
          <tr>
            <td style={{ width: '52%', verticalAlign: 'top', padding: 0, border: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead><tr><th colSpan={4} style={{ border: 'none', padding: 0 }}><SectionIconHeader icon={SquarePen} label="GST Details" /></th></tr></thead>
                <tbody>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: 10 }}>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>Tax Head</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>Rate (%)</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>Taxable Value (₹)</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>Amount (₹)</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>CGST</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : '9%'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : fmtNum(totalTaxable)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : fmtNum(totalGstAmount / 2)}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>SGST</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : '9%'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : fmtNum(totalTaxable)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? '-' : fmtNum(totalGstAmount / 2)}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>IGST</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? `${fmtNum((totalGstAmount / totalTaxable) * 100)}%` : '-'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? fmtNum(totalTaxable) : '-'}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{isIgst ? fmtNum(totalGstAmount) : '-'}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px' }}>Total GST Amount</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{fmtNum(totalGstAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ width: '2%', border: 'none' }} />
            <td style={{ width: '46%', verticalAlign: 'top', padding: 0, border: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead><tr><th style={{ border: 'none', padding: 0 }}><SectionIconHeader icon={SquarePen} label="Adjustment Summary" /></th></tr></thead>
                <tbody>
                  {[
                    ['Credit Amount (Before Tax)', fmtNum(totalTaxable), false],
                    ['GST Amount', fmtNum(totalGstAmount), false],
                    ['TOTAL CREDIT NOTE VALUE', fmtNum(grandTotal), true],
                    ['TDS Impact (If Any)', fmtNum(tdsAmount), false],
                    ['NET ADJUSTMENT AMOUNT', fmtNum(netAdjustment), true],
                  ].map(([label, value, strong]) => (
                    <tr key={label} style={strong ? { background: '#fff7ed' } : undefined}>
                      <td style={{ border: '1px solid #ccc', padding: '5px 6px', fontWeight: strong ? 700 : 500 }}>{label}</td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 6px', textAlign: 'right', fontWeight: strong ? 700 : 500, color: strong ? '#c2410c' : undefined }}>₹ {value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Adjustment Against */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4, border: '1px solid #ccc' }}>
        <thead><tr><th colSpan={4} style={{ border: 'none', padding: 0 }}><SectionIconHeader icon={SquarePen} label="Adjustment Against" /></th></tr></thead>
        <tbody>
          <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: 10 }}>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '34%' }}>This Credit Note is adjusted against the following invoice.</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>Against Invoice No.</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>Against Invoice Date</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>Adjustment Type</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px' }} />
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{note.reference_invoice_no || '—'}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{formatDate(note.invoice_date)}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'center' }}>{note.adjustment_type || 'Against Invoice'}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words + Value */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody>
          <tr>
            <td style={{ width: '70%', border: '1px solid #ccc', padding: '4px 6px', verticalAlign: 'middle' }}>
              <span style={{ fontWeight: 700 }}>Amount in Words: </span>{toWords(grandTotal)}
            </td>
            <td style={{ width: '30%', border: '1px solid #ccc', background: NAVY, color: '#fff', padding: '4px 6px', verticalAlign: 'middle' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Credit Note Value</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>₹ {fmtNum(grandTotal)}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="avoid-break" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
        <thead>
          <tr>
            <th style={{ width: '35%', border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '4px 6px', background: '#f8fafc', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: NAVY, fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                <SquarePen size={14} strokeWidth={2} /> Prepared By
              </div>
            </th>
            <th style={{ width: '35%', border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '4px 6px', background: '#f8fafc', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: NAVY, fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                <SquarePen size={14} strokeWidth={2} /> Reviewed By
              </div>
            </th>
            <th style={{ width: '30%', border: 'none', borderBottom: '1px solid #ccc', padding: '4px 6px', background: '#f8fafc', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: NAVY, fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                <SquarePen size={14} strokeWidth={2} /> For {settings?.companyName || 'Namo Gange Wellness Pvt. Ltd.'}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {[
              { label: 'Prepared By', name: note.preparedBy?.name, designation: note.preparedBy?.designation, date: note.credit_note_date },
              { label: 'Reviewed By', name: note.reviewedBy?.name, designation: note.reviewedBy?.designation, date: note.credit_note_date },
            ].map((col, idx) => (
              <td key={idx} style={{ width: '35%', border: 'none', borderRight: '1px solid #ccc', padding: '8px', verticalAlign: 'top', fontSize: 10 }}>
                <table style={{ borderCollapse: 'collapse', border: 'none', width: '100%', lineHeight: 1.5 }}>
                  <tbody>
                    {detailRow('Name', col.name)}
                    {detailRow('Designation', col.designation)}
                    {detailRow('Date', formatDate(col.date))}
                  </tbody>
                </table>
                <div style={{ borderTop: '1px solid #ccc', marginTop: 40, paddingTop: 4, textAlign: 'center', color: '#888', fontStyle: 'italic', fontSize: 9 }}>(Signature)</div>
              </td>
            ))}
            <td style={{ width: '30%', border: 'none', padding: '2px 8px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
              <div style={{ height: 55, marginTop: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {sigUrl && <img loading="lazy" decoding="async" src={sigUrl} alt="Signature" style={{ maxHeight: 55, maxWidth: 120 }} />}
                {stampUrl && <img loading="lazy" decoding="async" src={stampUrl} alt="Stamp" style={{ maxHeight: 55, maxWidth: 55 }} />}
              </div>
              <div style={{ borderTop: '1px solid #ccc', margin: '35px 10px 8px' }}></div>
              <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10, marginTop: 6 }}>Authorized Signatory.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <FooterBlock settings={settings} />
    </div>
  );
};

const CreditNoteView = () => {
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
        const res = await api.get(`/api/creditnotes/${id}`);
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
          onClick={() => navigate(note.companyId ? `/dashboard/account/credit-notes/${note.companyId}` : '/accounts/credit-notes')}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => navigate(`/dashboard/account/create-credit-note/${note.companyId}?edit=${note._id}`)}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Edit Credit Note"
        >
          <SquarePen size={18} />
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
        <CreditNotePrintTemplate note={note} company={company} settings={settings} />
      </div>
    </div>
  );
};

export default CreditNoteView;
