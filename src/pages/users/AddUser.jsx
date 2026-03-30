// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { createUser, updateUser } from "../../features/auth/userSlice";
// import { showError, showSuccess } from "../../utils/toastMessage";

// const AddUser = () => {
//   const dispatch = useDispatch();
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const isEdit = state?.isEdit || false;
//   const userToEdit = state?.user || null;

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     mobileNo: "",
//     email: "",
//     username: "",
//     password: "",
//     confirmPassword: "",
//     designation: "",
//     department: "",
//     role: "",
//     status: "Active",
//   });

//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [passwordStrength, setPasswordStrength] = useState(0);

//   useEffect(() => {
//     if (isEdit && userToEdit) {
//       const fullName = userToEdit.fullName || userToEdit.user_fullname || "";
//       const nameParts = fullName.split(" ");

//       setFormData({
//         firstName: nameParts[0] || "",
//         lastName: nameParts[1] || "",
//         mobileNo: userToEdit.mobile || userToEdit.user_mobile || "",
//         email: userToEdit.email || userToEdit.user_email || "",
//         username: userToEdit.username || userToEdit.user_name || "",
//         password: "",
//         confirmPassword: "",
//         designation:
//           userToEdit.designation || userToEdit.user_designation || "",
//         department: userToEdit.department || userToEdit.user_dept || "",
//         role: userToEdit.role || userToEdit.user_role || "User",
//         status: userToEdit.status || userToEdit.user_status || "Active",
//       });
//     }
//   }, [isEdit, userToEdit]);

//   // Password strength calculator
//   const calculatePasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength++;
//     if (password.length >= 12) strength++;
//     if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
//     if (/\d/.test(password)) strength++;
//     if (/[!@#$%^&*]/.test(password)) strength++;
//     return Math.min(strength, 4);
//   };

//   const designations = [
//     "Sr. Interior Designer",
//     "Interior Designer",
//     "Sr. Accountant",
//     "Accountants",
//     "Marketing Executive",
//     "Brand Manager",
//     "Project Manager",
//     "Marketing Manager",
//     "Production Manager",
//     "Managing Director",
//     "Tele Marketing Executive",
//     "Account & Finance Head",
//     "IT Admin",
//     "GM Sales",
//     "Director",
//     "Head Media and Communication",
//   ];

//   const departments = [
//     "Production",
//     "Design Studio",
//     "Marketing",
//     "Accounts",
//     "Projects",
//     "Sales",
//     "IT",
//   ];

//   const roles = ["SuperAdmin", "Admin", "Accountant", "User"];

//   // Field validation
//   const validateField = (name, value) => {
//     const newErrors = { ...errors };

//     switch (name) {
//       case "firstName":
//       case "lastName":
//         if (!value.trim()) {
//           newErrors[name] = "This field is required";
//         } else {
//           delete newErrors[name];
//         }
//         break;
//       case "email":
//         if (
//           value &&
//           !value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
//         ) {
//           newErrors[name] = "Please enter a valid email";
//         } else {
//           delete newErrors[name];
//         }
//         break;
//       case "mobileNo":
//         if (value && value.length !== 10) {
//           newErrors[name] = "Mobile number must be 10 digits";
//         } else {
//           delete newErrors[name];
//         }
//         break;
//       case "username":
//         if (!value.trim()) {
//           newErrors[name] = "Username is required";
//         } else if (value.length < 3) {
//           newErrors[name] = "Username must be at least 3 characters";
//         } else {
//           delete newErrors[name];
//         }
//         break;
//       case "password":
//         if (!isEdit && !value) {
//           newErrors[name] = "Password is required for new users";
//         } else {
//           delete newErrors[name];
//         }
//         break;
//       default:
//         break;
//     }

//     setErrors(newErrors);
//     return newErrors;
//   };

//   // ✅ Updated handleChange with 10-digit mobile number logic
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Allow only digits and max 10 for mobile number
//     if (name === "mobileNo") {
//       const numericValue = value.replace(/\D/g, "").slice(0, 10);
//       setFormData((prev) => ({ ...prev, [name]: numericValue }));
//       if (touched[name]) validateField(name, numericValue);
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (touched[name]) validateField(name, value);
//     }

//     // Calculate password strength
//     if (name === "password") {
//       setPasswordStrength(calculatePasswordStrength(value));
//     }
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     setTouched((prev) => ({ ...prev, [name]: true }));
//     validateField(name, value);
//   };

//   const handleCancelClick = () => {
//     navigate("/ihweClientData2026/userlist");
//   };

//   const handleAddUser = async () => {
//     // Validate all required fields
//     const newErrors = {};

