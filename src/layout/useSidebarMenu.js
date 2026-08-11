import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { menuItems } from "../data/menuItems";
import api from "../lib/api";
import { fetchEvents } from "../features/crmEvent/crmEventSlice";
import { CalendarClock } from "lucide-react";

export function useSidebarMenu() {
  const dispatch = useDispatch();
  const crmEvents = useSelector((state) => state.crmEvents?.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const [currentUser, setCurrentUser] = useState(null);
  const [logo, setLogo] = useState("");
  const [fullProfile, setFullProfile] = useState(null);
  const [actualLeaderboard, setActualLeaderboard] = useState([]);
  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (info) {
      setCurrentUser(JSON.parse(info));
    }
  }, []);

  useEffect(() => {
    api.get("/api/settings")
      .then(res => {
        if (res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(err => console.error("Error fetching sidebar settings:", err));
  }, []);

  useEffect(() => {
    if (currentUser?.username) {
      api.get("/api/admin/all")
        .then(res => {
          if (res.data.success) {
            const match = res.data.data.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
            if (match) setFullProfile(match);
          }
        })
        .catch(err => console.error("Error fetching full admin profile:", err));

      api.get("/api/companies/leaderboard")
        .then(res => {
          if (res.data.success) setActualLeaderboard(res.data.leaderboard || []);
        })
        .catch(err => console.error("Error fetching admin leaderboard:", err));
    }
  }, [currentUser]);

  const myRank = useMemo(() => {
    if (!currentUser || actualLeaderboard.length === 0) return null;
    const idx = actualLeaderboard.findIndex(s => s.username === currentUser.username.toLowerCase());
    return idx >= 0 ? idx + 1 : null;
  }, [currentUser, actualLeaderboard]);

  useEffect(() => {
    if (currentUser?.role) {
      api.get("/api/roles")
        .then(res => {
          if (res.data.success) {
            const role = res.data.data.find(r => r.name.toLowerCase() === currentUser.role.toLowerCase());
            if (role) setRoleData(role);
          }
        })
        .catch(err => console.error("Error fetching permissions:", err));
    }
  }, [currentUser]);

  const groupedMenuItems = useMemo(() => {
    if (!currentUser) return [];

    const perms = roleData?.permissions || {};
    const roleSlug = currentUser.role.toLowerCase().replace(/[^a-z]/g, '');
    const isSuperAdmin = roleSlug === 'superadmin' || roleSlug === 'ihwesuperadministrator';

    const results = [];
    let currentSection = null;

    menuItems.forEach((item) => {
      if (item.type === "heading") {
        currentSection = { ...item, type: "section", children: [] };
        results.push(currentSection);
      } else {
        let isVisible = false;
        let visibleChildren = item.children;

        if (isSuperAdmin) {
          isVisible = true;
          visibleChildren = item.children;
        } else {
          if (item.type === "item") {
            isVisible = perms[item.label] === true || (item.label === "Exhibitor Registration" && perms["Book A Stand"] === true);
          } else if (item.type === "dropdown") {
            visibleChildren = item.children?.filter(child => perms[child.label] === true || (child.label === "Exhibitor Registration" && perms["Book A Stand"] === true));
            isVisible = visibleChildren && visibleChildren.length > 0;
          }
        }

        if (isVisible) {
          const finalItem = { ...item, children: visibleChildren };
          if (currentSection) {
            currentSection.children.push(finalItem);
          } else {
            results.push(finalItem);
          }
        }
      }
    });

    const dynamicEventItems = (crmEvents || [])
      .filter((ev) => ev.event_name || ev.event_fullName)
      .filter((ev) => isSuperAdmin || perms[ev.event_fullName || ev.event_name] === true)
      .slice()
      .sort((a, b) => new Date(b.event_fromDate || 0) - new Date(a.event_fromDate || 0))
      .map((ev) => ({
        type: "dropdown",
        label: ev.event_fullName || ev.event_name,
        icon: CalendarClock,
        children: [
          { label: "Sales Tools", path: `/crm-event/${ev._id}/sales-tools` },
          { label: "New Leads", path: `/crm-event/${ev._id}/new-leads` },
          { label: "Follow-Ups", path: `/crm-event/${ev._id}/follow-ups` },
          { label: "Hot Leads", path: `/crm-event/${ev._id}/hot-leads` },
          { label: "Proposal Sent", path: `/crm-event/${ev._id}/proposal-sent` },
          { label: "Bookings", path: `/crm-event/${ev._id}/bookings` },
          { label: "Lost Leads", path: `/crm-event/${ev._id}/lost-leads` },
          { label: "Converted Leads", path: `/crm-event/${ev._id}/converted-leads` },
          { label: "All Leads", path: `/crm-event/${ev._id}/all-leads` },
          { label: "Referral Leads", path: `/crm-event/${ev._id}/referral-leads` },
          // { label: "Payment Mail", path: `/crm-event/${ev._id}/payment-mail` },
          // { label: "Send Mail", path: `/crm-event/${ev._id}/send-mail` },
        ],
      }));

    if (dynamicEventItems.length > 0) {
      const salesCrmSection = results.find((r) => r.type === "section" && r.label === "Sales CRM");
      if (salesCrmSection) {
        const masterDataIdx = salesCrmSection.children.findIndex((c) => c.label === "Expo Master Data");
        const insertAt = masterDataIdx >= 0 ? masterDataIdx : salesCrmSection.children.length;
        salesCrmSection.children.splice(insertAt, 0, ...dynamicEventItems);
      }
    }

    return results.filter(item => item.type !== "section" || item.children.length > 0);
  }, [currentUser, roleData, crmEvents]);

  return {
    currentUser,
    logo,
    fullProfile,
    myRank,
    groupedMenuItems
  };
}
