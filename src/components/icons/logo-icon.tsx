import type { SVGProps } from 'react';

// Simplified Tree Icon for Medibot
export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22V8" />
      <path d="M12 8L6 14" />
      <path d="M12 8L18 14" />
      <path d="M6 14H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2" />
      <path d="M18 14H20c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2" />
    </svg>
  );
}
