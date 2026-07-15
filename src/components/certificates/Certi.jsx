import React from "react";
import certificateBackground from "../../assets/certificates/Certificate/Background.jpg";
import certificateHeading from "../../assets/certificates/Certificate/Certificate Participation copy.png";
import msmeSupportedBy from "../../assets/certificates/Certificate/MSME.png";
import namoGangeLogo from "../../assets/certificates/Certificate/NGT Logo.png";
import eventLogo from "../../assets/certificates/Certificate/ags logo.png";
import founderSignature from "../../assets/certificates/Certificate/Acharya ji.png";
import chairmanSignature from "../../assets/certificates/Certificate/Vijay sir.png";
import globalAwardLogo from "../../assets/certificates/Certificate/Global Award.png";
import initiativeIcoaLogo from "../../assets/certificates/iniciatives/ICOA.png";
import initiativeMbmaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/MBMA.png";
import initiativeArogyaResearchLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Arogya research.png";
import initiativeAviralGangaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Aviral Ganga.png";
import initiativeTheScienceOfYogaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/TGMy.png";
import initiativeSwachBharatLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Swach Bharat.png";
import initiativeGlobalAwardsLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Global Awads.png";
import initiativeArogyaMantraLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Agrogya Mantra.png";
import initiativeArogyaSangoshthiLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Arogya sangoshthi.png";
import initiativePanchkarmaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Panchkarma.png";
import initiativeYogshalaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/YOgshala.png";
import initiativeYogshalaExpoLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Yogshala Expo.png";
import initiativeRangshalaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Bachchon ki Rangshal.png";
import initiativeIcaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/ICA.png";
import initiativeMadhyaPradeshExpoLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Madhya Pradesh Development Expo.png";
import initiativeAyushLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Ayush.png";
import initiativeAyushMitraLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Ayush Mitra.png";
import initiativeNgtFarmsLogo from "../../assets/certificates/NamoGangeTrustInitiatives/NGT Farms logo.png";
import initiativeArogyaFilmLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Arogya.png";
import initiativeAnnSewaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Ann sewa.png";
import initiativeAcharyaJiLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Acharay ji.png";
import initiativeIndoLogo from "../../assets/certificates/NamoGangeTrustInitiatives/indo.png";
import initiativeVaidhyashalaLogo from "../../assets/certificates/NamoGangeTrustInitiatives/vaidhyashala.png";
import initiativeYogshalaCenterLogo from "../../assets/certificates/NamoGangeTrustInitiatives/Yogshal Center.png";
import concurrentFreeHealthCampLogo from "../../assets/certificates/ConcurrentEvent/Free Health camp.png";
import concurrentBharatDevelopmentLogo from "../../assets/certificates/ConcurrentEvent/BHarat Development.png";
import concurrentYogshalaLogo from "../../assets/certificates/ConcurrentEvent/Yogshala.png";
import concurrentNamoGangeGlobalLogo from "../../assets/certificates/ConcurrentEvent/Namo Gange Global.png";
import concurrentAgriTechLogo from "../../assets/certificates/ConcurrentEvent/Agri tech.png";
import concurrentAgsLogo from "../../assets/certificates/ConcurrentEvent/AGS.png";
import concurrentIcoaLogo from "../../assets/certificates/ConcurrentEvent/Icoa.png";

