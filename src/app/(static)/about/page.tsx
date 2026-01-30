import Image from 'next/image'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { HeroLeftAlignedWithPhoto } from '@/components/sections/hero-left-aligned-with-photo'
import { Stat, StatsWithGraph } from '@/components/sections/stats-with-graph'
import { TeamFourColumnGrid, TeamMember } from '@/components/sections/team-four-column-grid'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'

export default function Page() {
  return (
    <>
      {/* Hero */}
      <HeroLeftAlignedWithPhoto
        id="hero"
        headline="Turn scattered knowledge into paths that work."
        subheadline={
          <p>
            Community Knowledge Weaver helps teams stop drowning in docs. We connect your files, Drive, and Confluence,
            then weave them into step-by-step learning paths and guides — so onboarding and how-tos stay clear and
            grounded in your content.
          </p>
        }
        photo={
          <Image
            src="/img/photos/1.webp"
            alt=""
            width={1800}
            height={945}
            className="not-dark:bg-white/75 dark:bg-black/75"
          />
        }
      />
      {/* Stats */}
      <StatsWithGraph
        id="stats"
        eyebrow="Built for teams"
        headline="One knowledge base. Guided paths. Verified answers."
        subheadline={
          <p>
            We built Community Knowledge Weaver for teams with growing docs and slow onboarding. Upload files, connect
            Google Drive and Confluence, and get learning paths, process guides, and troubleshooting — all tied back to
            your sources.
          </p>
        }
      >
        <Stat stat="Your content" text="We only use what you connect — no generic web answers." />
        <Stat stat="Verified" text="Paths are checked against your docs with confidence and source links." />
      </StatsWithGraph>
      {/* Testimonial */}
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            We went from weeks of ad-hoc onboarding to clear, role-specific paths in minutes. Everything links back to
            our docs, so new joiners know exactly where to look.
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
      {/* Team */}
      <TeamFourColumnGrid
        id="team"
        headline="Our team"
        subheadline={
          <p>
            We're a small team focused on making organizational knowledge actionable — so teams spend less time
            searching and more time doing.
          </p>
        }
      >
        <TeamMember
          img={
            <Image
              src="/img/avatars/1-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Leslie Alexander"
          byline="Co-Founder / CEO"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/2-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Michael Foster"
          byline="Co-Founder / CTO"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/7-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Dries Vincent"
          byline="Business Relations"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/4-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Lindsay Walton"
          byline="Front-end Developer"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/5-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Noor Hasan"
          byline="Designer"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/6-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Tom Cook"
          byline="Director of Product"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/8-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Whitney Francis"
          byline="Copywriter"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/3-h-1000-w-800.webp"
              alt=""
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Leonard Wu"
          byline="Senior Designer"
        />
      </TeamFourColumnGrid>
      {/* Call To Action */}
      <CallToActionSimple
        id="call-to-action"
        headline="Have questions?"
        subheadline={
          <p>Get in touch to see how Community Knowledge Weaver can work for your team.</p>
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
