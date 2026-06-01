const Footer = ({ darkMode }) => (
  <footer
    className={`w-full border-t transition-colors duration-300 ${darkMode
      ? "bg-black border-gray-800"
      : "bg-black border-[#E0D6C8]"
      }`}
  >
    <div className="px-6 md:px-10 py-2 flex flex-col md:flex-row items-center justify-between gap-3">

      {/* COPYRIGHT */}
      <p
        className={`text-[10px]  font-bold uppercase tracking-widest ${darkMode ? "text-white" : "text-white"
          }`}
      >
        © 2026 International Health & Wellness Expo. |<span> An Intellectual Property of Namo Gange Wellness Pvt. Ltd. All Rights Reserved Worldwide.</span></p>
    </div>
  </footer >
);

export default Footer;