//     if (!formData.firstName.trim())
//       newErrors.firstName = "First name is required";
//     if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
//     if (!formData.username.trim()) newErrors.username = "Username is required";
//     if (!formData.mobileNo) newErrors.mobileNo = "Mobile number is required";
//     if (formData.mobileNo && formData.mobileNo.length !== 10) {
//       newErrors.mobileNo = "Mobile number must be 10 digits";
//     }
//     if (
//       formData.email &&
//       !formData.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
//     ) {
//       newErrors.email = "Please enter a valid email";
//     }

//     if (!isEdit && !formData.password) {
//       newErrors.password = "Password is required for new users";
//     }

//     if (formData.password && formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       showError("Please fix all errors before submitting");
//       return;
//     }

//     const userPayload = {
//       user_name: formData.username,
//       user_password: formData.password || undefined,
//       user_email: formData.email,
//       user_mobile: formData.mobileNo,
//       user_fullname: `${formData.firstName} ${formData.lastName}`,
//       user_role: formData.role || "User",
//       user_designation: formData.designation,
//       user_dept: formData.department,
//       user_status: formData.status,
//       user_expo_category: "General",
//       user_last_login: new Date(),
//       user_added: new Date(),
//     };

//     try {
//       if (isEdit) {
//         await dispatch(
//           updateUser({ id: userToEdit._id, updates: userPayload }),
//         ).unwrap();
//         showSuccess("User updated successfully!");
//       } else {
//         await dispatch(createUser(userPayload)).unwrap();
//         showSuccess("User added successfully!");
//       }
//       navigate("/ihweClientData2026/adduser");
//     } catch (error) {
//       console.error("Error saving user:", error);
//       showError(`Error: ${error.message || "Something went wrong"}`);
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     if (passwordStrength === 0) return "bg-red-500";
//     if (passwordStrength === 1) return "bg-orange-500";
//     if (passwordStrength === 2) return "bg-yellow-500";
//     if (passwordStrength === 3) return "bg-lime-500";
//     return "bg-green-500";
//   };

//   const getPasswordStrengthText = () => {
//     if (passwordStrength === 0) return "Weak";
//     if (passwordStrength === 1) return "Fair";
//     if (passwordStrength === 2) return "Good";
//     if (passwordStrength === 3) return "Strong";
//     return "Very Strong";
//   };

//   return (
//     <div
//       className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen"
//       style={{ marginTop: "30px" }}
//     >
//       {/* Header */}
//       <div className="bg-white shadow-md border-b-2 border-[#3598dc] py-2.5">
//         <div className="flex flex-row justify-between items-center   px-4 max-w-7xl mx-auto">
//           <div>
//             <h1 className="text-base font-bold text-[#3598dc]">
//               {isEdit
//                 ? "✏️ Edit User Information"
//                 : "➕ Create New User Account"}
//             </h1>
//             <p className="text-sm text-gray-600 mt-0.5">
//               {isEdit
//                 ? "Update user details and permissions"
//                 : "Add a new team member to the system"}
//             </p>
//           </div>
//           <div>
//             <button
//               onClick={handleCancelClick}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-sm text-sm font-medium cursor-pointer"
//             >
//               Users List
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Form Container */}
//       <div className=" max-w-6xl mx-auto px-3 py-3">
//         <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#3598dc] overflow-hidden">
//           {/* Form Header */}
//           <div className="bg-gradient-to-r from-[#3598dc] to-[#1c7ed6] px-4 py-2.5">
//             <h2 className="text-sm font-bold text-white">
//               {isEdit ? "Edit User Details" : "User Information Form"}
//             </h2>
//           </div>

//           {/* Form Content */}
//           <div className=" p-4">
//             <div className="grid grid-cols-3 gap-6">
//               {/* Row 1: Names */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   First Name <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="John"
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.firstName && errors.firstName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                   required
//                 />
//                 {touched.firstName && errors.firstName && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.firstName}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Last Name <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="Doe"
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.lastName && errors.lastName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                   required
//                 />
//                 {touched.lastName && errors.lastName && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.lastName}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Email <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="john@company.com"
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.email && errors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                 />
//                 {touched.email && errors.email && (
//                   <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Mobile <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="mobileNo"
//                   value={formData.mobileNo}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="9876543210"
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.mobileNo && errors.mobileNo ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                   required
//                 />
//                 {touched.mobileNo && errors.mobileNo && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.mobileNo}
//                   </p>
//                 )}
//               </div>

