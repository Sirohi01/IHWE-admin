import React, { useEffect, useMemo, useRef, useState } from "react";
function SvgIcon({
  size = 24,
  strokeWidth = 2,
  className = "",
  color,
  children,
  viewBox = "0 0 24 24",
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

function ArrowRight(props) {
  return (
    <SvgIcon data-icon-name="ArrowRight" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </SvgIcon>
  );
}

function Bell(props) {
  return (
    <SvgIcon data-icon-name="Bell" {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </SvgIcon>
  );
}

function CalendarDays(props) {
  return (
    <SvgIcon data-icon-name="CalendarDays" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </SvgIcon>
  );
}

function ChevronDown(props) {
  return (
    <SvgIcon data-icon-name="ChevronDown" {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  );
}

function Download(props) {
  return (
    <SvgIcon data-icon-name="Download" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </SvgIcon>
  );
}

function Eye(props) {
  return (
    <SvgIcon data-icon-name="Eye" {...props}>
      <path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </SvgIcon>
  );
}

function FileText(props) {
  return (
    <SvgIcon data-icon-name="FileText" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h2" />
    </SvgIcon>
  );
}

function Headphones(props) {
  return (
    <SvgIcon data-icon-name="Headphones" {...props}>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M18 19h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5a2 2 0 0 1-2 2Z" />
      <path d="M6 19h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H4v5a2 2 0 0 0 2 2Z" />
    </SvgIcon>
  );
}

function Mail(props) {
  return (
    <SvgIcon data-icon-name="Mail" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </SvgIcon>
  );
}

function MessageCircle(props) {
  return (
    <SvgIcon data-icon-name="MessageCircle" {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </SvgIcon>
  );
}

function MoreVertical(props) {
  return (
    <SvgIcon data-icon-name="MoreVertical" {...props}>
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

function Percent(props) {
  return (
    <SvgIcon data-icon-name="Percent" {...props}>
      <path d="m19 5-14 14" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </SvgIcon>
  );
}

function Phone(props) {
  return (
    <SvgIcon data-icon-name="Phone" {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.9Z" />
    </SvgIcon>
  );
}

function Search(props) {
  return (
    <SvgIcon data-icon-name="Search" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </SvgIcon>
  );
}

function Send(props) {
  return (
    <SvgIcon data-icon-name="Send" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </SvgIcon>
  );
}

function Ticket(props) {
  return (
    <SvgIcon data-icon-name="Ticket" {...props}>
      <path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </SvgIcon>
  );
}

function Wallet(props) {
  return (
    <SvgIcon data-icon-name="Wallet" {...props}>
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
      <path d="M16 13h4" />
      <circle cx="16" cy="13" r=".5" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}


const DESIGN_WIDTH = 1790;
const DESIGN_HEIGHT = 1398;

const paymentRows = [
  {
    invoiceNo: "NGW/INV/26-27/034",
    stall: "9 Sqm Stall (Stall No. 139)",
    tag: "Advance",
    tagTone: "green",
    invoiceDate: "02 Jul 2026",
    invoiceAmount: "₹ 1,18,944",
    paidAmount: "₹ 1,18,944",
    paymentDate: "02 Jul 2026",
    mode: "NEFT",
    utr: "HDFC260704672981",
    status: "PAID",
    statusTone: "green",
    iconTone: "green",
  },
  {
    invoiceNo: "NGW/INV/26-27/041",
    stall: "18 Sqm Stall (Stall No. 91)",
    tag: "Part Payment",
    tagTone: "blue",
    invoiceDate: "01 Jul 2026",
    invoiceAmount: "₹ 2,27,183",
    paidAmount: "₹ 2,17,183",
    paymentDate: "01 Jul 2026",
    mode: "NEFT",
    utr: "HDFC010706392716",
    status: "PARTIALLY PAID",
    statusTone: "orange",
    iconTone: "blue",
    outstanding: "₹ 10,000",
    dueDate: "15 Jul 2026",
  },
  {
    invoiceNo: "NGW/INV/26-27/021",
    stall: "12 Sqm Stall (Stall No. 56)",
    tag: "Final Payment",
    tagTone: "blue",
    invoiceDate: "10 Jun 2026",
    invoiceAmount: "₹ 1,55,760",
    paidAmount: "₹ 1,55,760",
    paymentDate: "10 Jun 2026",
    mode: "RTGS",
    utr: "ICICN620106785432",
    status: "PAID",
    statusTone: "green",
    iconTone: "violet",
  },
  {
    invoiceNo: "NGW/INV/26-27/010",
    stall: "9 Sqm Stall (Stall No. 112)",
    tag: "Final Payment",
    tagTone: "green",
    invoiceDate: "28 May 2026",
    invoiceAmount: "₹ 1,18,944",
    paidAmount: "₹ 1,18,944",
    paymentDate: "28 May 2026",
    mode: "NEFT",
    utr: "SBIN525018934112",
    status: "PAID",
    statusTone: "green",
    iconTone: "green",
  },
  {
    invoiceNo: "NGW/INV/26-27/005",
    stall: "9 Sqm Stall (Stall No. 45)",
    tag: "Advance",
    tagTone: "green",
    invoiceDate: "12 May 2026",
    invoiceAmount: "₹ 1,18,944",
    paidAmount: "₹ 70,000",
    paymentDate: "12 May 2026",
    mode: "NEFT",
    utr: "HDFC120512445667",
    status: "PARTIALLY PAID",
    statusTone: "orange",
    iconTone: "orange",
  },
];

const summaryRows = [
  { label: "Invoice Value", value: "₹ 14,50,000", tone: "dark" },
  { label: "Total Paid", value: "₹ 12,45,000", tone: "green" },
  { label: "TDS Deducted", value: "₹ 35,000", tone: "blue" },
  { label: "Credit Notes", value: "₹ 15,000", tone: "violet" },
];


const fileToneClasses = {
  green: "bg-[#e7f7ee] text-[#07904a]",
  blue: "bg-[#e9f1ff] text-[#3979ef]",
  violet: "bg-[#f0e9ff] text-[#8351e7]",
  orange: "bg-[#fff0dd] text-[#ff7d13]",
};

const tagToneClasses = {
  green: "bg-[#dff4e6] text-[#187b42]",
  blue: "bg-[#e4efff] text-[#2562b6]",
};

const statusToneClasses = {
  green: "bg-[#e5f5eb] text-[#1a8649]",
  orange: "bg-[#fff0e2] text-[#ff6d13]",
};

const valueToneClasses = {
  dark: "text-[#101a35]",
  green: "text-[#087d3e]",
  blue: "text-[#2262d9]",
  orange: "text-[#ff6d15]",
  violet: "text-[#7734de]",
};

function useFitScale(containerRef) {
  const [layout, setLayout] = useState({
    scale: 1,
    canvasWidth: DESIGN_WIDTH,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let frameId = 0;

    const updateScale = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const widthScale = container.clientWidth / DESIGN_WIDTH;
        const heightScale = container.clientHeight / DESIGN_HEIGHT;
        const nextScale = Math.min(widthScale, heightScale);
        const safeScale =
          Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;

        setLayout({
          scale: safeScale,
          canvasWidth: Math.max(
            DESIGN_WIDTH,
            container.clientWidth / safeScale
          ),
        });
      });
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateScale);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [containerRef]);

  return layout;
}

function ManagerAvatar() {
  return (
    <svg
      className="h-[80px] w-[80px] shrink-0 rounded-full"
      viewBox="0 0 88 88"
      role="img"
      aria-label="Vansh Chaudhary"
    >
      <defs>
        <linearGradient id="avatarBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f1f4f7" />
          <stop offset="1" stopColor="#d9dee5" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="44" r="44" fill="url(#avatarBg)" />
      <path d="M19 88c1-20 11-31 25-31s24 11 25 31H19Z" fill="#191b1f" />
      <ellipse cx="44" cy="38" rx="17" ry="21" fill="#e7aa82" />
      <path
        d="M27 34c0-16 8-25 20-25 10 0 18 8 18 21-5-5-10-7-16-8-7-1-14 2-22 12Z"
        fill="#17191d"
      />
      <path
        d="M31 44c2 12 8 18 13 18s12-6 14-18c-4 4-9 6-14 6s-9-2-13-6Z"
        fill="#202126"
      />
      <ellipse cx="37.5" cy="37" rx="1.7" ry="1.5" fill="#232323" />
      <ellipse cx="50.5" cy="37" rx="1.7" ry="1.5" fill="#232323" />
      <path d="M39 45c3 2 7 2 10 0" fill="none" stroke="#8f4d3f" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 31c3-5 8-8 14-9M60 30c-3-5-8-8-14-9" fill="none" stroke="#17191d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ActionButton({ children, label }) {
  return (
    <button
      className="grid h-[31px] w-[31px] place-items-center rounded-[7px] border-0 bg-transparent p-0 text-[#14213d] transition-colors hover:bg-[#f2f5f8]"
      type="button"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function PaymentRow({ row }) {
  return (
    <>
      <tr>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] leading-[1.25] text-[#18233e]">
          <div className="flex items-center gap-[16px]">
            <span className={`grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full ${fileToneClasses[row.iconTone]}`}>
              <FileText size={25} strokeWidth={2.1} />
            </span>
            <div className="flex min-w-0 flex-col items-start">
              <strong className="whitespace-nowrap text-[15px] font-extrabold leading-[1.1] text-[#111c38]">{row.invoiceNo}</strong>
              <span className="mt-[7px] whitespace-nowrap text-[13px] font-semibold leading-none text-[#58657e]">{row.stall}</span>
              <em className={`mt-[7px] rounded-[4px] px-[8px] py-[4px] text-[12px] font-bold not-italic leading-none ${tagToneClasses[row.tagTone]}`}>
                {row.tag}
              </em>
            </div>
          </div>
        </td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] font-semibold leading-[1.25] text-[#5d6981]">{row.invoiceDate}</td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] font-extrabold leading-[1.25] text-[#17213c]">{row.invoiceAmount}</td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] font-extrabold leading-[1.25] text-[#128147]">{row.paidAmount}</td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] font-semibold leading-[1.25] text-[#5d6981]">{row.paymentDate}</td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] leading-[1.25] text-[#18233e]">
          <strong className="block text-[14px] font-bold leading-none text-[#39465f]">{row.mode}</strong>
          <span className="mt-[7px] block whitespace-nowrap text-[12px] font-semibold leading-none text-[#4a5872]">UTR: {row.utr}</span>
        </td>
        <td className="h-[102px] border-b border-r border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] leading-[1.25] text-[#18233e]">
          <span className={`inline-flex min-h-[32px] items-center justify-center whitespace-nowrap rounded-[10px] px-[14px] text-[12px] font-extrabold leading-none ${statusToneClasses[row.statusTone]}`}>
            {row.status}
          </span>
        </td>
        <td className="h-[102px] border-b border-[#e4e7eb] px-[12px] py-[8px] align-middle text-[14px] leading-[1.25] text-[#18233e]">
          <div className="flex items-center justify-center gap-[4px]">
            <ActionButton label="Download receipt">
              <Download size={20} strokeWidth={2} />
            </ActionButton>
            <ActionButton label="View invoice">
              <Eye size={20} strokeWidth={2} />
            </ActionButton>
            <ActionButton label="Open WhatsApp">
              <MessageCircle className="text-[#069247]" size={20} strokeWidth={2} />
            </ActionButton>
            <ActionButton label="More actions">
              <MoreVertical size={20} strokeWidth={2} />
            </ActionButton>
          </div>
        </td>
      </tr>

      {row.outstanding ? (
        <tr>
          <td colSpan={8} className="h-[83px] border-b border-[#e4e7eb] pb-[13px] pl-[271px] pr-[13px] pt-0 align-middle">
            <div className="grid h-[70px] grid-cols-[1.05fr_1fr_182px_203px] items-center gap-[20px] rounded-[9px] border border-[#f3d9c0] bg-gradient-to-r from-[#fffaf3] to-[#fffcf8] px-[20px]">
              <div className="flex h-[48px] flex-col justify-center">
                <span className="text-[13px] font-semibold leading-none text-[#606b80]">Outstanding Amount</span>
                <strong className="mt-[8px] text-[15px] font-extrabold leading-none text-[#17213b]">{row.outstanding}</strong>
              </div>
              <div className="flex h-[48px] flex-col justify-center border-l border-[#ecdac8] pl-[15px]">
                <span className="text-[13px] font-semibold leading-none text-[#606b80]">Due Date</span>
                <strong className="mt-[8px] text-[15px] font-extrabold leading-none text-[#17213b]">{row.dueDate}</strong>
              </div>
              <button
                className="flex h-[47px] items-center justify-center gap-[10px] rounded-[6px] border-[1.5px] border-[#ff9a5b] bg-white text-[14px] font-extrabold leading-none text-[#ff6d15]"
                type="button"
              >
                <span className="text-[21px] font-bold leading-none">₹</span>
                Collect Balance
              </button>
              <button
                className="flex h-[47px] items-center justify-center gap-[10px] rounded-[6px] border-[1.5px] border-[#5dbb83] bg-white text-[14px] font-extrabold leading-none text-[#128043]"
                type="button"
              >
                <Send size={20} strokeWidth={2} />
                Send Reminder
              </button>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

const Reminder = () => {
  const viewportRef = useRef(null);
  const { scale, canvasWidth } = useFitScale(viewportRef);

  const canvasStyle = useMemo(
    () => ({
      width: `${canvasWidth}px`,
      transform: `scale(${scale})`,
    }),
    [canvasWidth, scale]
  );

  const stageStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  return (
    <div
      ref={viewportRef}
      className="relative flex h-[calc(100dvh-74px)] min-h-0 w-full items-start justify-start overflow-hidden bg-[#eef2f6] text-[#101a35]"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="shrink-0" style={stageStyle}>
        <div
          className="h-[1398px] origin-top-left overflow-hidden border border-[#d9dde4] bg-[#fbfcfd] shadow-[0_8px_30px_rgba(27,38,62,0.08)]"
          style={canvasStyle}
        >
          <header className="flex h-[122px] items-center justify-between border-b border-[#dfe4ea] bg-white pl-[55px] pr-[54px]">
            <div>
              <h1 className="m-0 text-[34px] font-extrabold leading-[1.08] tracking-[-0.6px] text-[#06112e]">Payment Center</h1>
              <p className="mb-0 mt-[8px] text-[18px] font-medium leading-[1.2] text-[#66728b]">Track your payments &amp; download receipts</p>
            </div>

            <div className="flex h-full items-center gap-[30px]">
              <button className="relative grid h-[38px] w-[34px] place-items-center border-0 bg-transparent p-0 text-[#111b39]" type="button" aria-label="Notifications">
                <Bell size={29} strokeWidth={2} />
                <span className="absolute right-[-9px] top-[-1px] grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-white bg-[#f20c0c] text-[12px] font-extrabold leading-none text-white">2</span>
              </button>

              <button className="grid h-[38px] w-[34px] place-items-center border-0 bg-transparent p-0 text-[#111b39]" type="button" aria-label="Support">
                <Headphones size={30} strokeWidth={2} />
              </button>

              <span className="ml-[1px] h-[50px] w-px bg-[#dfe3e9]" />

              <div className="flex items-center gap-[14px]">
                <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#087f43] text-[19px] font-extrabold leading-none text-white">VP</div>
                <div>
                  <strong className="block text-[17px] font-extrabold uppercase leading-[1.1] text-[#111a34]">Velruma Pvt. Ltd.</strong>
                  <span className="mt-[8px] block text-[16px] font-medium leading-none text-[#5e6980]">Exhibitor</span>
                </div>
                <ChevronDown size={22} strokeWidth={2} color="#2d3852" />
              </div>
            </div>
          </header>

          <main className="grid h-[1276px] grid-cols-[minmax(0,1fr)_356px] gap-[27px] bg-[radial-gradient(circle_at_30%_0%,rgba(246,249,252,0.85),transparent_45%)] bg-[#fbfcfd] px-[27px] pb-[26px] pt-[25px]">
            <section className="grid min-w-0 grid-rows-[146px_260px_1fr] gap-[23px]">
              <div className="grid grid-cols-4 gap-[20px]">
                <article className="flex h-[146px] items-center gap-[21px] rounded-[14px] border border-[#e4e8ee] bg-white px-[25px] py-[23px] shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                  <div
                    className="grid h-[67px] w-[67px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0aa451] to-[#006d35] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                    data-icon-wrapper="Wallet"
                    title="Wallet icon"
                  >
                    <Wallet size={34} strokeWidth={2.1} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block whitespace-nowrap text-[17px] font-semibold leading-[1.2] text-[#62708b]">
                      Total Paid
                    </span>
                    <strong className="mt-[9px] block whitespace-nowrap text-[27px] font-extrabold leading-none tracking-[0.15px] text-[#0d1734]">
                      ₹ 12,45,000
                    </strong>
                    <small className="mt-[11px] block text-[16px] font-semibold leading-none text-[#536079]">
                      (8 Payments)
                    </small>
                  </div>
                </article>

                <article className="flex h-[146px] items-center gap-[21px] rounded-[14px] border border-[#e4e8ee] bg-white px-[25px] py-[23px] shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                  <div
                    className="grid h-[67px] w-[67px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff8a25] to-[#ff6410] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                    data-icon-wrapper="RupeeFile"
                    title="Rupee file icon"
                  >
                    <span
                      className="relative grid h-[38px] w-[38px] place-items-center"
                      data-icon-name="RupeeFile"
                      aria-label="Rupee file icon"
                    >
                      <FileText size={34} strokeWidth={1.9} />
                      <b className="absolute left-[11px] top-[10px] text-[14px] font-extrabold leading-none">
                        ₹
                      </b>
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block whitespace-nowrap text-[17px] font-semibold leading-[1.2] text-[#62708b]">
                      Total Outstanding
                    </span>
                    <strong className="mt-[9px] block whitespace-nowrap text-[27px] font-extrabold leading-none tracking-[0.15px] text-[#0d1734]">
                      ₹ 2,05,000
                    </strong>
                    <small className="mt-[11px] block text-[16px] font-semibold leading-none text-[#536079]">
                      (2 Invoices)
                    </small>
                  </div>
                </article>

                <article className="flex h-[146px] items-center gap-[21px] rounded-[14px] border border-[#e4e8ee] bg-white px-[25px] py-[23px] shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                  <div
                    className="grid h-[67px] w-[67px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9858e8] to-[#6f31d0] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                    data-icon-wrapper="Percent"
                    title="Percent icon"
                  >
                    <Percent size={37} strokeWidth={2.15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block whitespace-nowrap text-[17px] font-semibold leading-[1.2] text-[#62708b]">
                      Collection Progress
                    </span>
                    <strong className="mt-[9px] block whitespace-nowrap text-[27px] font-extrabold leading-none tracking-[0.15px] text-[#0d1734]">
                      85%
                    </strong>
                    <div className="mt-[18px] h-[9px] w-[175px] max-w-full overflow-hidden rounded-full bg-[#dfe3e8]">
                      <span className="block h-full w-[81%] rounded-full bg-[#037a3a]" />
                    </div>
                  </div>
                </article>

                <article className="flex h-[146px] items-center gap-[21px] rounded-[14px] border border-[#e4e8ee] bg-white px-[25px] py-[23px] shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                  <div
                    className="grid h-[67px] w-[67px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4d84f1] to-[#2862dd] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                    data-icon-wrapper="CalendarDays"
                    title="Calendar icon"
                  >
                    <CalendarDays size={34} strokeWidth={2.1} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block whitespace-nowrap text-[17px] font-semibold leading-[1.2] text-[#62708b]">
                      Last Payment
                    </span>
                    <strong className="mt-[9px] block whitespace-nowrap text-[27px] font-extrabold leading-none tracking-[0.15px] text-[#0d1734]">
                      ₹ 1,18,944
                    </strong>
                    <small className="mt-[11px] block text-[16px] font-semibold leading-none text-[#536079]">
                      02 Jul 2026
                    </small>
                  </div>
                </article>
              </div>

              <section className="rounded-[14px] border border-[#e4e8ee] bg-white px-[25px] pb-[18px] pt-[22px] shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                <h2 className="m-0 text-[18px] font-extrabold uppercase leading-none text-[#087a3b]">Your Payment Overview</h2>

                <div className="mt-[19px] h-[183px] rounded-[12px] border-[1.5px] border-[#b9dec9] bg-gradient-to-r from-[rgba(244,251,247,0.95)] to-[rgba(248,251,250,0.84)] px-[29px] pb-[18px] pt-[26px]">
                  <div className="grid h-[80px] grid-cols-4">
                    <div className="text-center">
                      <span className="block text-[16px] font-semibold leading-[1.1] text-[#4e5a70]">Invoice Value</span>
                      <strong className="mt-[12px] block whitespace-nowrap text-[25px] font-extrabold leading-none text-[#101a35]">₹ 14,50,000</strong>
                    </div>
                    <div className="border-l border-[#d1ddd7] text-center">
                      <span className="block text-[16px] font-semibold leading-[1.1] text-[#4e5a70]">Total Paid</span>
                      <strong className="mt-[12px] block whitespace-nowrap text-[25px] font-extrabold leading-none text-[#087d3e]">₹ 12,45,000</strong>
                    </div>
                    <div className="border-l border-[#d1ddd7] text-center">
                      <span className="block text-[16px] font-semibold leading-[1.1] text-[#4e5a70]">TDS Deducted</span>
                      <strong className="mt-[12px] block whitespace-nowrap text-[25px] font-extrabold leading-none text-[#2262d9]">₹ 35,000</strong>
                    </div>
                    <div className="border-l border-[#d1ddd7] text-center">
                      <span className="block text-[16px] font-semibold leading-[1.1] text-[#4e5a70]">Balance Outstanding</span>
                      <strong className="mt-[12px] block whitespace-nowrap text-[25px] font-extrabold leading-none text-[#ff6d15]">₹ 2,05,000</strong>
                    </div>
                  </div>

                  <div className="mt-[12px] h-[12px] overflow-hidden rounded-full bg-[#dfe3e7]">
                    <div className="h-full w-[77%] rounded-full bg-gradient-to-r from-[#0c9148] to-[#04783a]" />
                  </div>

                  <div className="mt-[16px] flex items-center justify-between text-[15px] font-bold leading-none text-[#455168]">
                    <span>0%</span>
                    <span>85% Paid</span>
                    <span>100%</span>
                  </div>
                </div>
              </section>

              <section className="min-h-0 overflow-hidden rounded-[14px] border border-[#e4e8ee] bg-white shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                <div className="flex h-[65px] items-center justify-between border-b border-[#edf0f3] px-[25px]">
                  <h2 className="m-0 text-[18px] font-extrabold uppercase leading-none text-[#087a3b]">Payment History</h2>

                  <div className="flex items-center gap-[17px]">
                    <button className="flex h-[41px] w-[164px] items-center justify-between rounded-[8px] border border-[#dce2e8] bg-white px-[15px] text-[14px] font-semibold leading-none text-[#5c6880] shadow-[0_1px_4px_rgba(25,35,55,0.03)]" type="button">
                      <span>All Invoices</span>
                      <ChevronDown size={18} strokeWidth={2} />
                    </button>

                    <label className="flex h-[41px] w-[300px] items-center gap-[10px] rounded-[8px] border border-[#dce2e8] bg-white pl-[16px] pr-[13px] text-[14px] font-semibold leading-none text-[#5c6880] shadow-[0_1px_4px_rgba(25,35,55,0.03)]">
                      <input
                        className="min-w-0 flex-1 border-0 bg-transparent [font:inherit] text-[#59657e] outline-none placeholder:text-[#7c879b] placeholder:opacity-100"
                        type="text"
                        placeholder="Search invoice / receipt..."
                      />
                      <Search size={21} strokeWidth={2} />
                    </label>
                  </div>
                </div>

                <div className="h-[calc(100%-65px)] overflow-hidden px-[12px]">
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col className="w-[270px]" />
                      <col className="w-[132px]" />
                      <col className="w-[142px]" />
                      <col className="w-[141px]" />
                      <col className="w-[141px]" />
                      <col className="w-[200px]" />
                      <col className="w-[148px]" />
                      <col className="w-[132px]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white pl-[74px] pr-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Invoice No.</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Invoice Date</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Invoice Amount</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Paid Amount</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Payment Date</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Payment Mode</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Status</th>
                        <th className="h-[52px] border-b border-[#dfe4e9] bg-white px-[12px] text-left text-[14px] font-extrabold leading-none text-[#2d3851]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRows.map((row) => (
                        <PaymentRow row={row} key={row.invoiceNo} />
                      ))}
                    </tbody>
                  </table>

                  <button className="mx-auto flex h-[44px] items-center justify-center gap-[14px] border-0 bg-transparent text-[16px] font-bold leading-none text-[#0c7b3d]" type="button">
                    View All Payments
                    <ArrowRight size={22} strokeWidth={2} />
                  </button>
                </div>
              </section>
            </section>

            <aside className="grid min-w-0 grid-rows-[431px_372px_1fr] gap-[22px]">
              <section className="rounded-[14px] border border-[#e4e8ee] bg-white shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                <h2 className="m-0 flex h-[64px] items-center bg-gradient-to-r from-[#eff9f3] to-[#edf8f1] px-[28px] text-[18px] font-extrabold uppercase leading-none text-[#08763a]">Payment Summary</h2>
                <div className="px-[27px] pt-[4px]">
                  {summaryRows.map((row) => (
                    <div className="flex h-[57px] items-center justify-between border-b border-[#e5e8ec]" key={row.label}>
                      <span className="text-[16px] font-semibold leading-none text-[#5d6982]">{row.label}</span>
                      <strong className={`text-[16px] font-extrabold leading-none ${valueToneClasses[row.tone]}`}>{row.value}</strong>
                    </div>
                  ))}

                  <div className="mt-[12px] border-t border-dashed border-[#cfd6df] pt-[17px]">
                    <span className="block text-[16px] font-extrabold leading-none text-[#ff5925]">Balance Outstanding</span>
                    <strong className="mt-[17px] block text-right text-[28px] font-extrabold leading-none text-[#f42d18]">₹ 2,05,000</strong>
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-[#e4e8ee] bg-white shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                <h2 className="m-0 flex h-[64px] items-center bg-gradient-to-r from-[#eff9f3] to-[#edf8f1] px-[28px] text-[18px] font-extrabold uppercase leading-none text-[#08763a]">Your Relationship Manager</h2>
                <div className="px-[26px] pb-[24px] pt-[21px]">
                  <div className="flex items-center gap-[17px]">
                    <ManagerAvatar />
                    <div>
                      <strong className="block text-[17px] font-extrabold leading-[1.1] text-[#141f3b]">Vansh Chaudhary</strong>
                      <span className="mt-[9px] block text-[14px] font-semibold leading-none text-[#59667e]">Finance Executive</span>
                    </div>
                  </div>

                  <div className="mt-[23px] grid gap-[21px]">
                    <div className="flex items-center gap-[16px] text-[15px] font-semibold leading-none text-[#59657b]">
                      <Phone size={21} strokeWidth={2} />
                      <span>09568259784</span>
                    </div>
                    <div className="flex items-center gap-[16px] text-[15px] font-semibold leading-none text-[#59657b]">
                      <Mail size={21} strokeWidth={2} />
                      <span>vansh.chaudhary@ihwe.in</span>
                    </div>
                  </div>

                  <div className="mt-[27px] grid grid-cols-2 gap-[18px]">
                    <button className="flex h-[51px] items-center justify-center gap-[10px] rounded-[6px] border-[1.5px] border-[#58b77d] bg-white text-[15px] font-extrabold leading-none text-[#107c3d]" type="button">
                      <MessageCircle size={22} strokeWidth={2} />
                      WhatsApp
                    </button>
                    <button className="flex h-[51px] items-center justify-center gap-[10px] rounded-[6px] border-[1.5px] border-[#6f9af3] bg-white text-[15px] font-extrabold leading-none text-[#2769ed]" type="button">
                      <Phone size={22} strokeWidth={2} />
                      Call
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-[#e4e8ee] bg-white shadow-[0_3px_11px_rgba(36,47,69,0.055)]">
                <h2 className="m-0 flex h-[62px] items-center border-b border-[#e4e7eb] bg-gradient-to-r from-[#f6f8fc] to-[#f3f5f9] px-[28px] text-[18px] font-extrabold uppercase leading-none text-[#16203b]">Need Help?</h2>
                <div className="px-[24px] pt-[20px]">
                  <div className="mb-[20px] flex items-center gap-[17px]">
                    <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-[#ebf2ff] text-[#3a75ef]">
                      <MessageCircle size={25} strokeWidth={2} />
                    </span>
                    <div>
                      <strong className="block text-[15px] font-extrabold leading-none text-[#26324d]">Live Chat Support</strong>
                      <span className="mt-[9px] block text-[14px] font-medium leading-none text-[#5f6b83]">Chat with our team</span>
                    </div>
                  </div>

                  <div className="mb-[20px] flex items-center gap-[17px]">
                    <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-[#ebf2ff] text-[#3a75ef]">
                      <Ticket size={25} strokeWidth={2} />
                    </span>
                    <div>
                      <strong className="block text-[15px] font-extrabold leading-none text-[#26324d]">Raise a Ticket</strong>
                      <span className="mt-[9px] block text-[14px] font-medium leading-none text-[#5f6b83]">Get assistance</span>
                    </div>
                  </div>

                  <div className="mb-[20px] flex items-center gap-[17px]">
                    <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-[#ebf2ff] text-[#3a75ef]">
                      <Mail size={25} strokeWidth={2} />
                    </span>
                    <div>
                      <strong className="block text-[15px] font-extrabold leading-none text-[#26324d]">Accounts Support</strong>
                      <span className="mt-[9px] block text-[14px] font-medium leading-none text-[#5f6b83]">accounts@ihwe.in</span>
                    </div>
                  </div>

                  <div className="mx-[-24px] mt-[8px] flex h-[57px] items-center border-t border-[#e5e8ed] px-[24px] text-[13px] font-medium leading-none text-[#556177]">
                    <strong className="mr-[7px] font-extrabold text-[#27324a]">Support Hours:</strong>
                    09:00 AM - 07:00 PM (IST)
                  </div>
                </div>
              </section>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Reminder;