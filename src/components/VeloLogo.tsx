import React from "react";

export function VeloLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="velo-circuit-mask">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <g stroke="black" strokeWidth="1.5" fill="black">
            {/* Trace 1 */}
            <path d="M 36 46 L 39 52 L 43 52 L 47 60" fill="none" strokeLinejoin="round" />
            <circle cx="36" cy="46" r="1.5" />
            <circle cx="47" cy="60" r="1.5" />
            
            {/* Trace 2 */}
            <path d="M 45 64 L 47 68 L 50 68 L 53 74" fill="none" strokeLinejoin="round" />
            <circle cx="45" cy="64" r="1.5" />
            <circle cx="53" cy="74" r="1.5" />
          </g>
        </mask>
      </defs>
      
      <g mask="url(#velo-circuit-mask)" fill="currentColor">
        {/* Main V/G Body */}
        <path d="M 55 88 L 85 28 L 50 28 L 55 38 L 70 38 L 65 48 L 58 48 L 53 58 L 60 58 L 55 68 L 40 38 L 30 38 Z" />
        
        {/* Pixels */}
        <rect x="30" y="30" width="5" height="5" />
        <rect x="23" y="32" width="4" height="4" />
        <rect x="35" y="23" width="6" height="6" />
        <rect x="27" y="19" width="5" height="5" />
        <rect x="19" y="23" width="4" height="4" />
        <rect x="15" y="31" width="3" height="3" />
        <rect x="31" y="11" width="4" height="4" />
        <rect x="41" y="17" width="3" height="3" />
      </g>
    </svg>
  );
}
