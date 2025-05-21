
// Using a simplified SVG representation of a tree.
// You can replace this with your own SVG or Next/Image component if you have a specific logo file.
interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  // You can add specific props for the logo if needed in the future
}

export function LogoIcon({ className, ...props }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor" // Use currentColor to inherit color from parent
      {...props}
    >
      {/* Trunk and lower branches */}
      <path d="M50 90 V60 M50 60 L35 45 M50 60 L65 45" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {/* Main leafy crown */}
      <path d="M50,15 C30,15 20,30 20,45 C20,60 30,75 50,75 C70,75 80,60 80,45 C80,30 70,15 50,15 Z" />
      {/* Smaller leafy details to suggest a fuller tree */}
      <circle cx="35" cy="35" r="12" />
      <circle cx="65" cy="35" r="12" />
      <circle cx="50" cy="25" r="10" />
    </svg>
  );
}
