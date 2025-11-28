'use client';

import { useEffect, useRef } from 'react';

/**
 * Contribute with Google button component
 * This button triggers the Google Publisher Center contribution pop-up
 * The swg-basic.js script (loaded via GoogleNewsletterCta) automatically styles and activates this button
 */
export const ContributeWithGoogleButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      // Set the custom attribute that Google's SwG library recognizes
      buttonRef.current.setAttribute('swg-standard-button', 'contribution');
    }
  }, []);

  return (
    <button ref={buttonRef} className="swg-standard-button" aria-label="Contribute with Google" />
  );
};
