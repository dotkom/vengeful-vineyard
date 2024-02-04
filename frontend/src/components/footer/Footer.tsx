import React from "react"
import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "../../icons"

export const ContactSection = () => (
  <div className="text-slate-12 flex flex-col text-center font-medium">
    <div>Feil på nettsiden?</div>
    <div>
      Ta kontakt med{" "}
      <a className="text-red-11" href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
    </div>
  </div>
)

export const SoMeSection = () => {
  const icons = [
    <SlackIcon key="slack" />,
    <GitHubIcon key="github" />,
    <InstagramIcon key="instagram" />,
    <FacebookIcon key="facebook" />,
  ]

  return (
    <ul className="mx-8 mb-4 flex sm:justify-center">
      {icons.map((icon) => (
        <li key={icon.key} className="mx-4 w-16 cursor-pointer">
          {icon}
        </li>
      ))}
    </ul>
  )
}

interface LinksSectionProps {
  links: FooterLinkType
}

export const LinksSection = ({ links }: LinksSectionProps) => (
  <div className="mx-12 mb-4 flex items-start gap-8 sm:flex-col sm:items-center sm:gap-0">
    <ul className="my-8 flex flex-col justify-center gap-8 sm:flex-row">
      {links.main.map((link) => (
        <FooterLink label={link} key={link} large />
      ))}
    </ul>

    <ul className="my-8 flex flex-col justify-center gap-8 sm:flex-row">
      {links.second.map((link) => (
        <FooterLink label={link} key={link} />
      ))}
    </ul>
  </div>
)

interface FooterLinkProps {
  label: string
  large?: boolean
}

export interface FooterLinkType {
  main: string[]
  second: string[]
}

const footerLinks: FooterLinkType = {
  main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
  second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
}

export const FooterLink = ({ label }: FooterLinkProps) => (
  <li className="text-lg font-medium text-slate-12 cursor-pointer">{label}</li>
)

export const Footer = () => {
  return (
    <footer className="bg-white flex w-full flex-col pt-16 pb-8 text-black border-t-[1px] border-gray-300">
      <SoMeSection />
      <LinksSection links={footerLinks} />
      <ContactSection />
    </footer>
  )
}
