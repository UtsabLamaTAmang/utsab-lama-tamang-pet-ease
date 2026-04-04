import { LayoutDashboard, Users, UserPlus, Stethoscope, ShoppingBag, Heart, FileText, Settings, Calendar, ClipboardList, Package, Star, Search, MessageSquare, Clock, Shield, AlertTriangle, Award, MapPin } from "lucide-react";

export const adminNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { title: "Products", icon: Package, href: "/admin/products" },
    { title: "Doctors", icon: Stethoscope, href: "/admin/doctors" },
    { title: "Rescuers", icon: Users, href: "/admin/users" },
    { title: "Campaigns", icon: Heart, href: "/admin/campaigns" },
];


export const doctorNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/doctor/dashboard" },
    { title: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    // { title: "Schedule", icon: Clock, href: "/doctor/schedule" },
    { title: "Patients", icon: Users, href: "/doctor/patients" },
    { title: "Messages", icon: MessageSquare, href: "/doctor/messages" },
];

export const userNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
    { title: "Find Pets", icon: Search, href: "/user/adoption" },
    { title: "Find Vets", icon: Stethoscope, href: "/user/doctors" },
    { title: "Appointments", icon: Calendar, href: "/user/appointments" },
    { title: "Pet Rescue", icon: AlertTriangle, href: "/user/rescue" },
    { title: "Messages", icon: MessageSquare, href: "/user/messages" },
    { title: "Applications", icon: FileText, href: "/user/requests" },
    { title: "Shop", icon: ShoppingBag, href: "/user/shop" },
    { title: "My Orders", icon: Package, href: "/user/orders" },
    { title: "Events & Campaigns", icon: Heart, href: "/user/campaigns" },
];

export const rescuerNav = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/rescuer/dashboard" },
    { title: "Available Rescues", icon: MapPin, href: "/rescuer/available" },
    { title: "My Missions", icon: Shield, href: "/rescuer/missions" },
    { title: "Badges", icon: Award, href: "/rescuer/badges" },
];

export const getNavItems = (role) => {
    switch (role) {
        case "ADMIN":
            return adminNav;
        case "DOCTOR":
            return doctorNav;
        case "RESCUER":
            return rescuerNav;
        case "USER":
            return userNav;
        default:
            return [];
    }
};
