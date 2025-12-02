'use client';

import Script from 'next/script';

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export function GoogleTagManager() {
  if (!GTM_ID && !GA_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js */}
      {GA_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
      )}

      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            function checkPrivacyAndLoadGTM() {
              const gpcCookie = document.cookie.split('; ').find(row => row.startsWith('gpc-signal='));
              const dntCookie = document.cookie.split('; ').find(row => row.startsWith('dnt-signal='));
              const gpcEnabled = gpcCookie?.split('=')[1] === '1';
              const dntEnabled = dntCookie?.split('=')[1] === '1';
              const navigatorGPC = navigator.globalPrivacyControl === true;
              const navigatorDNT = navigator.doNotTrack === '1';
              
              if (gpcEnabled || dntEnabled || navigatorGPC || navigatorDNT) {
                return;
              }
              
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            }
            
            checkPrivacyAndLoadGTM();
          `,
        }}
      />

      {/* Global gtag function - Minimal initialization to avoid blocking */}
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Defer config to next tick to avoid blocking
            setTimeout(function() {
              const gpcCookie = document.cookie.split('; ').find(row => row.startsWith('gpc-signal='));
              const dntCookie = document.cookie.split('; ').find(row => row.startsWith('dnt-signal='));
              const gpcEnabled = gpcCookie?.split('=')[1] === '1' || navigator.globalPrivacyControl === true;
              const dntEnabled = dntCookie?.split('=')[1] === '1' || navigator.doNotTrack === '1';
              
              if (!gpcEnabled && !dntEnabled) {
                ${
                  GA_ID
                    ? `gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: gpcEnabled || dntEnabled,
                  allow_ad_personalization_signals: !gpcEnabled,
                  allow_google_signals: !gpcEnabled,
                });`
                    : ''
                }
                
                ${
                  GTM_ID
                    ? `gtag('config', '${GTM_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: gpcEnabled || dntEnabled,
                  allow_ad_personalization_signals: !gpcEnabled,
                  allow_google_signals: !gpcEnabled,
                });`
                    : ''
                }
              }
            }, 0);
          `,
        }}
      />
    </>
  );
}