//               {/* Row 2: Credentials */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Username <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="johndoe123"
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.username && errors.username ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                   required
//                 />
//                 {touched.username && errors.username && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.username}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Password {!isEdit && <span className="text-red-600">*</span>}
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder={isEdit ? "Leave blank" : "Password"}
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.password && errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                 />
//                 {touched.password && errors.password && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.password}
//                   </p>
//                 )}
//                 {formData.password && (
//                   <div className="mt-1">
//                     <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full ${getPasswordStrengthColor()} transition-all`}
//                         style={{ width: `${(passwordStrength / 4) * 100}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-xs text-gray-600">
//                       {getPasswordStrengthText()}
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Confirm {!isEdit && <span className="text-red-600">*</span>}
//                 </label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder={isEdit ? "Leave blank" : "Confirm"}
//                   className={`w-full px-2.5 py-1.5 text-xs border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${touched.confirmPassword && errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300"}`}
//                 />
//                 {touched.confirmPassword && errors.confirmPassword && (
//                   <p className="text-xs text-red-600 mt-0.5">
//                     {errors.confirmPassword}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Designation
//                 </label>
//                 <select
//                   name="designation"
//                   value={formData.designation}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   className="w-full px-2.5 py-1.5 text-xs border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
//                 >
//                   <option value="">Select</option>
//                   {designations.map((des, idx) => (
//                     <option key={idx} value={des}>
//                       {des}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Row 3: Org Details */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Department
//                 </label>
//                 <select
//                   name="department"
//                   value={formData.department}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   className="w-full px-2.5 py-1.5 text-xs border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
//                 >
//                   <option value="">Select</option>
//                   {departments.map((dept, idx) => (
//                     <option key={idx} value={dept}>
//                       {dept}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Role
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   className="w-full px-2.5 py-1.5 text-xs border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
//                 >
//                   <option value="">Select</option>
//                   {roles.map((role, idx) => (
//                     <option key={idx} value={role}>
//                       {role}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Status
//                 </label>
//                 <div className="flex gap-2 mt-1.5">
//                   <label className="flex items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="status"
//                       value="Active"
//                       checked={formData.status === "Active"}
//                       onChange={handleChange}
//                       className="w-3 h-3 text-green-600"
//                     />
//                     <span className="text-xs ml-1.5 text-gray-700">Active</span>
//                   </label>
//                   <label className="flex items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="status"
//                       value="Inactive"
//                       checked={formData.status === "Inactive"}
//                       onChange={handleChange}
//                       className="w-3 h-3 text-red-600"
//                     />
//                     <span className="text-xs ml-1.5 text-gray-700">
//                       Inactive
//                     </span>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
//               <button
//                 onClick={handleCancelClick}
//                 className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddUser}
//                 className="px-4 py-1.5 text-sm font-medium text-white bg-[#3598dc] hover:bg-[#1c7ed6] rounded-md transition shadow-md"
//               >
//                 {isEdit ? "💾 Update User" : "➕ Add User"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddUser;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUser, updateUser } from "../../features/auth/userSlice";
import { showError, showSuccess } from "../../utils/toastMessage";

