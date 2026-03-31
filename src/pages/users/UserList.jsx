// import React, { useEffect } from "react";
// import { Trash2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUsers, deleteUser } from "../../features/auth/userSlice";
// import { showError, showSuccess } from "../../utils/toastMessage";
// import { BiEdit } from "react-icons/bi";

// const UserList = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { users, loading, error } = useSelector((state) => state.users);

//   // ✅ Fetch users on mount
//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const handleEdit = (userId) => {
//     const userToEdit = users.find((u) => u._id === userId);
//     navigate("/ihweClientData2026/adduser", {
//       state: { user: userToEdit, isEdit: true },
//     });
//   };

//   const handleDelete = (userId, userName) => {
//     dispatch(deleteUser(userId))
//       .unwrap()
//       .then(() => showSuccess("User deleted successfully!"))
//       .catch((err) => showError("Failed to delete user: " + err));
//   };

//   if (loading) return <div className="p-5 text-center">Loading...</div>;
//   if (error) return <div className="p-5 text-red-500 text-center">{error}</div>;

//   return (
//     <div
//       className="w-full min-h-screen bg-[#f5f5f5]"
//       style={{ marginTop: "30px" }}
//     >
//       <div className="flex justify-between items-center py-2 px-6 w-full bg-white border-b border-gray-200">
//         <div className="flex items-center justify-between  ">
//           <h1 className="text-xl font-normal text-gray-600">USERS</h1>
//         </div>
//         <div>
//           <button
//             onClick={() => navigate("/ihweClientData2026/adduser")}
//             className="rounded h-auto w-auto border border-[#ccc] text-[13px] font-normal bg-white hover:bg-[#ccc] px-[10px] py-[4px]  text-center truncate sm:w-auto cursor-pointer"
//           >
//             Add User
//           </button>
//         </div>
//       </div>

//       <div className="mx-5 mt-5 bg-white border border-[#3598dc]">
//         <div className="px-2.5 py-1.5 text-white bg-[#3598dc]">
//           <h2 className="text-lg font-semibold">USERS LIST</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50 border-b-2 border-gray-300">
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   No.
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-left border-r border-gray-300">
//                   Full Name
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   Designation
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   Username
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   Mobile
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   Type
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center border-r border-gray-300">
//                   Status
//                 </th>
//                 <th className="px-4 py-2 text-sm font-semibold text-center">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((user, index) => (
//                 <tr
//                   key={user._id}
//                   className={`border-b border-gray-200 ${
//                     index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                   }`}
//                 >
//                   <td className="px-4 py-1 text-sm text-center border-r border-gray-200">
//                     {index + 1}
//                   </td>
//                   <td className="px-4 py-1 text-sm border-r border-gray-200 text-[#337ab7] hover:text-[#1c4971] cursor-pointer hover:underline">
//                     {user.user_fullname}
//                   </td>
//                   <td className="px-4 py-1 text-sm border-r border-gray-200 text-center">
//                     {user.user_designation}
//                   </td>
//                   <td className="px-4 py-1 text-sm border-r border-gray-200 text-center">
//                     {user.user_name}
//                   </td>
//                   <td className="px-4 py-1 text-sm border-r border-gray-200 text-center">
//                     {user.user_mobile}
//                   </td>
//                   <td className="px-4 py-1 text-sm text-center border-r border-gray-200">
//                     {user.user_role}
//                   </td>
//                   <td className="px-4 py-1 text-center border-r border-gray-200">
//                     <span
//                       className={`inline-block px-2 py-1 text-xs text-white  ${
//                         user.user_status === "Active"
//                           ? "bg-teal-400"
//                           : "bg-red-500"
//                       }`}
//                     >
//                       {user.user_status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-1 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <button
//                         onClick={() => handleEdit(user._id)}
//                         className="px-1.5 py-1 border border-[#3598dc] text-[#3598dc] bg-white "
//                         title="Edit"
//                       >
//                         <BiEdit size={14} />
//                       </button>
//                       <button
//                         onClick={() =>
//                           handleDelete(user._id, user.user_fullname)
//                         }
//                         className="px-1.5 py-1 border border-red-500 text-red-500 bg-white "
//                         title="Delete"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserList;
import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../features/auth/userSlice";
import { showError, showSuccess } from "../../utils/toastMessage";
import { BiEdit } from "react-icons/bi";

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleEdit = (userId) => {
    const userToEdit = users.find((u) => u._id === userId);
    navigate("/ihweClientData2026/adduser", {
      state: { user: userToEdit, isEdit: true },
    });
  };

  const handleDelete = (userId, userName) => {
    dispatch(deleteUser(userId))
      .unwrap()
      .then(() => showSuccess("User deleted successfully!"))
      .catch((err) => showError("Failed to delete user: " + err));
  };

  if (loading)
    return <div className="p-5 text-center text-base">Loading...</div>;
  if (error)
    return (
      <div className="p-5 text-red-500 text-center text-base">{error}</div>
    );

  return (
    <div
      className="w-full min-h-screen bg-[#f5f5f5]"
      style={{ marginTop: "30px" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center py-3 px-6 w-full bg-white border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-600">USERS</h1>
        <button
          onClick={() => navigate("/ihweClientData2026/adduser")}
          className="rounded-md border border-gray-300 text-sm font-medium bg-white hover:bg-gray-100 px-4 py-2 text-center cursor-pointer"
        >
          Add User
        </button>
      </div>

      {/* Table Container */}
      <div className="mx-5 mt-5 bg-white border border-[#3598dc] rounded-md overflow-hidden">
        <div className="px-5 py-2 text-white bg-[#3598dc]">
          <h2 className="text-lg font-semibold">USERS LIST</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-300">
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  No.
                </th>
                <th className="px-5 py-3 text-base font-semibold text-left border-r border-gray-300">
                  Full Name
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  Designation
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  Username
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  Mobile
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  Type
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center border-r border-gray-300">
                  Status
                </th>
                <th className="px-5 py-3 text-base font-semibold text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-5 py-3 text-base text-center border-r border-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3 text-base border-r border-gray-200 text-[#337ab7] hover:text-[#1c4971] cursor-pointer hover:underline">
                    {user.user_fullname}
                  </td>
                  <td className="px-5 py-3 text-base border-r border-gray-200 text-center">
                    {user.user_designation || "—"}
                  </td>
                  <td className="px-5 py-3 text-base border-r border-gray-200 text-center">
                    {user.user_name}
                  </td>
                  <td className="px-5 py-3 text-base border-r border-gray-200 text-center">
                    {user.user_mobile}
                  </td>
                  <td className="px-5 py-3 text-base text-center border-r border-gray-200">
                    {user.user_role}
                  </td>
                  <td className="px-5 py-3 text-center border-r border-gray-200">
                    <span
                      className={`inline-block px-3 py-1 text-sm text-white rounded ${
                        user.user_status === "Active"
                          ? "bg-teal-500"
                          : "bg-red-500"
                      }`}
                    >
                      {user.user_status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="p-2 border border-[#3598dc] text-[#3598dc] bg-white rounded-md hover:bg-[#3598dc]/10"
                        title="Edit"
                      >
                        <BiEdit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(user._id, user.user_fullname)
                        }
                        className="p-2 border border-red-500 text-red-500 bg-white rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
