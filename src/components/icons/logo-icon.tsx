
import type { SVGProps } from 'react';

// Stylized Tree Icon inspired by the provided image
export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5" // Adjusted stroke width for a potentially more detailed look
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Trunk */}
      <path d="M12 22V10" />
      {/* Main Branches */}
      <path d="M12 10L7 15" />
      <path d="M12 10L17 15" />
      {/* Secondary Branch details */}
      <path d="M7 15L5 17" />
      <path d="M17 15L19 17" />
      {/* Canopy - using a series of arcs or simple shapes to suggest a full, rounded crown */}
      {/* This is a simplified representation for an icon */}
      <path d="M12 3a4 4 0 0 0-4 4c0 2 1 3 3 3.5V10h2v.5c2-.5 3-1.5 3-3.5a4 4 0 0 0-4-4z" />
      <path d="M9.5 6.5a2.5 2.5 0 0 0-2.5 2.5c0 1 .5 1.5 1.5 2" />
      <path d="M14.5 6.5a2.5 2.5 0 0 1 2.5 2.5c0 1-.5 1.5-1.5 2" />
    </svg>
  );
}
