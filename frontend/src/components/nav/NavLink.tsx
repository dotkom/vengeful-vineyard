import { NavLink as Link } from "react-router-dom"

interface NavLinkProps extends Omit<React.ComponentProps<typeof Link>, "to"> {
  label: string
  url: string
  isActive?: boolean
}

export const NavLink = ({ label, url, isActive, ...props }: NavLinkProps) => (
  <Link
    className={({ isActive: innerIsActive }) =>
      `inline-flex items-center border-b-2 ${
        isActive === undefined
          ? innerIsActive
          : isActive
          ? "border-indigo-500 text-gray-900"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      } px-1 pt-1 text-sm font-medium `
    }
    to={url}
    end
    {...props}
  >
    {label}
  </Link>
)
