import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, SERVER_URL } from '../lib/api';

import bgImage from '../assets/9th_certificate/Background.jpg';
import logo9th from '../assets/9th_certificate/9thlogo.png';
import msmeLogo from '../assets/9th_certificate/MEME.png';
import ngtLogo from '../assets/9th_certificate/NGT Logo.png';
import certificateTitle from '../assets/9th_certificate/Certificate Participation.png';
import jagdishSig from '../assets/9th_certificate/Jagdish.png';
import vijaySig from '../assets/9th_certificate/Vijay.png';
import concurrentEvents from '../assets/9th_certificate/CONCURRENT EVENTS.png';
import initiatives from '../assets/9th_certificate/Initiatives.png';

const initiativesData = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  image: '' // Add small image imports/paths here later
}));

const concurrentEventsData = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  image: ''
}));

const supportedByData = [
  { id: 1, image: '' }
];

const Certificate = () => {
  const [certData, setCertData] = useState(null);
  const [selectedType, setSelectedType] = useState('exhibitor');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [newManualName, setNewManualName] = useState('');

  const imgBaseUrl = SERVER_URL;

  const certificateTypes = [
    { value: 'exhibitor', label: 'Exhibitor Certificate' },
    { value: 'knowledge_partner', label: 'Knowledge Partner Certificate' },
    { value: 'supporting_association', label: 'Supporting Association Certificate' },
    { value: 'healthcare_partner', label: 'Health Care Partner Certificate' },
    { value: 'special_guest', label: 'Special Guest Certificate' },
    { value: 'chief_guest', label: 'Chief Guest Certificate' },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

      const configRes = await axios.get(`${API_URL}/certificate-data?type=${selectedType}`);
      if (configRes.data.success && configRes.data.data) {
        setCertData(configRes.data.data);
      }

      const recipientsRes = await axios.get(`${API_URL}/certificate-recipients?type=${selectedType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (recipientsRes.data.success) {
        setRecipients(recipientsRes.data.data);
        setSelectedRecipients([]);
      }
    } catch (error) {
      console.error('Error fetching certificate data:', error);
    }
  };

  const handleAddManualRecipient = async () => {
    if (!newManualName.trim()) return;
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      await axios.post(`${API_URL}/certificate-recipients`,
        { name: newManualName, type: selectedType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewManualName('');
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error adding recipient:', error);
    }
  };

  const toggleRecipient = (id) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter(rId => rId !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const handlePrint = () => {
    if (selectedRecipients.length === 0) return alert('Please select at least one recipient to print.');
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };


  // For namo gange trust logos (24 logos, 6 cols x 4 rows)
  const baseInitiatives = certData?.namo_gange_trust_logos?.length > 0
    ? certData.namo_gange_trust_logos.map((img, i) => ({ id: i + 1, image: `${imgBaseUrl}${img}` }))
    : initiativesData;
  const dynamicInitiatives = Array.from({ length: 24 }).map((_, i) => baseInitiatives[i] || { id: i + 1, image: '' });

  // For concurrent events (7 columns total: 6 logos + 1 empty space for "Supported By")
  const baseConcurrentEvents = certData?.concurrent_events?.length > 0
    ? certData.concurrent_events.map((img, i) => ({ id: i + 1, image: `${imgBaseUrl}${img}` }))
    : concurrentEventsData;
  const dynamicConcurrentEvents = Array.from({ length: 7 }).map((_, i) => baseConcurrentEvents[i] || { id: i + 1, image: '' });

  return (
    <div className="flex flex-col items-center p-2 sm:p-6 bg-[#e5e7eb] min-h-[calc(100vh-60px)] font-serif">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aladin&display=swap');
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0;
            padding: 0;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A3 portrait;
            margin: 0mm;
          }
          .print-hidden {
            display: none !important;
          }
          .print-certificate-wrapper {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background-size: 100% 100% !important;
            position: relative !important;
            visibility: visible !important;
          }
          /* Hide everything else on the page except the certificates */
          body * {
            visibility: hidden;
          }
          #print-container, #print-container * {
            visibility: visible;
          }
          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="w-full max-w-[98%] mx-auto mb-6 print-hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Certificate Management</h2>

          <div className="flex flex-wrap gap-6 mb-6 bg-gray-50 p-5 rounded-lg border border-gray-200 items-end justify-between">

            <div className="flex-1 min-w-[400px] flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-2 text-gray-800">Add Manual Recipient to {certificateTypes.find(t => t.value === selectedType)?.label.replace(' Certificate', '')}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter Name..."
                  value={newManualName}
                  onChange={(e) => setNewManualName(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddManualRecipient}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                + Add Recipient
              </button>
            </div>

            <div className="w-72 flex-none border-l-2 border-gray-200 pl-6">
              <label className="block text-sm font-bold mb-2 text-gray-800">Select Certificate Category</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {certificateTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Recipients List ({recipients.length})</h3>
            <button
              onClick={handlePrint}
              disabled={selectedRecipients.length === 0}
              className={`px-6 py-2 text-white font-bold rounded-lg shadow-md transition-colors ${selectedRecipients.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Print Selected ({selectedRecipients.length})
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 shadow-sm z-20">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={recipients.length > 0 && selectedRecipients.length === recipients.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRecipients(recipients.map(r => r._id));
                        else setSelectedRecipients([]);
                      }}
                    />
                  </th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map(recipient => (
                  <tr key={recipient._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedRecipients.includes(recipient._id)}
                        onChange={() => toggleRecipient(recipient._id)}
                      />
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{recipient.name}</td>
                    <td className="p-4 text-gray-600">{recipient.company || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${recipient.isManual ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {recipient.isManual ? 'Manual' : 'System'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recipients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No recipients found for this category. Add one manually or check system records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="print-container" className={`w-full overflow-x-auto pb-8 ${isPrinting ? 'print:overflow-visible' : ''}`}>
        {(isPrinting && selectedRecipients.length > 0 ? recipients.filter(r => selectedRecipients.includes(r._id)) : [{ _id: 'preview', name: 'PREVIEW NAME' }]).map((recipient, index, arr) => (
          <div
            key={recipient._id}
            className={`relative bg-white shadow-2xl overflow-hidden print-certificate-wrapper mx-auto ${index < arr.length - 1 ? 'mb-8' : ''}`}
            style={{
              width: '297mm',
              height: '420mm',
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              containerType: 'inline-size',
              pageBreakAfter: index < arr.length - 1 ? 'always' : 'auto'
            }}
          >
            <div className="absolute inset-0 px-[8%] pt-[8%] pb-[4%] flex flex-col items-center z-10">

              {/* Header Row */}
              <div className="w-full flex justify-between items-start">
                {/* Left: Govt Logo */}
                <div className="w-[18%] flex flex-col items-center">
                  {certData?.header_left_enable !== false && (
                    <>
                      <span className="text-[#7c5725] font-normal mb-[2%]" style={{ fontFamily: '"Aladin", cursive', textDecoration: 'underline', textDecorationColor: 'rgba(124, 87, 37, 0.55)', textDecorationThickness: '0.16mm', textUnderlineOffset: '0.7mm' }}>{certData?.header_left_heading || 'SUPPORTED BY:'}</span>
                      <img src={certData?.header_left_logo ? `${imgBaseUrl}${certData.header_left_logo}` : msmeLogo} alt="Left Logo" className="w-[85%] object-contain" />
                    </>
                  )}
                </div>

                {/* Center: Namo Gange Logo & Presents */}
                <div className="w-[30%] flex flex-col items-center mt-[1%]">
                  {certData?.header_center_enable !== false && (
                    <>
                      <img src={certData?.header_center_logo ? `${imgBaseUrl}${certData.header_center_logo}` : ngtLogo} alt="Center Logo" className="w-full object-contain" />
                      <p className="mt-[3%] text-3xl font-normal text-[#1b1712]" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.header_center_text || 'Presents'}</p>
                    </>
                  )}
                </div>

                {/* Right: New Logo(s) */}
                <div className="w-[18%] flex flex-col items-center relative">
                  {/* Top Right Logo */}
                  {certData?.header_right_enable && (
                    <div className="flex flex-col items-center w-full">
                      <span className="text-[#7c5725] font-normal mb-[2%] text-center" style={{ fontFamily: '"Aladin", cursive', textDecoration: 'underline', textDecorationColor: 'rgba(124, 87, 37, 0.55)', textDecorationThickness: '0.16mm', textUnderlineOffset: '0.7mm' }}>{certData?.header_right_heading || ''}</span>
                      {certData?.header_right_logo && (
                        <img src={`${imgBaseUrl}${certData.header_right_logo}`} alt="Right Logo" className="w-[85%] object-contain" />
                      )}
                    </div>
                  )}

                  {/* Bottom Right Logo (Affiliated By) */}
                  {certData?.header_right_bottom_enable && (
                    <div className={`flex flex-col items-center w-full absolute ${certData?.header_right_enable ? 'top-[100%] mt-[15%]' : 'top-0'}`}>
                      <span className="text-[#7c5725] font-normal mb-[2%] text-center" style={{ fontFamily: '"Aladin", cursive', textDecoration: 'underline', textDecorationColor: 'rgba(124, 87, 37, 0.55)', textDecorationThickness: '0.16mm', textUnderlineOffset: '0.7mm' }}>{certData?.header_right_bottom_heading || 'AFFILIATED BY:'}</span>
                      {certData?.header_right_bottom_logo && (
                        <img src={`${imgBaseUrl}${certData.header_right_bottom_logo}`} alt="Right Bottom Logo" className="w-[85%] object-contain" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 9th IHWE Logo */}
              <div className="w-[55%] mt-[1%] mb-[2%]">
                <img src={certData?.expo_logo ? `${imgBaseUrl}${certData.expo_logo}` : logo9th} alt="9th IHWE Logo" className="w-full object-contain" />
              </div>

              {/* Certificate Title Image */}
              <div className="w-[50%] mb-[2%]">
                <img src={certData?.certificate_title_image ? `${imgBaseUrl}${certData.certificate_title_image}` : certificateTitle} alt="CERTIFICATE Of Participation & Appreciation" className="w-full object-contain" />
              </div>

              {/* Body Text (Forced exact line breaks to match the image) */}
              <div className="text-center w-full font-normal text-[#1b1712]" style={{ fontFamily: '"Aladin", cursive', letterSpacing: '0px' }}>
                <p className="whitespace-nowrap leading-[1.2] mb-[1%] text-[#1b1712]" style={{ fontSize: '1.9cqi' }}>
                  {(certData?.certi_desc1 || 'We extend our heartfelt gratitude to ').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                  <span className="text-[#d72624] font-bold uppercase">{recipient.name !== 'PREVIEW NAME' ? (selectedType === 'exhibitor' && recipient.company ? recipient.company : recipient.name) : (certData?.certi_name || 'DABUR INDIA LIMITED')}</span>{' '}
                  {(certData?.certi_desc1_part2 || 'for valuable participation in the 9th\nEdition of International Health & Wellness Expo, organized by Namo Gange Trust, held from 21st\nAugust to 23 August 2026 at Pragati Maidan, New Delhi, Bharat.').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p className="whitespace-nowrap leading-[1.38] mb-[1%] text-[#1b1712]" style={{ fontSize: '1.9cqi' }}>
                  {(certData?.certi_desc2 || 'Your stall and the innovative solutions showcased significantly contributed to the success of the\nexpo. The insights and advancements you presented enriched the experience for attendees & played\na vital role in enhancing the overall impact of the event.').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p className="whitespace-nowrap leading-[1.38] mb-[1%] text-[#1b1712]" style={{ fontSize: '1.9cqi' }}>
                  {(certData?.certi_desc3 || 'We deeply appreciate your commitment and support. We look forward to future collaborations and\ncontinuing our shared mission of advancing health & wellness.').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>

              {/* Signatures */}
              <div className="w-[60%] mt-[1%] pt-[2%] border-t-[1.5px] border-[#c5a977] flex justify-between">

                {/* Left Signature */}
                <div className="flex flex-col items-center w-[45%]">
                  <img src={certData?.sign1_image ? `${imgBaseUrl}${certData.sign1_image}` : jagdishSig} alt="Signature 1" className="h-[4cqi] object-contain mb-[2%]" />
                  <div className="w-[80%] bg-[#a68a64] mb-[2%]"></div>
                  <p className="text-[#2d2419] text-[2.2cqi] tracking-normal" style={{ fontFamily: '"Aladin", cursive', fontWeight: 400, lineHeight: 1.02 }}>
                    {certData?.sign1_name || 'H.H.Shri Acharya Jagdish ji'}
                  </p>
                  <p className="text-[#2d2419] text-[2cqi] tracking-normal" style={{ fontFamily: '"Aladin", cursive', fontWeight: 400, lineHeight: 1.02 }}>
                    {certData?.sign1_designation || 'Founder'}
                  </p>
                </div>

                {/* Right Signature */}
                <div className="flex flex-col items-center w-[45%]">
                  <img src={certData?.sign2_image ? `${imgBaseUrl}${certData.sign2_image}` : vijaySig} alt="Signature 2" className="h-[4cqi] object-contain mb-[2%]" />
                  <div className="w-[80%]  bg-[#a68a64] mb-[2%]"></div>
                  <p className="text-[#2d2419] text-[2.2cqi] tracking-normal" style={{ fontFamily: '"Aladin", cursive', fontWeight: 400, lineHeight: 1.02 }}>
                    {certData?.sign2_name || 'Shri Vijay Sharma'}
                  </p>
                  <p className="text-[#2d2419] text-[2cqi] tracking-normal" style={{ fontFamily: '"Aladin", cursive', fontWeight: 400, lineHeight: 1.02 }}>
                    {certData?.sign2_designation || 'Chairman'}
                  </p>
                </div>

              </div>

              {/* Footer Area - Logos & Address */}
              <div className="w-[95%] flex flex-col items-center mt-[1%] pb-[2%]">
                {/* Namo Gange Trust Initiatives */}
                <div className="text-center mb-[0.5%]">
                  <span style={{ color: '#7c5725', fontWeight: 400, fontSize: '1.6cqi', fontFamily: '"Aladin", cursive' }}>Namo Gange Trust Initiatives</span>
                </div>
                <div className="w-full mb-[1%]">
                  <div className="grid grid-cols-12 border-l border-t border-[#b89b6b]">
                    {dynamicInitiatives.map((item) => (
                      <div key={item.id} className="border-r border-b border-[#b89b6b] flex justify-center items-center p-[2%] aspect-[1.5/1]">
                        {item.image ? (
                          <img src={item.image} alt={`Initiative ${item.id}`} className="max-w-[75%] max-h-[75%] object-contain" />
                        ) : (
                          <span className="text-gray-200 text-[0.6cqi]">Logo {item.id}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concurrent Events & Supported By */}
                <div className="w-[95%] flex flex-col items-center mb-[1%] mt-[1%]">
                  {/* Top Headings Row */}
                  <div className="flex w-[98%] mb-[0.5%]">
                    <div className="w-[85.71%] flex justify-center">
                      <span className="tracking-normal" style={{ color: '#7c5725', fontWeight: 400, fontSize: '1.6cqi', fontFamily: '"Aladin", cursive', textDecoration: 'underline', textDecorationColor: 'rgba(124, 87, 37, 0.62)', textDecorationThickness: '0.16mm', textUnderlineOffset: '0.7mm' }}>Concurrent Events</span>
                    </div>
                    <div className="w-[14.29%] flex justify-center">
                      <span className="tracking-normal" style={{ color: '#7c5725', fontWeight: 400, fontSize: '1.6cqi', fontFamily: '"Aladin", cursive', textDecoration: 'underline', textDecorationColor: 'rgba(124, 87, 37, 0.62)', textDecorationThickness: '0.16mm', textUnderlineOffset: '0.7mm' }}>{certData?.concurrent_events_right_heading || 'Supported By:'}</span>
                    </div>
                  </div>

                  {/* Concurrent Events Logos Row */}
                  <div className="w-[98%] grid grid-cols-7 divide-x-[1.5px] divide-[#b89b6b]">
                    {dynamicConcurrentEvents.map((item) => (
                      <div key={item.id} className="flex justify-center items-center p-[2%] aspect-[3/2]">
                        {item.image ? (
                          <img src={item.image} alt={`Concurrent Event ${item.id}`} className="max-w-[90%] max-h-[90%] object-contain" />
                        ) : (
                          <span className="text-gray-200 text-[0.8cqi]">Logo {item.id}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="w-full border-t-[1.5px] border-[#c5a977] pt-[1%] flex flex-col items-center">
                  <p className="text-center text-[#2d2419] font-normal leading-[1.1]" style={{ fontFamily: '"Aladin", cursive', fontSize: '1.8cqi', letterSpacing: '1.5px' }}>
                    {(certData?.certi_address || 'Head Office: 12/52, Site-II, Loni Road Industrial Area, Mohan Nagar, Ghaziabad 201007, UP, Bharat\ninfo@namogange.org | web: www.namogange.org').split('\n').map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificate;
