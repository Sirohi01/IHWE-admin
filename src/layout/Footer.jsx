const Footer = ({ darkMode }) => (
  <footer
    className={`w-full border-t transition-colors duration-300 ${
      darkMode
        ? "bg-white border-gray-800"
        : "bg-white border-[#E0D6C8]"
    }`}
  >
    <div className="px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">

      {/* COPYRIGHT */}
      <p
        className={`text-sm md:text-base font-bold uppercase tracking-widest ${
          darkMode ? "text-gray-400" : "text-gray-700"
        }`}
      >
        © 2026 IHWE |<span className="text-[#d26019]">Property of Namo Gange Wellness Pvt. Ltd.</span>. All rights reserved. 
      </p>
    </div>
  </footer>
);

export default Footer;