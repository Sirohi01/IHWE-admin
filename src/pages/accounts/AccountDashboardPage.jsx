import { useEffect, useState } from "react";
import AccountDashboard from "../dashboard/AccountDashboard";

export default function AccountDashboardPage() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) {
            try { setCurrentUser(JSON.parse(info)); }
            catch (e) { console.error("Error parsing adminInfo", e); }
        }
    }, []);

    return <AccountDashboard currentUser={currentUser} />;
}
