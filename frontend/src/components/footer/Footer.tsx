import React from "react"
import {
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  SlackIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  MobileIcon,
  FileIcon,
} from "../../icons"

export const FeedbackSection = () => (
  <div className="text-slate-12 flex flex-col text-center font-medium">
    <div>
      <span
        onClick={() => {
          throw new Error("Test error")
        }}
      >
        Feil
      </span>{" "}
      på nettsiden?
    </div>
    <div>
      Ta kontakt med{" "}
      <a className="text-red-600" href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
    </div>
  </div>
)

interface FooterContactInfoGroup {
  title: string
  items: React.ReactNode[]
}

export const ContactInfoSection = () => {
  const contactInfoGroups: FooterContactInfoGroup[] = [
    {
      title: "Besøksadresse",
      items: ["A-blokka, A4-137", "Høgskoleringen 5", "NTNU Gløshaugen"],
    },
    {
      title: "Kontaktinformasjon",
      items: [
        <>
          <BriefcaseIcon key="briefcase" />
          992 548 045 (OrgNr)
        </>,
        <>
          <EnvelopeIcon key="envelope" />
          <a href="mailto:kontakt@online.ntnu.no">kontakt@online.ntnu.no</a>
        </>,
        <>
          <FileIcon key="file" />
          <a href="mailto:okonomi@online.ntnu.no">okonomi@online.ntnu.no</a>
        </>,
        <>
          <MobileIcon key="mobile" />
          986 69 907
        </>,
      ],
    },
    {
      title: "Post og faktura",
      items: ["Online Linjeforening", "Sem Sælands vei 9", "7491 Trondheim"],
    },
  ]

  return (
    <div className="mx-12 mt-4 mb-8 flex items-center sm:items-start justify-center flex-col sm:flex-row gap-4 sm:gap-8">
      {contactInfoGroups.map((group, index) => (
        <div key={index} className="text-center sm:text-left">
          <p className="text-lg font-medium text-slate-12">{group.title}</p>
          <ul className="justify-center gap-8 sm:flex-row">
            {group.items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-md my-2">
                <p className="inline-flex gap-1 items-center">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export const SoMeSection = () => {
  const links = [
    {
      icon: <SlackIcon key="slack" />,
      url: "https://onlinentnu.slack.com/",
    },
    {
      icon: <GitHubIcon key="github" />,
      url: "https://www.github.com/dotkom/",
    },
    {
      icon: <InstagramIcon key="instagram" />,
      url: "https://www.instagram.com/online_ntnu/",
    },
    {
      icon: <FacebookIcon key="facebook" />,
      url: "http://facebook.com/LinjeforeningenOnline/",
    },
  ]

  return (
    <ul className="mx-8 mb-4 flex justify-center flex-wrap gap-4">
      {links.map((link) => (
        <li key={link.icon.key} className="w-16">
          <a href={link.url}>{link.icon}</a>
        </li>
      ))}
    </ul>
  )
}

export const Footer = () => {
  return (
    <footer className="bg-white flex w-full flex-col pt-16 pb-8 text-black border-t-[1px] border-gray-300">
      <SoMeSection />
      <ContactInfoSection />
      <FeedbackSection />
    </footer>
  )
}
