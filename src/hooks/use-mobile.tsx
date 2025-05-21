import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Ensure window is defined (runs only on client)
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const updateMobileState = () => {
      setIsMobile(mql.matches);
    };

    // Set initial state based on current media query
    updateMobileState();

    // Add listener for changes
    mql.addEventListener("change", updateMobileState);

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", updateMobileState);
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  return isMobile; // Returns boolean | undefined
}
