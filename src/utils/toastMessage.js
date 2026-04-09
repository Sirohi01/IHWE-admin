// utils/toastMessage.js
import Swal from "sweetalert2";

export const showSuccess = (message) => {
    Swal.fire({
        title: "Success!",
        text: message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#23471d",
    });
};

export const showError = (message) => {
    Swal.fire({
        title: "Error!",
        text: message,
        icon: "error",
        confirmButtonColor: "#23471d",
    });
};

export const showInfo = (message) => {
    Swal.fire({
        title: "Info",
        text: message,
        icon: "info",
        confirmButtonColor: "#23471d",
    });
};

export const showWarning = (message) => {
    Swal.fire({
        title: "Warning!",
        text: message,
        icon: "warning",
        confirmButtonColor: "#23471d",
    });
};
