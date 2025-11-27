import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - OunceTracker',
  description: 'OunceTracker Privacy Policy - How we collect, use, and protect your information',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 2025';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                OunceTracker (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
                protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit our website ouncetracker.com (the
                &quot;Service&quot;). Please read this privacy policy carefully. If you do not agree
                with the terms of this privacy policy, please do not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We may collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Use our Service to compare prices</li>
                <li>Contact us for support or inquiries</li>
                <li>Subscribe to newsletters or updates (if applicable)</li>
                <li>Participate in surveys or feedback forms</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                When you access the Service, we may automatically collect certain information about
                your device and usage patterns, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Device identifiers</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>
                  <strong>Service Operation:</strong> To provide, maintain, and improve our price
                  comparison service
                </li>
                <li>
                  <strong>Analytics:</strong> To analyze usage patterns and improve user experience
                </li>
                <li>
                  <strong>Communication:</strong> To respond to your inquiries and provide customer
                  support
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with applicable laws, regulations,
                  and legal processes
                </li>
                <li>
                  <strong>Security:</strong> To detect, prevent, and address technical issues,
                  fraud, or security threats
                </li>
                <li>
                  <strong>Personalization:</strong> To customize your experience and provide
                  relevant content
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to track activity on our Service
                and hold certain information. Cookies are files with a small amount of data which
                may include an anonymous unique identifier. You can instruct your browser to refuse
                all cookies or to indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our Service.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>
                  <strong>Essential Cookies:</strong> Required for the Service to function properly
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors interact with
                  our Service
                </li>
                <li>
                  <strong>Performance Cookies:</strong> Collect information about how you use our
                  Service
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We may use third-party services to help us operate our Service and administer
                activities on our behalf, such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Hosting and cloud service providers</li>
                <li>Content delivery networks</li>
                <li>Database and infrastructure services</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                These third parties may have access to your information only to perform these tasks
                on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the Internet or electronic
                storage is 100% secure. While we strive to use commercially acceptable means to
                protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We will retain your information only for as long as is necessary for the purposes
                set out in this Privacy Policy, unless a longer retention period is required or
                permitted by law. We will delete or anonymize your information when it is no longer
                needed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Depending on your location, you may have certain rights regarding your personal
                information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>
                  <strong>Access:</strong> Request access to your personal information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your personal information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of processing your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your personal information
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent where processing is based on
                  consent
                </li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                To exercise these rights, please contact us using the information provided in the
                Contact Us section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Our Service is not intended for children under the age of 13 (or the applicable age
                of majority in your jurisdiction). We do not knowingly collect personal information
                from children. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Your information may be transferred to and maintained on computers located outside
                of your state, province, country, or other governmental jurisdiction where data
                protection laws may differ. By using our Service, you consent to the transfer of
                your information to facilities located outside your jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. California Privacy Rights</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If you are a California resident, you have additional rights under the California
                Consumer Privacy Act (CCPA), including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>The right to know what personal information is collected</li>
                <li>The right to know whether personal information is sold or disclosed</li>
                <li>The right to opt-out of the sale of personal information</li>
                <li>The right to access your personal information</li>
                <li>The right to request deletion of personal information</li>
                <li>The right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We do not sell your personal information. To exercise your California privacy
                rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. European Privacy Rights (GDPR)</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If you are located in the European Economic Area (EEA), you have certain rights
                under the General Data Protection Regulation (GDPR), including those listed in
                Section 8. We process your personal information based on the following legal bases:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Your consent</li>
                <li>Performance of a contract</li>
                <li>Compliance with legal obligations</li>
                <li>Protection of vital interests</li>
                <li>Legitimate interests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date. You are advised to review this Privacy Policy periodically for
                any changes. Changes to this Privacy Policy are effective when they are posted on
                this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights,
                please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 mb-4">
                <p className="text-base leading-relaxed text-foreground mb-2">
                  <strong>OunceTracker</strong>
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Email: privacy@ouncetracker.com
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Website:{' '}
                  <Link href="/" className="text-primary hover:underline">
                    ouncetracker.com
                  </Link>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Consent</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                By using our Service, you consent to our Privacy Policy and agree to its terms. If
                you do not agree to this policy, please do not use our Service.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
