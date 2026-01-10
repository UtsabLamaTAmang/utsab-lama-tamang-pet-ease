import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/context/AuthContext";
import { getNavItems } from "@/config/navigation";

export default function DashboardLayout() {
    const { user } = useAuth();
    const navItems = getNavItems(user?.role);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar items={navItems} />
            <Topbar items={navItems} />

            {/* Main Content Area */}
            <main className="lg:ml-64 pt-16 min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8  mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
