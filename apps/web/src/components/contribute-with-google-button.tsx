'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Contribute with Google button component
 * This button triggers the Google Publisher Center contribution pop-up
 * The swg-basic.js script (loaded via GoogleNewsletterCta) automatically styles and activates this button
 *
 * Note: Renders only on client to avoid hydration mismatches with the custom attribute
 */
export const ContributeWithGoogleButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (buttonRef.current) {
      // Set the custom attribute that Google's SwG library recognizes
      buttonRef.current.setAttribute('swg-standard-button', 'contribution');
    }
  }, []);

  // Don't render on server to avoid hydration mismatch
  // The attribute is set via setAttribute which only happens on client
  if (!isClient) {
    return null;
  }

  return (
    <button ref={buttonRef} className="swg-standard-button" aria-label="Contribute with Google" />
  );
};
