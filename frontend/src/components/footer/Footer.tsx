import React from "react"
import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "../../icons"

export const ContactSection = () => (
  <div className="text-slate-12 flex flex-col text-center font-medium">
    <div>Feil på nettsiden?</div>
    <div>
      Ta kontakt med{" "}
      <a className="text-red-600" href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
    </div>
  </div>
)

export const SoMeSection = () => {
  const links = [
    {
      icon: <SlackIcon key="slack" />,
      url: "https://onlinentnu.slack.com/"
    },
    {
      icon: <GitHubIcon key="github" />,
      url: "https://www.github.com/dotkom/"
    },
    {
      icon: <InstagramIcon key="instagram" />,
      url: "https://www.instagram.com/online_ntnu/"
    },
    {
      icon: <FacebookIcon key="facebook" />,
      url: "http://facebook.com/LinjeforeningenOnline/"
    },
  ]

  return (
    <ul className="mx-8 mb-4 flex sm:justify-center">
      {links.map((link) => (
        <a href={link.url} className="mx-4">
          <li key={link.icon.key} className="w-16 cursor-pointer">
            {link.icon}
          </li>
        </a>
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
