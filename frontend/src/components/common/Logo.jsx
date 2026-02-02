import React from "react";
import { PawPrint } from "lucide-react";

export default function Logo({ size = "default", showText = true, className = "" }) {
    const sizeClasses = {
        small: "w-6 h-6",
        default: "w-8 h-8",
        large: "w-10 h-10",
    };

    const textSizeClasses = {
        small: "text-lg",
        default: "text-xl",
        large: "text-2xl",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`relative flex items-center justify-center rounded-xl bg-primary-600 ${sizeClasses[size]}`}>
                <PawPrint className="w-1/2 h-1/2 text-white fill-current" />
            </div>
            {showText && (
                <span className={`font-bold tracking-tight text-neutral-900 ${textSizeClasses[size]}`}>
                    Pet<span className="text-primary-600">Ease</span>
                </span>
            )}
        </div>
    );
}
