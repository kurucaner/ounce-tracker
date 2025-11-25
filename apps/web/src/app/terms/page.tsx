import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions - OunceTracker',
  description: 'OunceTracker Terms and Conditions - Legal terms governing your use of our service',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = 'January 2025';

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                By accessing or using OunceTracker (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;) and our website at ouncetracker.com (the &quot;Service&quot;), you
                agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not
                agree to these Terms, you must not access or use the Service.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                These Terms constitute a legally binding agreement between you and OunceTracker. We
                reserve the right to modify these Terms at any time. Your continued use of the
                Service after any such modifications constitutes your acceptance of the modified
                Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                OunceTracker is an independent price comparison platform that aggregates and
                displays precious metal prices from various bullion dealers. Our Service provides:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Real-time price comparisons for precious metals products</li>
                <li>Information about bullion dealers and their offerings</li>
                <li>Educational content about precious metals</li>
                <li>Market insights and analysis (where available)</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                <strong>Important:</strong> OunceTracker does not sell, purchase, or facilitate the
                sale or purchase of precious metals. We are an informational service only and do not
                act as a dealer, broker, or intermediary in any transactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Use of Service</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Permitted Use</h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You may use the Service for lawful purposes only and in accordance with these Terms.
                You agree to use the Service:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>For personal, non-commercial purposes (unless otherwise authorized)</li>
                <li>In compliance with all applicable laws and regulations</li>
                <li>Without infringing on the rights of others</li>
                <li>Without attempting to gain unauthorized access to our systems</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Prohibited Activities</h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>
                  Violate any international, federal, provincial, or state laws or regulations
                </li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Attempt to reverse engineer, decompile, or disassemble the Service</li>
                <li>
                  Use automated systems (bots, scrapers) to access the Service without permission
                </li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Copy, modify, or create derivative works of the Service</li>
                <li>Remove any copyright, trademark, or proprietary notices</li>
                <li>Use the Service to compete with or harm our business</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                The Service and its original content, features, and functionality are owned by
                OunceTracker and are protected by international copyright, trademark, patent, trade
                secret, and other intellectual property laws.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You are granted a limited, non-exclusive, non-transferable, revocable license to
                access and use the Service for personal, non-commercial purposes. This license does
                not include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Any resale or commercial use of the Service</li>
                <li>Any collection or use of product listings, descriptions, or prices</li>
                <li>Any derivative use of the Service or its contents</li>
                <li>Any use of data mining, robots, or similar data gathering tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Price Information and Accuracy</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                <strong>Disclaimer:</strong> While we strive to provide accurate and up-to-date
                price information, we make no warranties or representations regarding the accuracy,
                completeness, or timeliness of any price data displayed on the Service.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Price information is:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Aggregated from third-party dealer websites</li>
                <li>Subject to change without notice</li>
                <li>May contain errors or inaccuracies</li>
                <li>Not guaranteed to reflect actual dealer prices at the time of purchase</li>
                <li>Not a substitute for verifying prices directly with dealers</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You acknowledge that prices may vary from dealer to dealer and may change
                frequently. Always verify current prices, availability, and terms directly with the
                dealer before making any purchase decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Third-Party Links and Content</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                The Service may contain links to third-party websites, services, or resources that
                are not owned or controlled by OunceTracker. We have no control over, and assume no
                responsibility for, the content, privacy policies, or practices of any third-party
                websites or services.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You acknowledge and agree that OunceTracker shall not be responsible or liable,
                directly or indirectly, for any damage or loss caused or alleged to be caused by or
                in connection with the use of or reliance on any such content, goods, or services
                available on or through any such websites or services.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We strongly advise you to read the terms and conditions and privacy policies of any
                third-party websites or services that you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT
                LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>WARRANTIES OF MERCHANTABILITY</li>
                <li>FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>NON-INFRINGEMENT</li>
                <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF INFORMATION</li>
                <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We do not warrant that the Service will be available at all times, secure, or free
                from errors, viruses, or other harmful components. We disclaim all warranties to the
                fullest extent permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OUNCETRACKER,
                ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, SUPPLIERS, OR LICENSORS BE LIABLE FOR
                ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES,
                INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR
                OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO
                USE, THE SERVICE.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                This limitation applies regardless of whether the damages arise from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Breach of contract</li>
                <li>Breach of warranty</li>
                <li>Negligence</li>
                <li>Any other cause of action</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                In no event shall our total liability to you for all damages exceed the amount you
                paid to us, if any, or $100, whichever is greater. Some jurisdictions do not allow
                the exclusion of certain warranties or limitations of liability, so some of the
                above limitations may not apply to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You agree to defend, indemnify, and hold harmless OunceTracker and its officers,
                directors, employees, agents, affiliates, and licensors from and against any claims,
                liabilities, damages, losses, and expenses, including without limitation reasonable
                attorney&apos;s fees and costs, arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>
                  Your violation of any third-party right, including without limitation any
                  intellectual property right, publicity, confidentiality, property, or privacy
                  right
                </li>
                <li>Any claim that your use of the Service caused damage to a third party</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. No Investment Advice</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                <strong>Important Disclaimer:</strong> The information provided on the Service is
                for informational purposes only and does not constitute investment, financial,
                trading, or other professional advice.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                You should not rely on the information on the Service as a basis for making any
                investment, trading, or purchasing decisions. We are not:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Investment advisors or financial advisors</li>
                <li>Registered brokers or dealers</li>
                <li>Providing personalized investment advice</li>
                <li>Recommending any specific products or dealers</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Always seek the advice of qualified professionals regarding any investment or
                financial decisions. Past performance is not indicative of future results.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. No Endorsement</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                The inclusion of any dealer, product, or service on the Service does not constitute
                an endorsement, recommendation, or guarantee by OunceTracker. We are an independent
                platform and do not have affiliations with any dealers. The display of dealer
                information and prices is for informational and comparison purposes only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Service Availability</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We reserve the right to modify, suspend, or discontinue the Service (or any part
                thereof) at any time, with or without notice, for any reason. We shall not be liable
                to you or any third party for any modification, suspension, or discontinuation of
                the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. User Accounts</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If the Service requires you to create an account, you are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring that your account information is accurate and up-to-date</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We reserve the right to suspend or terminate your account at any time for violation
                of these Terms or for any other reason we deem necessary.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We may terminate or suspend your access to the Service immediately, without prior
                notice or liability, for any reason, including without limitation if you breach
                these Terms.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Upon termination, your right to use the Service will cease immediately. All
                provisions of these Terms which by their nature should survive termination shall
                survive termination, including ownership provisions, warranty disclaimers,
                indemnity, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Governing Law and Jurisdiction</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the
                jurisdiction in which OunceTracker operates, without regard to its conflict of law
                provisions.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Any disputes arising out of or relating to these Terms or the Service shall be
                subject to the exclusive jurisdiction of the courts located in the jurisdiction
                where OunceTracker is established.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary so that
                these Terms shall otherwise remain in full force and effect and enforceable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">17. Entire Agreement</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement
                between you and OunceTracker regarding the use of the Service and supersede all
                prior agreements and understandings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">18. Waiver</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                No waiver by OunceTracker of any term or condition set forth in these Terms shall be
                deemed a further or continuing waiver of such term or condition or a waiver of any
                other term or condition, and any failure of OunceTracker to assert a right or
                provision under these Terms shall not constitute a waiver of such right or
                provision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">19. Changes to Terms</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. If a revision is material, we will provide at least 30 days notice prior
                to any new terms taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                By continuing to access or use our Service after those revisions become effective,
                you agree to be bound by the revised terms. If you do not agree to the new terms,
                please stop using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">20. Contact Information</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 mb-4">
                <p className="text-base leading-relaxed text-foreground mb-2">
                  <strong>OunceTracker</strong>
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Email: legal@ouncetracker.com
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
              <h2 className="text-2xl font-semibold mb-4">21. Acknowledgment</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                By using the Service, you acknowledge that you have read, understood, and agree to
                be bound by these Terms and Conditions. If you do not agree to these Terms, you must
                not use the Service.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
