export const FOOD_COUPON_LOGO_STORAGE_KEY = "ihwe_food_coupon_logo";
export const FOOD_COUPON_LOGO_NAME_STORAGE_KEY = "ihwe_food_coupon_logo_name";
export const DEFAULT_FOOD_COUPON_LOGO_NAME = "Default Namo Gange logo";

export const getStoredFoodCouponLogo = () => {
  if (typeof window === "undefined") {
    return { logoSrc: "", logoName: DEFAULT_FOOD_COUPON_LOGO_NAME };
  }

  try {
    return {
      logoSrc: window.localStorage.getItem(FOOD_COUPON_LOGO_STORAGE_KEY) || "",
      logoName: window.localStorage.getItem(FOOD_COUPON_LOGO_NAME_STORAGE_KEY) || DEFAULT_FOOD_COUPON_LOGO_NAME,
    };
  } catch {
    return { logoSrc: "", logoName: DEFAULT_FOOD_COUPON_LOGO_NAME };
  }
};
