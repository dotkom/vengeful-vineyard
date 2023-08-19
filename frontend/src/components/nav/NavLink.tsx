import { NavLink as Link } from "react-router-dom";

interface NavLinkProps {
  label: string;
  url: string;
}

export const NavLink = ({ label, url }: NavLinkProps) => (
  <li>
    <Link
      className={({ isActive }) =>
        `inline-flex items-center border-b-2 ${
          isActive
            ? "border-indigo-500 text-gray-900"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        } px-1 pt-1 text-sm font-medium `
      }
      to={url}
      end
    >
      {label}
    </Link>
  </li>
);
