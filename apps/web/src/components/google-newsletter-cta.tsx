'use client';

import Script from 'next/script';

export const GoogleNewsletterCta = () => {
  return (
    <div>
      {/* Load SwG script with lazy strategy to avoid blocking initial page load */}
      <Script
        async
        type="application/javascript"
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="lazyOnload"
      />
      <Script
        id="google-newsletter-cta"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
        (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
          basicSubscriptions.init({
            type: "NewsArticle",
            isPartOfType: ["Product"],
            isPartOfProductId: "CAowyZ7eCw:openaccess",
            clientOptions: { theme: "light", lang: "en" },
          });
        });
        `,
        }}
      />
    </div>
  );
};
