import React from "react";

interface FnbLogoProps {
  className?: string;
  light?: boolean; // For dark background like footer
}

export const FnbLogo: React.FC<FnbLogoProps> = ({ className = "h-11 sm:h-12 md:h-14 lg:h-16 w-auto", light = false }) => {
  if (light) {
    return (
      <div className={`inline-flex items-center justify-center select-none rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-xs transition-all hover:bg-white ${className}`}>
        <img
          src="/fnb-logo.svg"
          alt="FNB Furniture N Beyond Logo"
          className="h-full w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/fnb-logo.svg"
        alt="FNB Furniture N Beyond Logo"
        className="h-full w-auto max-w-full object-contain"
      />
    </div>
  );
};

export default FnbLogo;

