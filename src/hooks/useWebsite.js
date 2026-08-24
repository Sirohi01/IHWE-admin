import { useLocation } from "react-router-dom";

const WEBSITE_MAIN = "9th IHWE";
const WEBSITE_ORGANIC = "organicexpo";

export const useWebsite = () => {
  const { pathname } = useLocation();
  const isOrganic = pathname.startsWith("/organic-");
  return {
    website: isOrganic ? WEBSITE_ORGANIC : WEBSITE_MAIN,
    isOrganic,
  };
};
