import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, LogOut, User as UserIcon, Heart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/common/Logo";

export default function Topbar({ items = [] }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-200 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-4 sm:px-6">

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden flex items-center">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="h-16 flex items-center px-6 border-b border-neutral-100">
                            <Logo />
                        </div>
                        <div className="py-6 px-4 space-y-1">
                            {items.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={index}
                                        to={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                    >
                                        <Icon className="w-5 h-5 text-neutral-400" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
                {/* Logo on mobile only if needed, otherwise hidden */}
                <div className="lg:hidden">
                    <Logo showText={false} />
                </div>
            </div>

            {/* Left side (Page Title or Breadcrumbs - generic for now) */}
            <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-neutral-800">
                    Welcome back, {user?.fullName?.split(" ")[0]}!
                </h1>
            </div>

            {/* Right side (Actions) */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-500 hover:bg-red-50 relative" onClick={() => navigate('/user/favorites')}>
                    <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary-600 hover:bg-primary-50 relative">
                    <Bell className="w-5 h-5" />
                    {/* Notification dot placeholder */}
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
                                    alt={user?.fullName || 'User'}
                                />
                                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                                <p className="text-xs leading-none text-neutral-500">{user?.email}</p>
                                <p className="text-xs leading-none text-primary-600 font-medium mt-1 uppercase">{user?.role}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to={`/${user?.role?.toLowerCase()}/settings`} className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile & Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
