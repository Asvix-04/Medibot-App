
import Image from 'next/image';
import type { SVGProps } from 'react'; // Keep for props compatibility if needed, though many won't apply

// Props for next/image might differ, but we can keep a similar signature for now.
// Width and height are required for next/image unless 'fill' is used.
// The className will be passed to the underlying <img> tag via next/image.
interface LogoIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  width?: number;
  height?: number;
  alt?: string;
}

export function LogoIcon({ 
  className, 
  width = 32, // Default width, adjust as needed
  height = 32, // Default height, adjust as needed
  alt = "Medibot Logo",
  ...props 
}: LogoIconProps) {
  // Assuming the logo file is named 'medibot-logo.png' and is in the 'public' folder
  // If your logo file has a different name or path, update it here.
  // The props passed (like stroke, fill, etc.) won't apply to next/image directly but are kept for signature compatibility
  // if this component was used with SVG-specific props elsewhere, though it's better to remove them if not used.
  return (
    <Image
      src="/medibot-logo.png" // Path relative to the 'public' directory
      alt={alt}
      width={width}
      height={height}
      className={className}
      // You can add other next/image props here if needed, e.g., priority, quality
      // {...props} // Spreading remaining SVG props might not be ideal here.
      // Only spread props relevant to next/image or the underlying <img> tag if necessary.
    />
  );
}
