import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/common/Logo";
import { LogOut } from "lucide-react";

export default function Sidebar({ items = [] }) {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-screen fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-100">
                <Link to="/">
                    <Logo />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    // Check if current path starts with item.href (for active state consistency with nested routes)
                    // Or exact match for dashboard
                    const isActive = location.pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/doctor/dashboard" && item.href !== "/user/dashboard" && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={index}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? "bg-primary-50 text-primary-600 shadow-sm"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }
                            `}
                        >
                            <Icon
                                className={`w-5 h-5 transition-colors
                                    ${isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"}
                                `}
                            />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            {/* User Info / Footer */}
            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
                <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-center text-neutral-400">© 2026 PetEase</p>
                </div>
            </div>
        </aside>
    );
}
