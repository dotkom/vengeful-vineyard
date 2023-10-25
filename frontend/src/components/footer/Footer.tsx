import { GitHubIcon } from "../../assets/GitHubIcon"
import React from "react"

export const Footer = () => {
  const links = [
    {
      name: "GitHub",
      href: "https://github.com/dotkom/vengeful-vineyard",
      icon: (props: React.ComponentProps<"svg">) => <GitHubIcon {...props} />,
    },
  ]

  return (
    <footer className="mt-8 bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {links.map((item) => (
            <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">Laget av Dotkom</p>
        </div>
      </div>
    </footer>
  )
}
