import { LayoutDashboard, Users, UserPlus, Stethoscope, ShoppingBag, Heart, FileText, Settings, Calendar, ClipboardList, Package, Star, Search, MessageSquare } from "lucide-react";

export const adminNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { title: "Products", icon: Package, href: "/admin/products" },
    { title: "Doctors", icon: Stethoscope, href: "/admin/doctors" },
    { title: "Users", icon: Users, href: "/admin/users" },
    { title: "Settings", icon: Settings, href: "/admin/settings" },
];


export const doctorNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/doctor/dashboard" },
    { title: "Appointments", icon: Calendar, href: "/doctor/schedule" }, // Also fixing URL mismatch for appointments
    { title: "Patients", icon: Users, href: "/doctor/patients" },
    { title: "Messages", icon: MessageSquare, href: "/doctor/messages" },
    { title: "Settings", icon: Settings, href: "/doctor/settings" },
];

export const userNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
    { title: "Find Pets", icon: Search, href: "/user/adoption" },
    { title: "Find Vets", icon: Stethoscope, href: "/user/doctors" },
    { title: "Appointments", icon: Calendar, href: "/user/appointments" },
    { title: "Messages", icon: MessageSquare, href: "/user/messages" },
    { title: "Applications", icon: FileText, href: "/user/requests" },
    { title: "Shop", icon: ShoppingBag, href: "/user/shop" },
    { title: "My Orders", icon: Package, href: "/user/orders" },
    { title: "Settings", icon: Settings, href: "/user/settings" },
];

export const getNavItems = (role) => {
    switch (role) {
        case "ADMIN":
            return adminNav;
        case "DOCTOR":
            return doctorNav;
        case "USER":
            return userNav;
        default:
            return [];
    }
};
