import Image from 'next/image'

import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Logo, LogoGrid } from '@/components/elements/logo-grid'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { FAQsAccordion, Faq } from '@/components/sections/faqs-accordion'
import { PlanComparisonTable } from '@/components/sections/plan-comparison-table'
import { Plan, PricingHeroMultiTier } from '@/components/sections/pricing-hero-multi-tier'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'

function plans(option: string) {
  return (
    <>
      <Plan
        name="Starter"
        price={option === 'Monthly' ? 'Free' : 'Free'}
        period={option === 'Monthly' ? '' : ''}
        subheadline={<p>Small teams trying out knowledge paths</p>}
        features={[
          'File uploads (PDF, Word, Markdown)',
          'Learning path generation',
          'Source links and verification',
          'Up to 3 users',
          'Email support',
        ]}
        cta={
          <SoftButtonLink href="#" size="lg">
            Get started
          </SoftButtonLink>
        }
      />
      <Plan
        name="Growth"
        price={option === 'Monthly' ? 'TBD' : 'TBD'}
        period={option === 'Monthly' ? '/mo' : '/yr'}
        subheadline={<p>Teams with multiple docs and connectors</p>}
        badge="Most popular"
        features={[
          'Everything in Starter',
          'Google Drive connector',
          'Confluence connector',
          'More users and documents',
          'Path library and sharing',
          'Priority support',
        ]}
        cta={
          <ButtonLink href="#" size="lg">
            Get started
          </ButtonLink>
        }
      />
      <Plan
        name="Enterprise"
        price="Contact"
        period=""
        subheadline={<p>Larger organizations and regulated environments</p>}
        features={[
          'Everything in Growth',
          'SSO and custom roles',
          'Dedicated support',
          'SLA and compliance',
          'On-prem or private cloud options',
        ]}
        cta={
          <SoftButtonLink href="#" size="lg">
            Contact sales
          </SoftButtonLink>
        }
      />
    </>
  )
}

export default function Page() {
  return (
    <>
      {/* Hero */}
      <PricingHeroMultiTier
        id="pricing"
        headline="Pricing"
        subheadline={
          <p>
            Turn your docs into guided learning paths. Choose a plan that fits your team size and how many sources you
            want to connect.
          </p>
        }
        options={['Monthly', 'Yearly']}
        plans={{ Monthly: plans('Monthly'), Yearly: plans('Yearly') }}
        footer={
          <LogoGrid>
            <Logo>
              <Image
                src="/img/logos/9-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={51}
                height={32}
              />
              <Image
                src="/img/logos/9-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={51}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/10-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={70}
                height={32}
              />
              <Image
                src="/img/logos/10-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={70}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/11-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={100}
                height={32}
              />
              <Image
                src="/img/logos/11-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={100}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/12-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={85}
                height={32}
              />
              <Image
                src="/img/logos/12-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={85}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/13-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={75}
                height={32}
              />
              <Image
                src="/img/logos/13-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={75}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/8-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={85}
                height={32}
              />
              <Image
                src="/img/logos/8-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={85}
                height={32}
              />
            </Logo>
          </LogoGrid>
        }
      />
      {/* Plan Comparison Table */}
      <PlanComparisonTable
        id="pricing"
        plans={['Starter', 'Growth', 'Enterprise']}
        features={[
          {
            title: 'Knowledge base',
            features: [
              { name: 'File uploads (PDF, Word, MD)', value: true },
              {
                name: 'Google Drive connector',
                value: { Starter: false, Growth: true, Enterprise: true },
              },
              {
                name: 'Confluence connector',
                value: { Starter: false, Growth: true, Enterprise: true },
              },
              {
                name: 'Document limit',
                value: { Starter: 'Limited', Growth: 'Higher', Enterprise: 'Unlimited' },
              },
            ],
          },
          {
            title: 'Paths & verification',
            features: [
              { name: 'Learning path generation', value: true },
              { name: 'Source links and verification', value: true },
              {
                name: 'Path library and sharing',
                value: { Starter: false, Growth: true, Enterprise: true },
              },
            ],
          },
          {
            title: 'Team & security',
            features: [
              {
                name: 'Users',
                value: { Starter: 'Up to 3', Growth: 'More', Enterprise: 'Unlimited' },
              },
              {
                name: 'SSO and custom roles',
                value: { Starter: false, Growth: false, Enterprise: true },
              },
              {
                name: 'SLA and compliance',
                value: { Starter: false, Growth: false, Enterprise: true },
              },
            ],
          },
          {
            title: 'Support',
            features: [
              { name: 'Email support', value: true },
              {
                name: 'Priority support',
                value: { Starter: false, Growth: true, Enterprise: true },
              },
              {
                name: 'Dedicated support',
                value: { Starter: false, Growth: false, Enterprise: true },
              },
            ],
          },
        ]}
      />
      {/* Testimonial */}
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            We connected our docs and Drive, and now we generate onboarding and process paths in minutes. New joiners
            get clear steps with links to the source — no more hunting through wikis.
          </p>
        }
        img={
          <Image
            src="/img/avatars/16-h-1000-w-1400.webp"
            alt=""
            className="not-dark:bg-white/75 dark:bg-black/75"
            width={1400}
            height={1000}
          />
        }
        name="Lynn Marshall"
        byline="Engineering lead"
      />
      {/* FAQs */}
      <FAQsAccordion id="faqs" headline="Questions & Answers">
        <Faq
          id="faq-1"
          question="What sources can I connect?"
          answer="You can upload files (PDF, Word, Markdown, text) and connect Google Drive and Confluence. We only use content you provide — no generic web data."
        />
        <Faq
          id="faq-2"
          question="What counts as a user?"
          answer="Anyone who signs in to your team's workspace and can create or view learning paths. Starter is limited to a few users; Growth and Enterprise scale up."
        />
        <Faq
          id="faq-3"
          question="Can I try before paying?"
          answer="Yes. The Starter plan is free so you can upload docs, generate paths, and see how verification and source links work before upgrading."
        />
        <Faq
          id="faq-4"
          question="Do you replace my existing tools?"
          answer="No. We work on top of Google Drive and Confluence. You keep using them; we index and weave the content into guided paths."
        />
      </FAQsAccordion>
      {/* Call To Action */}
      <CallToActionSimpleCentered
        id="call-to-action"
        headline="Have questions?"
        subheadline={
          <p>Get in touch to find the right plan for your team or to see a demo.</p>
        }
        cta={
          <div className="flex items-center gap-4">
            <ButtonLink href="#" size="lg">
              Get started
            </ButtonLink>

            <PlainButtonLink href="#" size="lg">
              Book a demo <ChevronIcon />
            </PlainButtonLink>
          </div>
        }
      />
    </>
  )
}
