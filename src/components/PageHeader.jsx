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
    <div className="mb-2 px-4 border-b-2 border-[#23471d]/60">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left Content */}
        <div>
          <h1 className="text-2xl font-semibold text-[#23471d] uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <div className="text-gray-600 font-medium text-[13px]">
              {description}
            </div>
          )}
        </div>

        {/* Action Button or Children */}
        <div className="flex flex-wrap items-center gap-3">
          {buttonText && buttonPath && (
            <button
              onClick={() => navigate(buttonPath)}
              className="group flex items-center gap-2
        bg-[#23471d] text-white
        px-5 py-2.5 rounded-lg
        text-xs font-semibold uppercase tracking-widest
        hover:bg-[#23471d]/90
        transition-colors duration-200
        active:scale-95"
            >
              {ButtonIcon && (
                <ButtonIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
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