const AddUser = () => {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const navigate = useNavigate();

  const isEdit = state?.isEdit || false;
  const userToEdit = state?.user || null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    designation: "",
    department: "",
    role: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isEdit && userToEdit) {
      const fullName = userToEdit.fullName || userToEdit.user_fullname || "";
      const nameParts = fullName.split(" ");

      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts[1] || "",
        mobileNo: userToEdit.mobile || userToEdit.user_mobile || "",
        email: userToEdit.email || userToEdit.user_email || "",
        username: userToEdit.username || userToEdit.user_name || "",
        password: "",
        confirmPassword: "",
        designation:
          userToEdit.designation || userToEdit.user_designation || "",
        department: userToEdit.department || userToEdit.user_dept || "",
        role: userToEdit.role || userToEdit.user_role || "User",
        status: userToEdit.status || userToEdit.user_status || "Active",
      });
    }
  }, [isEdit, userToEdit]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const designations = [
    "Sr. Interior Designer",
    "Interior Designer",
    "Sr. Accountant",
    "Accountants",
    "Marketing Executive",
    "Brand Manager",
    "Project Manager",
    "Marketing Manager",
    "Production Manager",
    "Managing Director",
    "Tele Marketing Executive",
    "Account & Finance Head",
    "IT Admin",
    "GM Sales",
    "Director",
    "Head Media and Communication",
  ];

  const departments = [
    "Production",
    "Design Studio",
    "Marketing",
    "Accounts",
    "Projects",
    "Sales",
    "IT",
  ];

  const roles = ["SuperAdmin", "Admin", "Accountant", "User"];

  // Field validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) {
          newErrors[name] = "This field is required";
        } else {
          delete newErrors[name];
        }
        break;
      case "email":
        if (
          value &&
          !value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        ) {
          newErrors[name] = "Please enter a valid email";
        } else {
          delete newErrors[name];
        }
        break;
      case "mobileNo":
        if (value && value.length !== 10) {
          newErrors[name] = "Mobile number must be 10 digits";
        } else {
          delete newErrors[name];
        }
        break;
      case "username":
        if (!value.trim()) {
          newErrors[name] = "Username is required";
        } else if (value.length < 3) {
          newErrors[name] = "Username must be at least 3 characters";
        } else {
          delete newErrors[name];
        }
        break;
      case "password":
        if (!isEdit && !value) {
          newErrors[name] = "Password is required for new users";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  // handleChange with 10-digit mobile number logic
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobileNo") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      if (touched[name]) validateField(name, numericValue);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) validateField(name, value);
    }

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleCancelClick = () => {
    navigate("/ihweClientData2026/userlist");
  };

  const handleAddUser = async () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.mobileNo) newErrors.mobileNo = "Mobile number is required";
    if (formData.mobileNo && formData.mobileNo.length !== 10) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }
    if (
      formData.email &&
      !formData.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      newErrors.email = "Please enter a valid email";
    }

    if (!isEdit && !formData.password) {
      newErrors.password = "Password is required for new users";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError("Please fix all errors before submitting");
      return;
    }

    const userPayload = {
      user_name: formData.username,
      user_password: formData.password || undefined,
      user_email: formData.email,
      user_mobile: formData.mobileNo,
      user_fullname: `${formData.firstName} ${formData.lastName}`,
      user_role: formData.role || "User",
      user_designation: formData.designation,
      user_dept: formData.department,
      user_status: formData.status,
      user_expo_category: "General",
      user_last_login: new Date(),
      user_added: new Date(),
    };

    try {
      if (isEdit) {
        await dispatch(
          updateUser({ id: userToEdit._id, updates: userPayload }),
        ).unwrap();
        showSuccess("User updated successfully!");
      } else {
        await dispatch(createUser(userPayload)).unwrap();
        showSuccess("User added successfully!");
      }
      navigate("/ihweClientData2026/adduser");
    } catch (error) {
      console.error("Error saving user:", error);
      showError(`Error: ${error.message || "Something went wrong"}`);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500";
    if (passwordStrength === 1) return "bg-orange-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-lime-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Weak";
    if (passwordStrength === 1) return "Fair";
    if (passwordStrength === 2) return "Good";
    if (passwordStrength === 3) return "Strong";
    return "Very Strong";
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen"
      style={{ marginTop: "30px" }}
    >
      {/* Header */}
      <div className="bg-white shadow-md border-b-2 border-[#3598dc] py-3">
        <div className="flex flex-row justify-between items-center px-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-[#3598dc]">
              {isEdit
                ? "✏️ Edit User Information"
                : "➕ Create New User Account"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEdit
                ? "Update user details and permissions"
                : "Add a new team member to the system"}
            </p>
          </div>
          <div>
            <button
              onClick={handleCancelClick}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              Users List
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#3598dc] overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#3598dc] to-[#1c7ed6] px-6 py-3">
            <h2 className="text-lg font-bold text-white">
              {isEdit ? "Edit User Details" : "User Information Form"}
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Row 1: Names */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.firstName && errors.firstName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  required
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.lastName && errors.lastName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  required
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john@company.com"
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.email && errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Mobile <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.mobileNo && errors.mobileNo
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  required
                />
                {touched.mobileNo && errors.mobileNo && (
                  <p className="text-sm text-red-600 mt-1">{errors.mobileNo}</p>
                )}
              </div>

              {/* Row 2: Credentials */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Username <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="johndoe123"
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.username && errors.username
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  required
                />
                {touched.username && errors.username && (
                  <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Password {!isEdit && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={isEdit ? "Leave blank" : "Password"}
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.password && errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {touched.password && errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Confirm {!isEdit && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={isEdit ? "Leave blank" : "Confirm"}
                  className={`w-full px-4 py-2 text-base border-2 rounded-md focus:outline-none focus:border-blue-500 transition ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
                >
                  <option value="">Select</option>
                  {designations.map((des, idx) => (
                    <option key={idx} value={des}>
                      {des}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Org Details */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
                >
                  <option value="">Select</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white"
                >
                  <option value="">Select</option>
                  {roles.map((role, idx) => (
                    <option key={idx} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Status
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-base ml-2 text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-base ml-2 text-gray-700">
                      Inactive
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelClick}
                className="px-6 py-2 text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-6 py-2 text-base font-medium text-white bg-[#3598dc] hover:bg-[#1c7ed6] rounded-md transition shadow-md"
              >
                {isEdit ? "💾 Update User" : "➕ Add User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
