import Image from 'next/image'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { GitHubIcon } from '@/components/icons/social/github-icon'
import { XIcon } from '@/components/icons/social/x-icon'
import { YouTubeIcon } from '@/components/icons/social/youtube-icon'
import {
  FooterCategory,
  FooterLink,
  FooterWithNewsletterFormCategoriesAndSocialIcons,
  NewsletterForm,
  SocialLink,
} from '@/components/sections/footer-with-newsletter-form-categories-and-social-icons'
import {
  NavbarLink,
  NavbarLogo,
  NavbarWithLinksActionsAndCenteredLogo,
} from '@/components/sections/navbar-with-links-actions-and-centered-logo'

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarWithLinksActionsAndCenteredLogo
        id="navbar"
        links={
          <>
            <NavbarLink href="/pricing">Pricing</NavbarLink>
            <NavbarLink href="/about">About</NavbarLink>
            <NavbarLink href="#">Docs</NavbarLink>
            <NavbarLink href="#" className="sm:hidden">
              Log in
            </NavbarLink>
          </>
        }
        logo={
          <NavbarLogo href="/">
            <Image
              src="/img/logos/oatmeal-mona-color-olive-950.svg"
              alt="Community Knowledge Weaver"
              className="dark:hidden"
              width={113}
              height={28}
            />
            <Image
              src="/img/logos/oatmeal-mona-color-white.svg"
              alt="Community Knowledge Weaver"
              className="not-dark:hidden"
              width={113}
              height={28}
            />
          </NavbarLogo>
        }
        actions={
          <>
            <PlainButtonLink href="#" className="max-sm:hidden">
              Log in
            </PlainButtonLink>
            <ButtonLink href="#">Get started</ButtonLink>
          </>
        }
      />
      <section>{children}</section>
      <FooterWithNewsletterFormCategoriesAndSocialIcons
        id="footer"
        cta={
          <NewsletterForm
            headline="Stay in the loop"
            subheadline={<p>Get product updates and tips on turning your docs into guided learning paths.</p>}
            action="#"
          />
        }
        links={
          <>
            <FooterCategory title="Product">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/#features">Integrations</FooterLink>
            </FooterCategory>
            <FooterCategory title="Company">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Press Kit</FooterLink>
            </FooterCategory>
            <FooterCategory title="Resources">
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">API Docs</FooterLink>
              <FooterLink href="#">Status</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </FooterCategory>
            <FooterCategory title="Legal">
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Security</FooterLink>
            </FooterCategory>
          </>
        }
        fineprint="© 2025 Community Knowledge Weaver"
        socialLinks={
          <>
            <SocialLink href="https://x.com" name="X">
              <XIcon />
            </SocialLink>
            <SocialLink href="https://github.com" name="GitHub">
              <GitHubIcon />
            </SocialLink>
            <SocialLink href="https://www.youtube.com" name="YouTube">
              <YouTubeIcon />
            </SocialLink>
          </>
        }
      />
    </>
  )
}
