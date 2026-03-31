// utils/toastMessage.js
import { toast } from "react-toastify";

export const showSuccess = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 2000,
    });
};

export const showError = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 2000,
    });
};

export const showInfo = (message) => {
    toast.info(message, {
        position: "top-right",
        autoClose: 2000,
    });
};

export const showWarning = (message) => {
    toast.warn(message, {
        position: "top-right",
        autoClose: 2000,
    });
};
