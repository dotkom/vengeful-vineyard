import { NavLink as Link } from "react-router-dom"

interface NavLinkProps extends Omit<React.ComponentProps<typeof Link>, "to"> {
  label: string
  url: string
  isActive?: boolean
  badgeText?: string
  badgeExpiresAt?: Date
}

export const NavLink = ({ label, url, isActive, badgeText, badgeExpiresAt, ...props }: NavLinkProps) => {
  const badgeExpired = badgeExpiresAt && badgeExpiresAt < new Date()
  return (
    <Link
      className={({ isActive: innerIsActive }) =>
        `inline-flex items-center border-b-2 ${
          isActive === undefined
            ? innerIsActive
            : isActive
            ? "border-indigo-500 text-gray-900 dark:text-gray-100"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-500"
        } px-1 pt-1 text-sm font-medium `
      }
      to={url}
      end
      {...props}
    >
      {label}
      {badgeText && !badgeExpired && (
        <span className="ml-2 px-3 py-0.5 bg-blue-9 rounded-full text-xs text-blue-12">{badgeText}</span>
      )}
    </Link>
  )
}
