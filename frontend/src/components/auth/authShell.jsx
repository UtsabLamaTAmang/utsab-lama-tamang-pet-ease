import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

export default function AuthShell({
  title,
  description,
  eyebrow,
  alternatePrompt,
  alternateLinkText,
  alternateLinkTo,
  children,
  footer,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8f3ef_0%,#f6f2ee_48%,#fbf8f5_100%)] px-6 py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[10%] h-64 w-64 rounded-full bg-[#f2cfc4]/25 blur-3xl" />
        <div className="absolute right-[-6%] top-[18%] h-72 w-72 rounded-full bg-[#d9d1ff]/35 blur-3xl" />
        <div className="absolute bottom-[-5%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1600px] items-center justify-center">
        <div className="relative w-full max-w-[26rem] pt-[4.1rem] sm:max-w-[28rem] sm:pt-[4.5rem] lg:max-w-[30rem] lg:pt-[4.8rem]">
          <img
            src="/images/pets.png"
            alt="Pets peeking over the form"
            className="pointer-events-none absolute left-1/2 top-0 z-30 w-[18.5rem] -translate-x-1/2 -translate-y-[25%] sm:w-[20rem] lg:w-[22rem]"
            style={{
              clipPath: "inset(18% 0 24% 0)",
              filter: "drop-shadow(0 20px 30px rgba(31, 24, 18, 0.18))",
            }}
          />

          <div className="relative rounded-[2rem] border border-white/70 bg-white/92 px-7 pb-8 pt-16 shadow-[0_25px_80px_rgba(94,72,48,0.14)] backdrop-blur-xl sm:px-8 sm:pt-[4.5rem] lg:px-9 lg:pt-[4.8rem]">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Logo size="small" className="mb-4" />
                {eyebrow && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
                    {eyebrow}
                  </p>
                )}
                <h1 className="text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-neutral-900 lg:text-[2.35rem]">
                  {title}
                </h1>
                <p className="mt-3 max-w-[22rem] text-sm leading-6 text-neutral-500">
                  {description}
                </p>
              </div>

              {alternatePrompt && alternateLinkTo && alternateLinkText && (
                <div className="pt-1 text-right text-xs leading-5 text-neutral-400">
                  <p>{alternatePrompt}</p>
                  <Link
                    to={alternateLinkTo}
                    className="font-medium text-primary-500 transition-colors hover:text-primary-700"
                  >
                    {alternateLinkText}
                  </Link>
                </div>
              )}
            </div>

            {children}

            {footer ? (
              <div className="mt-8 border-t border-neutral-100 pt-5">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
