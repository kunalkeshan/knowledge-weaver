import Image from 'next/image'

import { AnnouncementBadge } from '@/components/elements/announcement-badge'
import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Link } from '@/components/elements/link'
import { Logo, LogoGrid } from '@/components/elements/logo-grid'
import { Screenshot } from '@/components/elements/screenshot'
import { ArrowNarrowRightIcon } from '@/components/icons/arrow-narrow-right-icon'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { FAQsTwoColumnAccordion, Faq } from '@/components/sections/faqs-two-column-accordion'
import { Feature, FeaturesTwoColumnWithDemos } from '@/components/sections/features-two-column-with-demos'
import { CallToActionAuthCta } from '@/components/sections/call-to-action-auth-cta'
import { HeroAuthCta } from '@/components/sections/hero-auth-cta'
import { HeroLeftAlignedWithDemo } from '@/components/sections/hero-left-aligned-with-demo'
import { Plan, PricingMultiTier } from '@/components/sections/pricing-multi-tier'
import { Stat, StatsWithGraph } from '@/components/sections/stats-with-graph'
import { Testimonial, TestimonialThreeColumnGrid } from '@/components/sections/testimonials-three-column-grid'

export default function Page() {
  return (
    <>
      {/* Hero */}
      <HeroLeftAlignedWithDemo
        id="hero"
        eyebrow={<AnnouncementBadge href="#" text="Community Knowledge Weaver" cta="Learn more" />}
        headline="Turn scattered knowledge into actionable learning paths."
        subheadline={
          <p>
            Connect your docs, wikis, and drives in one place. AI weaves them into step-by-step guides for onboarding,
            process how-tos, and troubleshooting — grounded in your actual content.
          </p>
        }
        cta={<HeroAuthCta />}
        demo={
          <>
            <Screenshot className="rounded-md lg:hidden" wallpaper="green" placement="bottom-right">
              <Image
                src="/img/screenshots/1-left-1670-top-1408.webp"
                alt=""
                width={1670}
                height={1408}
                className="bg-white/75 md:hidden dark:hidden"
              />
              <Image
                src="/img/screenshots/1-color-olive-left-1670-top-1408.webp"
                alt=""
                width={1670}
                height={1408}
                className="bg-black/75 not-dark:hidden md:hidden"
              />
              <Image
                src="/img/screenshots/1-left-2000-top-1408.webp"
                alt=""
                width={2000}
                height={1408}
                className="bg-white/75 max-md:hidden dark:hidden"
              />
              <Image
                src="/img/screenshots/1-color-olive-left-2000-top-1408.webp"
                alt=""
                width={2000}
                height={1408}
                className="bg-black/75 not-dark:hidden max-md:hidden"
              />
            </Screenshot>
            <Screenshot className="rounded-lg max-lg:hidden" wallpaper="green" placement="bottom">
              <Image
                src="/img/screenshots/1.webp"
                alt=""
                className="bg-white/75 dark:hidden"
                width={3440}
                height={1990}
              />
              <Image
                className="bg-black/75 not-dark:hidden"
                src="/img/screenshots/1-color-olive.webp"
                alt=""
                width={3440}
                height={1990}
              />
            </Screenshot>
          </>
        }
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
                className="bg-black/75 not-dark:hidden"
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
                className="bg-black/75 not-dark:hidden"
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
                className="bg-black/75 not-dark:hidden"
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
                className="bg-black/75 not-dark:hidden"
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
                className="bg-black/75 not-dark:hidden"
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
                className="bg-black/75 not-dark:hidden"
                alt=""
                width={85}
                height={32}
              />
            </Logo>
          </LogoGrid>
        }
      />
      {/* Features */}
      <FeaturesTwoColumnWithDemos
        id="features"
        eyebrow="How it works"
        headline="One knowledge base. Guided paths. Verified answers."
        subheadline={
          <p>
            Upload docs or connect Google Drive and Confluence. Ask a question — get a structured path with steps,
            time estimates, and links back to the source.
          </p>
        }
        features={
          <>
            <Feature
              demo={
                <Screenshot wallpaper="purple" placement="bottom-right">
                  <Image
                    src="/img/screenshots/1-left-1000-top-800.webp"
                    alt=""
                    className="bg-white/75 sm:hidden dark:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-left-1000-top-800.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden sm:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-left-1800-top-660.webp"
                    alt=""
                    className="bg-white/75 max-sm:hidden lg:hidden dark:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-left-1800-top-660.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-sm:hidden lg:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-left-1300-top-1300.webp"
                    alt=""
                    className="bg-white/75 max-lg:hidden xl:hidden dark:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-left-1300-top-1300.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-lg:hidden xl:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-left-1800-top-1250.webp"
                    alt=""
                    className="bg-white/75 max-xl:hidden dark:hidden"
                    width={1800}
                    height={1250}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-left-1800-top-1250.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-xl:hidden"
                    width={1800}
                    height={1250}
                  />
                </Screenshot>
              }
              headline="Knowledge base"
              subheadline={
                <p>
                  Bring in files, Google Drive, and Confluence. Everything is indexed and searchable so the system can
                  pull the right snippets for any question.
                </p>
              }
              cta={
                <Link href="#">
                  See how it works <ArrowNarrowRightIcon />
                </Link>
              }
            />
            <Feature
              demo={
                <Screenshot wallpaper="blue" placement="bottom-left">
                  <Image
                    src="/img/screenshots/1-right-1000-top-800.webp"
                    alt=""
                    className="bg-white/75 sm:hidden dark:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-right-1000-top-800.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden sm:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-right-1800-top-660.webp"
                    alt=""
                    className="bg-white/75 max-sm:hidden lg:hidden dark:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-right-1800-top-660.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-sm:hidden lg:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-right-1300-top-1300.webp"
                    alt=""
                    className="bg-white/75 max-lg:hidden xl:hidden dark:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-right-1300-top-1300.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-lg:hidden xl:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-right-1800-top-1250.webp"
                    alt=""
                    className="bg-white/75 max-xl:hidden dark:hidden"
                    width={1800}
                    height={1250}
                  />
                  <Image
                    src="/img/screenshots/1-color-olive-right-1800-top-1250.webp"
                    alt=""
                    className="bg-black/75 not-dark:hidden max-xl:hidden"
                    width={1800}
                    height={1250}
                  />
                </Screenshot>
              }
              headline="Learning paths"
              subheadline={
                <p>
                  Ask things like “Onboard a new frontend dev” or “How do we deploy?” and get step-by-step paths with
                  time estimates and links to the original docs.
                </p>
              }
              cta={
                <Link href="#">
                  See how it works <ArrowNarrowRightIcon />
                </Link>
              }
            />
          </>
        }
      />
      {/* Stats */}
      <StatsWithGraph
        id="stats"
        eyebrow="Built for teams"
        headline="Less searching. Faster onboarding. Knowledge that stays."
        subheadline={
          <p>
            Community Knowledge Weaver helps teams turn scattered docs into clear paths. From onboarding new joiners to
            process guides and troubleshooting — all grounded in your existing content.
          </p>
        }
      >
        <Stat stat="One place" text="Connect uploads, Google Drive, and Confluence in a single knowledge base." />
        <Stat stat="Verified" text="Paths are checked against your docs with confidence and source links." />
      </StatsWithGraph>
      {/* Testimonial */}
      <TestimonialThreeColumnGrid
        id="testimonial"
        headline="What teams are saying"
        subheadline={<p>Teams using Community Knowledge Weaver to tame scattered docs and speed up onboarding.</p>}
      >
        <Testimonial
          quote={
            <p>
              Onboarding used to take weeks. Now we generate role-specific paths from our docs in minutes, with links
              back to the source so nothing is made up.
            </p>
          }
          img={
            <Image
              src="/img/avatars/10-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Jordan Rogers"
          byline="Engineering lead"
        />
        <Testimonial
          quote={
            <p>
              We finally have one place for “how do we deploy?” and “what’s our incident process?” — and the answers
              come from our actual runbooks, not a generic chatbot.
            </p>
          }
          img={
            <Image
              src="/img/avatars/15-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Lynn Marshall"
          byline="Product ops"
        />
        <Testimonial
          quote={
            <p>
              New joiners get a clear path from day one. We save hours answering the same questions and our docs
              actually get used.
            </p>
          }
          img={
            <Image
              src="/img/avatars/13-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Rajat Singh"
          byline="Head of engineering"
        />
        <Testimonial
          quote={
            <p>
              The verification step is a game-changer. We can see which steps are grounded in our docs and which might
              need a human review.
            </p>
          }
          img={
            <Image
              src="/img/avatars/12-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="John Walters"
          byline="CTO"
        />
        <Testimonial
          quote={
            <p>
              We connected Google Drive and a few uploads. Now we generate onboarding and troubleshooting paths without
              maintaining a separate wiki.
            </p>
          }
          img={
            <Image
              src="/img/avatars/11-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Noah Gold"
          byline="Startup founder"
        />
        <Testimonial
          quote={
            <p>
              Less tribal knowledge, fewer repeated questions. Paths are clear, step-by-step, and we can share them
              across the team.
            </p>
          }
          img={
            <Image
              src="/img/avatars/14-size-160.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Mark Levinson"
          byline="Operations"
        />
      </TestimonialThreeColumnGrid>
      {/* FAQs */}
      <FAQsTwoColumnAccordion id="faqs" headline="Questions & Answers">
        <Faq
          id="faq-1"
          question="Where does the content come from?"
          answer="You connect your own sources: file uploads (PDF, Word, Markdown, text), Google Drive, and Confluence. The system indexes and searches only your content — nothing is invented from the internet."
        />
        <Faq
          id="faq-2"
          question="What kinds of paths can it generate?"
          answer="You can ask for onboarding paths (e.g. new frontend dev), process guides (e.g. how we deploy), troubleshooting (e.g. debug auth issues), or general learning paths. Each path is step-by-step with time estimates and links to source docs."
        />
        <Faq
          id="faq-3"
          question="How do I know the path is accurate?"
          answer="A verification step checks each path against the chunks used to build it. You see a confidence score and which steps are supported by your docs, so you can review or correct as needed."
        />
        <Faq
          id="faq-4"
          question="Do I need to replace my existing tools?"
          answer="No. Community Knowledge Weaver works on top of Google Drive and Confluence. You keep using them; we index and weave the content into guided paths."
        />
      </FAQsTwoColumnAccordion>
      {/* Pricing */}
      <PricingMultiTier
        id="pricing"
        headline="Pricing to fit your team."
        plans={
          <>
            <Plan
              name="Starter"
              price="Free"
              period=""
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
              price="TBD"
              period="/mo"
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
        }
      />
      {/* Call To Action */}
      <CallToActionSimple
        id="call-to-action"
        headline="Ready to turn your docs into guided paths?"
        subheadline={
          <p>
            Connect your knowledge sources, ask a question, and get step-by-step paths — with verification and links
            back to the original content.
          </p>
        }
        cta={<CallToActionAuthCta />}
      />
    </>
  )
}
