
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8", variant = 'color', showText = true }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-enem-blue';
  const iconMainColor = variant === 'white' ? '#FFFFFF' : '#004aad'; // Blue
  const iconAccentColor = '#ffce00'; // Yellow (Always yellow for brand identity, or white if needed)

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square"
      >
        {/* Background Shape (Soft Rounded Square) - Optional, removed for cleaner look or kept as container */}
        {/* Book Base (The bottom curve of S) */}
        <path
          d="M20 65C20 65 35 75 50 65C65 55 80 65 80 65V85C80 85 65 75 50 85C35 95 20 85 20 85V65Z"
          fill={iconMainColor}
        />
        <path
          d="M50 65V85C35 95 20 85 20 85V65C20 65 35 75 50 65Z"
          fillOpacity="0.8"
          fill={iconMainColor}
        />
        
        {/* Graduation Cap (The top part of S) */}
        <path
          d="M10 40L50 20L90 40L50 60L10 40Z"
          fill={iconMainColor}
        />
        
        {/* Tassel (The Accent) */}
        <circle cx="50" cy="40" r="4" fill={iconAccentColor} />
        <path
          d="M90 40V55"
          stroke={iconAccentColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="90" cy="58" r="4" fill={iconAccentColor} />

        {/* Spark/Knowledge Symbol */}
        <path
          d="M75 15L78 22L85 25L78 28L75 35L72 28L65 25L72 22L75 15Z"
          fill={iconAccentColor}
        />
      </svg>

      {/* Text Brand */}
      {showText && (
        <div className={`flex flex-col justify-center leading-none ${textColor}`}>
          <span className="font-extrabold text-[1.25em] tracking-tight">Studr</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