const initiativeLogoSlots = [
    { id: "initiative-1", src: initiativeIcoaLogo, alt: "ICOA" },
    { id: "initiative-2", src: initiativeMbmaLogo, alt: "Meri Beti Mera Abhiman" },
    { id: "initiative-3", src: initiativeArogyaMantraLogo, alt: "Arogya Mantra" },
    { id: "initiative-4", src: initiativeYogshalaLogo, alt: "Yogshala" },
    { id: "initiative-5", src: initiativeAcharyaJiLogo, alt: "Acharya Ji" },
    { id: "initiative-6", src: initiativeIcaLogo, alt: "Indian Contemporary Art" },
    { id: "initiative-7", src: initiativeAviralGangaLogo, alt: "Aviral Ganga" },
    { id: "initiative-8", src: initiativeAyushLogo, alt: "Ayush" },
    { id: "initiative-9", src: initiativeTheScienceOfYogaLogo, alt: "The Science of Yoga" },
    { id: "initiative-10", src: initiativeArogyaFilmLogo, alt: "Arogya Film Festival" },
    { id: "initiative-11", src: initiativeIndoLogo, alt: "Indo Himalayan Expo" },
    { id: "initiative-12", src: initiativeGlobalAwardsLogo, alt: "Global Awards" },
    { id: "initiative-13", src: initiativeAyushMitraLogo, alt: "Ayush Mitra" },
    { id: "initiative-14", src: initiativeRangshalaLogo, alt: "Bachchon Ki Rangshala" },
    { id: "initiative-15", src: initiativeVaidhyashalaLogo, alt: "Vaidhyashala" },
    { id: "initiative-16", src: initiativePanchkarmaLogo, alt: "Panchkarma" },
    { id: "initiative-17", src: initiativeArogyaResearchLogo, alt: "Arogya Research Centre" },
    { id: "initiative-18", src: initiativeSwachBharatLogo, alt: "Swachh Bharat" },
    { id: "initiative-19", src: initiativeYogshalaCenterLogo, alt: "Yogshala Center" },
    { id: "initiative-20", src: initiativeAnnSewaLogo, alt: "Ann Sewa" },
    { id: "initiative-21", src: initiativeNgtFarmsLogo, alt: "NGT Farms" },
    { id: "initiative-22", src: initiativeArogyaSangoshthiLogo, alt: "Arogya Sangoshthi" },
    { id: "initiative-23", src: initiativeYogshalaExpoLogo, alt: "Yogshala Expo" },
    { id: "initiative-24", src: initiativeMadhyaPradeshExpoLogo, alt: "Madhya Pradesh Development Expo" },
];

const concurrentLogoSlots = [
    { id: "concurrent-1", src: concurrentAgsLogo, alt: "Arogya Sangoshthi", fit: "ags" },
    { id: "concurrent-2", src: concurrentYogshalaLogo, alt: "Yogshala Expo", fit: "yogshala" },
    { id: "concurrent-3", src: concurrentBharatDevelopmentLogo, alt: "Bharat Development Expo", fit: "wide" },
    { id: "concurrent-4", src: concurrentAgriTechLogo, alt: "Agri Tech", fit: "wide" },
    { id: "concurrent-5", src: concurrentNamoGangeGlobalLogo, alt: "Namo Gange Global Healthcare Excellence Award", fit: "global" },
    { id: "concurrent-6", src: concurrentFreeHealthCampLogo, alt: "Free Health Camp", fit: "health" },
    { id: "concurrent-7", src: concurrentIcoaLogo, alt: "ICOA", fit: "icoa", supportedBy: true },
];

