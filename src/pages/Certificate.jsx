import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const imgBaseUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${imgBaseUrl}/api/certificate-data`);
        if (response.data.success && response.data.data) {
          setCertData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching certificate data:', error);
      }
    };
    fetchData();
  }, [imgBaseUrl]);

  // Use dynamic logos or fallback to static empty arrays
  const dynamicInitiatives = certData?.namo_gange_trust_logos?.length > 0
    ? certData.namo_gange_trust_logos.map((img, i) => ({ id: i + 1, image: `${imgBaseUrl}${img}` }))
    : initiativesData;

  const dynamicConcurrentEvents = certData?.concurrent_events?.length > 0
    ? certData.concurrent_events.map((img, i) => ({ id: i + 1, image: `${imgBaseUrl}${img}` }))
    : concurrentEventsData;

  return (
    <div className="flex flex-col items-center p-2 sm:p-6 bg-[#e5e7eb] min-h-[calc(100vh-60px)] font-serif">
      <style>{`
        @media print {
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
            height: 88vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            aspect-ratio: auto !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-[850px] flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="print-hidden px-6 py-2 bg-[#845f28] text-white font-bold rounded shadow-lg hover:bg-[#6b4c1f] transition-colors"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          Print Certificate (A3)
        </button>
      </div>

      <div
        id="certificate-print-area"
        className="relative bg-white shadow-2xl overflow-hidden print-certificate-wrapper"
        style={{
          width: '100%',
          maxWidth: '850px', // Reduced to make the height smaller on screen
          aspectRatio: '297 / 382', // Reduced height ratio
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          containerType: 'inline-size', // Enables scaling text based on container width
        }}
      >
        <div className="absolute inset-0 px-[10%] pt-[9%] pb-[3%] flex flex-col items-center z-10">

          {/* Header Row */}
          <div className="w-full flex justify-between items-start">
            {/* Left: Govt Logo */}
            <div className="w-[18%] flex flex-col items-center">
              <span className="text-[#845f28] font-bold tracking-widest mb-[2%] underline decoration-[1.5px] underline-offset-[3px]" style={{ fontFamily: 'Georgia, serif', fontSize: '1.1cqi' }}>SUPPORTED BY:</span>
              <img src={msmeLogo} alt="Govt Logo" className="w-[85%] object-contain" />
            </div>

            {/* Center: Namo Gange Logo */}
            <div className="w-[30%] flex flex-col items-center">
              <img src={ngtLogo} alt="Namo Gange Logo" className="w-full object-contain" />
              <p className="mt-[3%] text-3xl font-bold text-[#1f385c]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Presents</p>
            </div>

            {/* Right: Balance */}
            <div className="w-[18%]"></div>
          </div>

          {/* 9th Expo Logo */}
          <div className="w-[40%]">
            <img src={certData?.expo_logo ? `${imgBaseUrl}${certData.expo_logo}` : logo9th} alt="Expo Logo" className="w-[85%] mx-auto object-contain drop-shadow-md" />
          </div>

          {/* Certificate Title */}
          <div className="w-[50%] mb-[2%]">
            {/* {certData?.certi_name ? (
              <h2 className="text-[#845f28] font-bold text-[3cqi] tracking-wide text-center" style={{ fontFamily: 'Georgia, serif' }}>{certData.certi_name}</h2>
            ) : ( */}
            <img src={certificateTitle} alt="CERTIFICATE Of Participation & Appreciation" className="w-full object-contain" />
            {/* )} */}
          </div>

          {/* Body Text (Forced exact line breaks to match the image) */}
          <div className="text-center font-semibold text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <p className="whitespace-nowrap leading-[1.2] mb-[2%]" style={{ fontSize: '1.9cqi' }}>
              We extend our heartfelt gratitude to <span className="text-[#c00000] font-bold uppercase">DABUR INDIA LIMITED</span> for valuable participation in the 9th<br />
              Edition of International Health & Wellness Expo, organized by Namo Gange Trust, held from 21st<br />
              August to 23 August 2026 at Pragati Maidan, New Delhi, Bharat.
            </p>
            <p className="whitespace-nowrap leading-[1.2] mb-[2%]" style={{ fontSize: '1.9cqi' }}>
              Your stall and the innovative solutions showcased significantly contributed to the success of the<br />
              expo. The insights and advancements you presented enriched the experience for attendees & played<br />
              a vital role in enhancing the overall impact of the event.
            </p>
            <p className="whitespace-nowrap leading-[1.3] mb-[2%]" style={{ fontSize: '1.9cqi' }}>
              We deeply appreciate your commitment and support. We look forward to future collaborations and<br />
              continuing our shared mission of advancing health & wellness.
            </p>
          </div>

          {/* Signatures */}
          <div className="w-[60%] mt-[3%] flex justify-between">

            {/* Left Signature */}
            <div className="flex flex-col items-center w-[45%]">
              <img src={certData?.sign1_image ? `${imgBaseUrl}${certData.sign1_image}` : jagdishSig} alt="Signature 1" className="h-[4cqi] object-contain mb-[2%]" />
              <div className="w-[80%] h-[1.5px] bg-[#a68a64] mb-[2%]"></div>
              <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 }}>
                {certData?.sign1_name || 'H.H.Shri Acharya Jagdish ji'}
              </p>
              <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Bookman Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif', fontWeight: 600 }}>
                {certData?.sign1_designation || 'Founder'}
              </p>
            </div>

            {/* Right Signature */}
            <div className="flex flex-col items-center w-[45%]">
              <img src={certData?.sign2_image ? `${imgBaseUrl}${certData.sign2_image}` : vijaySig} alt="Signature 2" className="h-[4cqi] object-contain mb-[2%]" />
              <div className="w-[80%] h-[1.5px] bg-[#a68a64] mb-[2%]"></div>
              <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 600 }}>
                {certData?.sign2_name || 'Shri Vijay Sharma'}
              </p>
              <p className="text-[#222] text-lg tracking-wide" style={{ fontFamily: '"Bookman Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif', fontWeight: 600 }}>
                {certData?.sign2_designation || 'Chairman'}
              </p>
            </div>

          </div>

          {/* Footer Area - Logos & Address */}
          <div className="w-[95%] flex flex-col items-center mt-[2%] pb-[2%]">
            {/* Namo Gange Trust Initiatives */}
            <div className="text-center mb-[0.5%]">
              <span className="text-[#83654D] font-bold text-xl" style={{ fontFamily: '"Times New Roman", Times, serif', }}>Namo Gange Trust Initiatives</span>
            </div>
            <div className="w-full mb-[1.5%]">
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
            <div className="w-[95%] flex flex-col mb-[2%] mt-[1%]">
              {/* Headings Row */}
              <div className="flex w-full mb-[0.5%]">
                <div className="w-[82%] text-center">
                  <span className="text-[#845f28] font-bold underline tracking-widest" style={{ fontFamily: '"Times New Roman", Times, serif' }}>CONCURRENT EVENTS</span>
                </div>
                <div className="w-[18%] text-center">
                  <span className="text-[#845f28] font-bold underline tracking-widest" style={{ fontFamily: '"Times New Roman", Times, serif' }}>SUPPORTED BY</span>
                </div>
              </div>

              {/* Logos Row */}
              <div className="flex w-full items-center">
                {/* Concurrent Events Logos */}
                <div className="w-full flex justify-between items-stretch pr-[1.5%]">
                  {dynamicConcurrentEvents.filter(event => event.image).map((event, index, array) => (
                    <React.Fragment key={event.id}>
                      <div className="flex-1 flex justify-center items-center px-[1.5%] py-[1%] h-[5cqi]">
                        <img src={event.image} alt={`Event ${event.id}`} className="max-w-full max-h-full object-contain" />
                      </div>
                      {index < array.length - 1 && (
                        <div className="self-center w-[1px] h-[4.5cqi] bg-[#c5a977]"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Supported By Logo */}
                {/* <div className="w-[18%] flex justify-center items-center pl-[1.5%]">
                  {supportedByData.map(support => (
                    <div key={support.id} className="w-full flex justify-center items-center px-[1.5%] py-[1%] h-[5cqi]">
                      {support.image ? (
                        <img src={support.image} alt={`Support ${support.id}`} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-gray-200 text-[0.6cqi]">Support {support.id}</span>
                      )}
                    </div>
                  ))}
                </div> */}
              </div>
            </div>

            {/* Address */}
            <div className="w-full border-t-[1.5px] border-[#c5a977] pt-[1%] mt-[1%] flex flex-col items-center">
              <p className="text-center text-[#222] text-[14px] font-bold tracking-wide leading-snug" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                Head Office: 12/52, Site-II, Loni Road Industrial Area, Mohan Nagar, Ghaziabad 201007, UP, Bharat<br />
                info@namogange.org | web: www.namogange.org
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Certificate;
