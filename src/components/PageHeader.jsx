import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonPath,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 border-b-2 border-[#23471d]/20 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left Content */}
        <div>
          <h1 className="text-3xl font-black text-[#23471d] uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Action Button or Children */}
        <div className="flex items-center gap-3">
          {buttonText && buttonPath && (
            <button
              onClick={() => navigate(buttonPath)}
              className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-sm hover:bg-gray-900 transition uppercase tracking-wider text-sm font-bold"
            >
              {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
              {buttonText}
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;