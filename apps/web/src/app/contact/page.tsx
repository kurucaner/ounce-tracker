import type { Metadata } from 'next';
import { FaXTwitter, FaEnvelope } from 'react-icons/fa6';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us - OunceTracker',
  description:
    'Get in touch with OunceTracker - Questions, feedback, or issues with price data? We\'re here to help',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions or feedback? We&apos;d love to hear from you
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-6">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              <div className="bg-muted/50 rounded-lg p-6 border border-border mb-8">
                <ContactForm />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Other Ways to Reach Us</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-6">
                Prefer a different method? You can also reach us through these channels.
              </p>

              <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FaEnvelope className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Email</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    For general inquiries, feedback, or technical issues
                  </p>
                  <a
                    href="mailto:contact@ouncetracker.com"
                    className="text-primary hover:underline font-medium"
                  >
                    contact@ouncetracker.com
                  </a>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FaXTwitter className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Social Media</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow us for updates and market insights
                  </p>
                  <a
                    href="https://x.com/ouncetracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                  >
                    <FaXTwitter className="h-4 w-4" />
                    @ouncetracker
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Can Help With</h2>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="font-semibold mb-2">Price Data Issues</h3>
                  <p className="text-sm text-muted-foreground">
                    If you notice incorrect prices, missing products, or outdated information, let
                    us know. We continuously monitor and update our data, but your feedback helps us
                    catch issues quickly.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="font-semibold mb-2">Feature Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Have an idea for a new feature or improvement? We&apos;re always looking for
                    ways to make OunceTracker more useful. Share your suggestions and we&apos;ll
                    consider them for future updates.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="font-semibold mb-2">Dealer Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you a bullion dealer interested in having your prices listed on
                    OunceTracker? We&apos;re open to partnerships with reputable dealers. Reach out
                    to discuss how we can work together.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="font-semibold mb-2">General Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions about how OunceTracker works, our data sources, or anything else?
                    Don&apos;t hesitate to ask. We&apos;re here to help.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Response Time</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                We typically respond to emails within 24-48 hours during business days. For urgent
                issues related to price data accuracy, we prioritize those and aim to respond within
                a few hours.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                For the fastest response on social media, you can reach out to us on{' '}
                <a
                  href="https://x.com/ouncetracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  X (Twitter)
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                When you contact us, we&apos;ll use your information only to respond to your
                inquiry. We don&apos;t share your contact information with third parties. For more
                details, please review our{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section className="bg-muted/50 rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-3">Before You Contact Us</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You might find answers to common questions in our{' '}
                <a href="/about" className="text-primary hover:underline">
                  About page
                </a>
                . We also recommend checking our{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </a>{' '}
                for information about how our service works.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

