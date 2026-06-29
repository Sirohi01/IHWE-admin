import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileMinus, Paperclip } from 'lucide-react';
import api from '../lib/api';

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date) => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DebitNoteView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/debitnotes/${id}`);
        setNote(res.data?.data || res.data || null);
      } catch (err) {
        console.error('Failed to load debit note', err);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadNote();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading debit note...</div>;
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 text-gray-600">
          Debit note not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Debit Note Details</h1>
          <p className="text-sm text-gray-500 mt-1">{note.debit_note_no}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Debit Note No.</div>
              <div className="font-semibold text-gray-900">{note.debit_note_no}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Date</div>
              <div className="font-semibold text-gray-900">{formatDate(note.debit_note_date || note.added)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Client</div>
              <div className="font-semibold text-gray-900">{note.clientName || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Against</div>
              <div className="font-semibold text-gray-900">{note.toInvoiceNo || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Document Type</div>
              <div className="font-semibold text-gray-900">{note.toDocumentType || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Reason</div>
              <div className="font-semibold text-gray-900">{note.reason || '-'}</div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Description', 'HSN', 'Qty', 'Unit', 'Rate', 'GST', 'Total'].map((head) => (
                    <th key={head} className="border px-3 py-2 text-left text-gray-700 font-bold uppercase">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(note.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="border px-3 py-2 text-gray-600">{idx + 1}</td>
                    <td className="border px-3 py-2 text-gray-900">{item.description}</td>
                    <td className="border px-3 py-2 text-gray-700">{item.hsn || '-'}</td>
                    <td className="border px-3 py-2 text-gray-700">{item.qty}</td>
                    <td className="border px-3 py-2 text-gray-700">{item.unit || '-'}</td>
                    <td className="border px-3 py-2 text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="border px-3 py-2 text-gray-700">{item.gstPct || '-'}</td>
                    <td className="border px-3 py-2 text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="rounded-md bg-purple-50 border border-purple-100 p-4">
            <div className="text-xs text-purple-700 font-semibold uppercase">Total Amount</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(note.totalAmount)}</div>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Taxable</span><span className="font-semibold">{formatCurrency(note.taxableAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">CGST</span><span className="font-semibold">{formatCurrency(note.cgstAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SGST</span><span className="font-semibold">{formatCurrency(note.sgstAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">IGST</span><span className="font-semibold">{formatCurrency(note.igstAmount)}</span></div>
          </div>

          {note.attachmentUrl && (
            <a
              href={note.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-purple-700 font-semibold text-sm hover:text-purple-900"
            >
              <Paperclip className="w-4 h-4" />
              Open attachment
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebitNoteView;
