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
  const imgBaseUrl = SERVER_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/certificate-data`);
        if (response.data.success && response.data.data) {
          setCertData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching certificate data:', error);
      }
    };
    fetchData();
  }, [imgBaseUrl]);

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
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0;
            padding: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          @page {
            size: A3 portrait;
            margin: 0mm;
          }
          .print-hidden {
            display: none !important;
          }
          .print-certificate-wrapper {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide everything else on the page except the certificate */
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            aspect-ratio: auto !important;
            transform: none !important;
            background-size: 100% 100% !important;
          }
        }
      `}</style>

      <div className="w-full flex justify-center mb-4">
        <button
          onClick={() => window.print()}
          className="print-hidden px-6 py-2 bg-[#845f28] text-white font-bold rounded shadow-lg hover:bg-[#6b4c1f] transition-colors"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          Print Certificate (A3)
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-8 print:overflow-visible">
        <div
          id="certificate-print-area"
          className="relative bg-white shadow-2xl overflow-hidden print-certificate-wrapper mx-auto"
          style={{
            width: '297mm',
            height: '420mm',
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            containerType: 'inline-size',
          }}
        >
          <div className="absolute inset-0 px-[8%] pt-[8%] pb-[4%] flex flex-col items-center z-10">

            {/* Header Row */}
            <div className="w-full flex justify-between items-start">
              {/* Left: Govt Logo */}
              <div className="w-[18%] flex flex-col items-center">
                {certData?.header_left_enable !== false && (
                  <>
                    <span className="text-[#7a5725] font-bold mb-[2%] underline underline-offset-[3px]" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.header_left_heading || 'SUPPORTED BY:'}</span>
                    <img src={certData?.header_left_logo ? `${imgBaseUrl}${certData.header_left_logo}` : msmeLogo} alt="Left Logo" className="w-[85%] object-contain" />
                  </>
                )}
              </div>

              {/* Center: Namo Gange Logo & Presents */}
              <div className="w-[30%] flex flex-col items-center mt-[1%]">
                {certData?.header_center_enable !== false && (
                  <>
                    <img src={certData?.header_center_logo ? `${imgBaseUrl}${certData.header_center_logo}` : ngtLogo} alt="Center Logo" className="w-full object-contain" />
                    <p className="mt-[3%] text-3xl font-bold text-[#000]" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.header_center_text || 'Presents'}</p>
                  </>
                )}
              </div>

              {/* Right: New Logo(s) */}
              <div className="w-[18%] flex flex-col items-center relative">
                {/* Top Right Logo */}
                {certData?.header_right_enable && (
                  <div className="flex flex-col items-center w-full">
                    <span className="text-[#7a5725] font-bold mb-[2%] underline underline-offset-[3px] text-center" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.header_right_heading || ''}</span>
                    {certData?.header_right_logo && (
                      <img src={`${imgBaseUrl}${certData.header_right_logo}`} alt="Right Logo" className="w-[85%] object-contain" />
                    )}
                  </div>
                )}
                
                {/* Bottom Right Logo (Affiliated By) */}
                {certData?.header_right_bottom_enable && (
                  <div className={`flex flex-col items-center w-full absolute ${certData?.header_right_enable ? 'top-[100%] mt-[15%]' : 'top-0'}`}>
                    <span className="text-[#7a5725] font-bold mb-[2%] underline underline-offset-[3px] text-center" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.header_right_bottom_heading || 'AFFILIATED BY:'}</span>
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
            <div className="text-center w-full font-bold text-[#000]" style={{ fontFamily: '"Aladin", cursive', letterSpacing: '1.5px' }}>
              <p className="whitespace-nowrap leading-[1.2] mb-[1%] text-[#222]" style={{ fontSize: '1.9cqi' }}>
                {(certData?.certi_desc1 || 'We extend our heartfelt gratitude to ').split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
                <span className="text-[#c00000] font-bold uppercase">{certData?.certi_name || 'DABUR INDIA LIMITED'}</span>{' '}
                {(certData?.certi_desc1_part2 || 'for valuable participation in the 9th\nEdition of International Health & Wellness Expo, organized by Namo Gange Trust, held from 21st\nAugust to 23 August 2026 at Pragati Maidan, New Delhi, Bharat.').split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <p className="whitespace-nowrap leading-[1.2] mb-[1%] text-[#222]" style={{ fontSize: '1.9cqi' }}>
                {(certData?.certi_desc2 || 'Your stall and the innovative solutions showcased significantly contributed to the success of the\nexpo. The insights and advancements you presented enriched the experience for attendees & played\na vital role in enhancing the overall impact of the event.').split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <p className="whitespace-nowrap leading-[1.3] mb-[1%] text-[#222]" style={{ fontSize: '1.9cqi' }}>
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
                <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Aladin", cursive', fontWeight: 600 }}>
                  {certData?.sign1_name || 'H.H.Shri Acharya Jagdish ji'}
                </p>
                <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Aladin", cursive', fontWeight: 600 }}>
                  {certData?.sign1_designation || 'Founder'}
                </p>
              </div>

              {/* Right Signature */}
              <div className="flex flex-col items-center w-[45%]">
                <img src={certData?.sign2_image ? `${imgBaseUrl}${certData.sign2_image}` : vijaySig} alt="Signature 2" className="h-[4cqi] object-contain mb-[2%]" />
                <div className="w-[80%]  bg-[#a68a64] mb-[2%]"></div>
                <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Aladin", cursive', fontWeight: 600 }}>
                  {certData?.sign2_name || 'Shri Vijay Sharma'}
                </p>
                <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Aladin", cursive', fontWeight: 600 }}>
                  {certData?.sign2_designation || 'Chairman'}
                </p>
              </div>

            </div>

            {/* Footer Area - Logos & Address */}
            <div className="w-[95%] flex flex-col items-center mt-[2%] pb-[2%]">
              {/* Namo Gange Trust Initiatives */}
              <div className="text-center mb-[0.5%]">
                <span className="text-[#7a5725] font-bold uppercase tracking-wide" style={{ fontFamily: '"Aladin", cursive' }}>Namo Gange Trust Initiatives</span>
              </div>
              <div className="w-full mb-[2.5%]">
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
                    <span className="text-[#7a5725] font-bold uppercase underline underline-offset-[3px] tracking-wide" style={{ fontFamily: '"Aladin", cursive' }}>Concurrent Events</span>
                  </div>
                  <div className="w-[14.29%] flex justify-center">
                    <span className="text-[#7a5725] font-bold uppercase underline underline-offset-[3px] tracking-wide" style={{ fontFamily: '"Aladin", cursive' }}>{certData?.concurrent_events_right_heading || 'Supported By:'}</span>
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
                <p className="text-center text-[#222] font-medium leading-snug" style={{ fontFamily: '"Aladin", cursive', fontSize: '1.8cqi', letterSpacing: '2.0px' }}>
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
      </div>
    </div>
  );
};

export default Certificate;