const Certi = ({
    recipientName = "",
    supportedByLogo = msmeSupportedBy,
    mainLogo = namoGangeLogo,
    titleLogo = eventLogo,
}) => {
    const safeCompanyName = String(recipientName || "").trim() || "";

    return (
        <div className="certi-page-shell">
            <style>{`
                @import url("https://fonts.googleapis.com/css2?family=Aladin&display=swap");

                :root {
                    --certificate-brown: #7c5725;
                    --certificate-dark: #1b1712;
                    --certificate-red: #d72624;
                    --certificate-blue: #254b9f;
                    --certificate-font: "Aladin", Papyrus, "Bradley Hand",
                        "Marker Felt", "Comic Sans MS", cursive;
                }

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                }

                .certi-page-shell {
                    min-height: 100vh;
                    padding: 24px;
                    background: #eeeeee;
                    font-family: Georgia, "Times New Roman", serif;
                }

                .certificate-preview-wrap {
                    display: flex;
                    justify-content: center;
                    overflow: auto;
                }

                .certificate-print-area {
                    position: relative;
                    width: 210mm;
                    height: 297mm;
                    flex: 0 0 auto;
                    overflow: hidden;
                    background-color: #fffdf5;
                    background-image: url("${certificateBackground}");
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 100% 100%;
                    box-shadow: 0 10px 38px rgba(0, 0, 0, 0.2);
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .certificate-image {
                    position: absolute;
                    display: block;
                    object-fit: contain;
                    object-position: center;
                    max-width: 100%;
                    max-height: 100%;
                }

                .msme-logo {
                    top: 9.15%;
                    left: 9.65%;
                    width: 17.9%;
                    height: 8.85%;
                }

                .supported-by-text {
                    position: absolute;
                    top: 6.95%;
                    left: 9.65%;
                    width: 17.9%;
                    color: var(--certificate-brown);
                    font-family: var(--certificate-font);
                    font-size: 3.45mm;
                    font-weight: 400;
                    line-height: 1;
                    text-align: center;
                    text-decoration-line: underline;
                    text-decoration-color: rgba(124, 87, 37, 0.55);
                    text-decoration-thickness: 0.16mm;
                    text-underline-offset: 0.7mm;
                    white-space: nowrap;
                }

                .namo-logo {
                    top: 8.75%;
                    left: 34.05%;
                    width: 31.9%;
                    height: 8.15%;
                }

                .presents-text {
                    position: absolute;
                    top: 18.15%;
                    left: 50%;
                    transform: translateX(-50%);
                    color: var(--certificate-dark);
                    font-family: var(--certificate-font);
                    font-size: 3.65mm;
                    font-weight: 400;
                    line-height: 1;
                    white-space: nowrap;
                }

                .event-title-logo {
                    top: 20.15%;
                    left: 24.85%;
                    width: 52.4%;
                    height: 15%;
                }

                .certificate-heading {
                    top: 35.2%;
                    left: 32.1%;
                    width: 35.8%;
                    height: 8.8%;
                }

                .certificate-print-area .certificate-body {
                    position: absolute;
                    top: 45.6%;
                    left: 9.65%;
                    width: 80.7%;

                    color: var(--certificate-dark);
                    text-align: center;
                    font-family: var(--certificate-font) !important;
                    font-size: 20px !important;
                    font-weight: 400;
                    line-height: 1.38;
                    letter-spacing: 0;
                    overflow: visible;
                }

                .certificate-print-area .certificate-body p {
                    margin: 0;
                    padding: 0;
                    color: inherit;
                    font-family: inherit !important;
                    font-size: 20px !important;
                    font-weight: inherit;
                    line-height: inherit;
                }

                .certificate-print-area .certificate-body span {
                    font-family: inherit !important;
                    font-size: 20px !important;
                    line-height: inherit;
                }

                .recipient-name {
                    display: inline-flex;
                    min-width: 41mm;
                    max-width: 43%;
                    min-height: 5.2mm;
                    align-items: flex-end;
                    justify-content: center;
                    color: var(--certificate-dark);
                    border-bottom: 1.5px dotted rgba(124, 87, 37, 0.38);
                    font-size: 20px !important;
                    font-weight: 700;
                    line-height: 1;
                    text-transform: uppercase;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    vertical-align: baseline;
                }

                .certificate-blue-text {
                    color: var(--certificate-blue);
                    font-size: 20px !important;
                }

                .signature-line {
                    position: absolute;
                    top: 66.97%;
                    left: 19.15%;
                    width: 61.7%;
                    height: 0.28mm;
                    background: rgba(124, 87, 37, 0.58);
                }

                .signature-block {
                    position: absolute;
                    top: 67.9%;
                    width: 21%;
                    height: 8.1%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    color: #2d2419;
                    text-align: center;
                    font-family: var(--certificate-font);
                    font-weight: 400;
                    line-height: 1.02;
                    overflow: hidden;
                }

                .signature-block img {
                    display: block;
                    object-fit: contain;
                    object-position: center;
                    max-width: 100%;
                }

                .founder-signature {
                    left: 15.7%;
                }

                .founder-signature img {
                    width: 66%;
                    height: 22mm;
                }

                .chairman-signature {
                    left: 63.7%;
                }

                .chairman-signature img {
                    width: 72%;
                    height: 21mm;
                }

                .signature-name {
                    font-size: 4mm;
                    margin-top: -1mm;
                    white-space: nowrap;
                }

                .signature-role {
                    font-size: 3.5mm;
                    white-space: nowrap;
                }

                .global-award-logo {
                    top: 68.35%;
                    left: 40.55%;
                    width: 18.9%;
                    height: 6.7%;
                }

                .logo-placeholder-grid {
                    position: absolute;
                    background: transparent;
                    overflow: hidden;
                }

                .logo-placeholder-grid::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 2;
                }

                .initiative-logo-grid {
                    display: grid;
                    top: 78.25%;
                    left: 15%;
                    width: 70%;
                    height: 5.85%;
                    grid-template-columns: repeat(12, 1fr);
                    grid-template-rows: repeat(2, 1fr);
                    border: 0.35mm solid #8a5c35;
                }

                .initiative-logo-grid::before {
                    background:
                        linear-gradient(
                            to bottom,
                            transparent calc(50% - 0.11mm),
                            rgba(138, 92, 53, 0.72) calc(50% - 0.11mm),
                            rgba(138, 92, 53, 0.72) calc(50% + 0.11mm),
                            transparent calc(50% + 0.11mm)
                        ),
                        repeating-linear-gradient(
                            to right,
                            transparent 0,
                            transparent calc(8.333333% - 0.14mm),
                            #8a5c35 calc(8.333333% - 0.14mm),
                            #8a5c35 8.333333%
                        );
                }

                .concurrent-logo-grid {
                    display: flex;
                    top: 87.05%;
                    left: 13.75%;
                    width: 72.5%;
                    height: 3.35%;
                    background: transparent;
                    overflow: visible;
                }

                .concurrent-logo-grid::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0.35mm;
                    height: 0.28mm;
                    background: rgba(124, 87, 37, 0.58);
                    z-index: 2;
                }

                .logo-placeholder-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-right: 0.28mm solid #8a5c35;
                    border-bottom: 0.28mm solid #8a5c35;
                    line-height: 1;
                    background: transparent;
                    padding: 0.45mm;
                    min-width: 0;
                    min-height: 0;
                }

                .initiative-logo-grid .logo-placeholder-cell {
                    border: 0;
                }

                .initiative-logo-grid .logo-placeholder-cell:nth-child(12n),
                .concurrent-logo-grid .logo-placeholder-cell:last-child {
                    border-right: 0;
                }

                .initiative-logo-grid .logo-placeholder-cell:nth-child(n + 13),
                .concurrent-logo-grid .logo-placeholder-cell {
                    border-bottom: 0;
                }

                .concurrent-logo-grid .logo-placeholder-cell {
                    position: relative;
                    flex: 1 1 0;
                    height: 100%;
                    border: 0;
                    color: #254b9f;
                    background: transparent;
                    padding: 0 1.45mm;
                    overflow: visible;
                }

                .concurrent-logo-grid .logo-placeholder-cell::after {
                    content: "";
                    position: absolute;
                    top: 0.1mm;
                    right: 0;
                    width: 0.28mm;
                    height: 82%;
                    background: rgba(124, 87, 37, 0.58);
                    z-index: 2;
                }

                .concurrent-logo-grid .logo-placeholder-cell:last-child::after {
                    display: none;
                }

                .concurrent-logo-grid .supported-by-cell {
                    align-items: center;
                    flex-direction: column;
                    justify-content: flex-start;
                    padding-top: 0;
                }

                .logo-placeholder-cell img {
                    display: block;
                    width: 96%;
                    height: 92%;
                    object-fit: contain;
                    object-position: center;
                    background: transparent;
                }

                .initiative-logo-grid .logo-placeholder-cell img {
                    position: relative;
                    z-index: 1;
                }

                .concurrent-logo-grid .logo-placeholder-cell img {
                    width: 86%;
                    height: 78%;
                    transform: translateY(-0.45mm);
                }

                .concurrent-logo-grid .concurrent-logo-ags {
                    width: 112%;
                    height: 96%;
                }

                .concurrent-logo-grid .concurrent-logo-yogshala {
                    width: 110%;
                    height: 90%;
                }

                .concurrent-logo-grid .concurrent-logo-wide {
                    width: 104%;
                    height: 74%;
                }

                .concurrent-logo-grid .concurrent-logo-global {
                    width: 106%;
                    height: 92%;
                }

                .concurrent-logo-grid .concurrent-logo-health {
                    width: 98%;
                    height: 94%;
                }

                .concurrent-logo-grid .concurrent-logo-icoa {
                    width: 82%;
                    height: 104%;
                    transform: translateY(1.95mm);
                }

                .concurrent-supported-label {
                    position: absolute;
                    top: -5.55mm;
                    left: 50%;
                    transform: translateX(-50%);
                    display: block;
                    color: #7c5725;
                    font-family: var(--certificate-font);
                    font-size: 3.35mm;
                    font-weight: 400;
                    line-height: 1;
                    text-align: center;
                    text-decoration-line: underline;
                    text-decoration-color: rgba(124, 87, 37, 0.62);
                    text-decoration-thickness: 0.16mm;
                    text-underline-offset: 0.7mm;
                    white-space: nowrap;
                    z-index: 3;
                }

                .certificate-section-title {
                    position: absolute;
                    left: 10%;
                    width: 80%;
                    color: #7c5725;
                    text-align: center;
                    font-family: var(--certificate-font);
                    font-size: 3.35mm;
                    font-weight: 400;
                  
                    line-height: 1;
                    white-space: nowrap;
                }

                .initiatives-title {
                    top: 76.35%;
                }

                .concurrent-title {
                    top: 85.15%;
                    font-size: 3.35mm;
                    text-decoration-line: underline;
                    text-decoration-color: rgba(124, 87, 37, 0.62);
                    text-decoration-thickness: 0.16mm;
                    text-underline-offset: 0.7mm;
                }

                .certificate-footer {
                    position: absolute;
                    left: 10%;
                    width: 80%;
                    text-align: center;
                    color: #2d2419;
                    font-family: var(--certificate-font);
                    font-weight: 400;
                    line-height: 1.1;
                    overflow: hidden;
                }

                .certificate-footer-address {
                    top: 91.15%;
                    font-size: clamp(4.05mm, 1.3vw, 4.65mm);
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .certificate-footer-contact {
                    top: 94.95%;
                    font-size: clamp(4mm, 1.28vw, 4.55mm);
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                @media screen and (max-width: 860px) {
                    .certi-page-shell {
                        padding: 12px;
                    }

                    .certificate-preview-wrap {
                        justify-content: flex-start;
                    }

                    .certificate-print-area {
                        transform-origin: top left;
                    }
                }

                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media print {
                    *,
                    *::before,
                    *::after {
                        box-shadow: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    html,
                    body,
                    #root {
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: #ffffff !important;
                    }

                    @page {
                        size: 210mm 297mm;
                        margin: 0;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .certificate-print-area,
                    .certificate-print-area * {
                        visibility: visible !important;
                    }

                    .certi-page-shell,
                    .certificate-preview-wrap {
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: transparent !important;
                    }

                    .certificate-print-area {
                        position: fixed !important;
                        inset: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        min-width: 210mm !important;
                        min-height: 297mm !important;
                        max-width: 210mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        box-shadow: none !important;
                        transform: none !important;
                        page-break-before: avoid !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-after: avoid-page !important;
                        break-inside: avoid-page !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .certificate-print-area img {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .certificate-print-area .certificate-body,
                    .certificate-print-area .certificate-body p,
                    .certificate-print-area .certificate-body span {
                        font-size: 20px !important;
                    }

                    .certificate-footer {
                        transform: none !important;
                        white-space: nowrap !important;
                    }

                    .certificate-footer-address {
                        font-size: 4.65mm !important;
                    }

                    .certificate-footer-contact {
                        font-size: 4.55mm !important;
                    }

                    .concurrent-title,
                    .concurrent-supported-label {
                        font-size: 3mm !important;
                    }
                }
            `}</style>

            <div className="certificate-preview-wrap">
                <section
                    className="certificate-print-area"
                    aria-label={`Certificate for ${safeCompanyName}`}
                >
                    <img
                        className="certificate-image msme-logo"
                        src={supportedByLogo}
                        alt="Supported by Government of India, Ministry of MSME"
                    />
                    <div className="supported-by-text">SUPPORTED BY:</div>

                    <img
                        className="certificate-image namo-logo"
                        src={mainLogo}
                        alt="Namo Gange"
                    />

                    <div className="presents-text">Presents</div>

                    <img
                        className="certificate-image event-title-logo"
                        src={titleLogo}
                        alt="18th Edition Arogya Sangoshthi"
                    />

                    <img
                        className="certificate-image certificate-heading"
                        src={certificateHeading}
                        alt="Certificate of Participation"
                    />

                    <div className="certificate-body">
                        <p>
                            This is to certify that{" "}
                            <span className="recipient-name">
                                {safeCompanyName}
                            </span>{" "}
                            has actively participated in the 18th <br /> Edition of{" "}
                            <span className="certificate-blue-text">
                                Arogya Sangosthi
                            </span>{" "}
                            Seminar &amp; 9th Edition of{" "}
                            <span className="certificate-blue-text">
                                International Health &amp; Wellness <br />
                            </span>{" "}
                            <span className="certificate-blue-text">
                                Expo 2026
                            </span>
                            , organised by Namo Gange Trust, held from 21st
                            August to 23rd August 2026 <br /> at Pragati Maidan, New
                            Delhi, Bharat. <br /> Your valuable contributions and
                            active engagement during the seminar have greatly <br />
                            enriched the discussions on healthcare and wellness. <br />
                            We, at Namo Gange Trust, appreciate your dedication
                            and wish you continued success <br /> in your future
                            endeavours.
                        </p>
                    </div>

                    <div className="signature-line" />

                    <div className="signature-block founder-signature">
                        <img src={founderSignature} alt="H.H. Shri Acharya Jagdish Ji signature" />
                        <div className="signature-name">H.H. Shri Acharya Jagdish Ji</div>
                        <div className="signature-role">Founder</div>
                    </div>

                    <img
                        className="certificate-image global-award-logo"
                        src={globalAwardLogo}
                        alt="Namo Gange Global Healthcare Excellence Award"
                    />

                    <div className="signature-block chairman-signature">
                        <img src={chairmanSignature} alt="Shri Vijay Sharma signature" />
                        <div className="signature-name">Shri Vijay Sharma</div>
                        <div className="signature-role">Chairman</div>
                    </div>

                    <div className="certificate-section-title initiatives-title">
                        Namo Gange Trust Initiatives
                    </div>

                    <div
                        className="logo-placeholder-grid initiative-logo-grid"
                        aria-label="Namo Gange Trust Initiatives logos"
                    >
                        {initiativeLogoSlots.map((logo) => (
                            <div className="logo-placeholder-cell" key={logo.id}>
                                {logo.src ? <img src={logo.src} alt={logo.alt} /> : null}
                            </div>
                        ))}
                    </div>

                    <div className="certificate-section-title concurrent-title">
                        CONCURRENT EVENTS
                    </div>

                    <div
                        className="logo-placeholder-grid concurrent-logo-grid"
                        aria-label="Concurrent Events and Supporting Organizations logos"
                    >
                        {concurrentLogoSlots.map((logo) => (
                            <div
                                className={`logo-placeholder-cell${logo.supportedBy ? " supported-by-cell" : ""}`}
                                key={logo.id}
                            >
                                {logo.supportedBy ? (
                                    <div className="concurrent-supported-label">
                                        SUPPORTED BY
                                    </div>
                                ) : null}
                                {logo.src ? (
                                    <img
                                        className={`concurrent-logo-${logo.fit}`}
                                        src={logo.src}
                                        alt={logo.alt}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="certificate-footer certificate-footer-address">
                        Head Office: 12/52, Site-II, Loni Road Industrial Area,
                        Mohan Nagar, Ghaziabad 201007, UP, Bharat
                        <br />
                        info@namogange.org | web: www.namogange.org
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Certi;
