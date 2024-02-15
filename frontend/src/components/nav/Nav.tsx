import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { LEADERBOARD_URL, useMyGroups } from "../../helpers/api"

import { AuthContextProps } from "react-oidc-context"
import { AvatarIcon } from "@radix-ui/react-icons"
import { Fragment } from "react"
import { Leaderboard } from "../../helpers/types"
import { Link, useLocation } from "react-router-dom"
import { NavLink } from "./NavLink"
import OnlineLogo from "../../assets/online.png"
import axios from "axios"
import { classNames } from "../../helpers/classNames"
import { useQueryClient } from "@tanstack/react-query"
import { useDarkMode } from "../../DarkModeContext"

interface NavItem {
  label: string
  url: string
  isActivePredicate: (item: NavItem, currentPathname: string) => boolean
  shouldShowPredicate?: (item: NavItem, currentPathname: string) => boolean
  prefetch?: () => void
}

interface NavProps {
  auth: AuthContextProps
}

export const Nav = ({ auth }: NavProps) => {
  const queryClient = useQueryClient()
  const location = useLocation()

  const { data: groups } = useMyGroups({
    enabled: auth.isAuthenticated,
  })
  const isInAnyOWGroup = groups?.groups.some((group) => group.ow_group_id !== null) ?? false

  const prefetchWallOfShame = () => {
    queryClient.prefetchInfiniteQuery(
      ["leaderboard"],
      ({ pageParam = LEADERBOARD_URL }) => axios.get(pageParam).then((res) => res.data),
      {
        getNextPageParam: (lastPage: Leaderboard, _) => lastPage.next,
        staleTime: 1000 * 60 * 5,
      }
    )
  }

  const items: NavItem[] = [
    {
      label: "Hjem",
      url: "/",
      isActivePredicate: (_, currentLocation) => currentLocation.toLowerCase().startsWith("/komiteer/"),
    },
    {
      label: "Wall of Shame",
      url: "/wall-of-shame",
      isActivePredicate: (item, currentLocation) => currentLocation.toLowerCase().startsWith(`${item.url}`),
      shouldShowPredicate: () => isInAnyOWGroup,
      prefetch: prefetchWallOfShame,
    },
    {
      label: "Komiteer",
      url: "/committees",
      isActivePredicate: (item, currentLocation) => currentLocation.toLowerCase().startsWith(`${item.url}`)
    }
  ]

  const { darkMode, setDarkMode } = useDarkMode()

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row h-16 justify-between">
              <div className="flex flex-row justify-between md:justify-start w-full">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <img className="h-8 w-auto cursor-pointer" src={OnlineLogo} alt="Online Logo" />
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  {items
                    .filter((item) => !item.shouldShowPredicate || item.shouldShowPredicate(item, location.pathname))
                    .map((item) => (
                      <NavLink
                        key={item.url}
                        label={item.label}
                        url={item.url}
                        onMouseEnter={item.prefetch}
                        onFocus={item.prefetch}
                        isActive={item.isActivePredicate(item, location.pathname)}
                      />
                    ))}
                </div>
              </div>
              <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <AvatarIcon className="h-10 w-10 text-black" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white  py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-gray-700 ">
                      <Menu.Item>
                        {({ active }) => (
                          <Fragment>
                            <button
                              onClick={() => setDarkMode(!darkMode)}
                              className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm")}
                            >
                              {darkMode ? "Lightmode" : "Darkmode"}
                            </button>
                            {auth.isAuthenticated ? (
                              <button
                                onClick={() => void auth.removeUser()}
                                className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm")}
                              >
                                Logg ut
                              </button>
                            ) : (
                              <button
                                onClick={() => void auth.signinRedirect()}
                                className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm")}
                              >
                                Logg inn
                              </button>
                            )}
                          </Fragment>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pt-2">
              {items
                .filter((item) => !item.shouldShowPredicate || item.shouldShowPredicate(item, location.pathname))
                .map((item) => (
                  <Link key={item.url} to={item.url}>
                    <Disclosure.Button
                      as="span"
                      className={classNames(
                        "block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6",
                        item.isActivePredicate(item, location.pathname) ? "border-indigo-500 text-indigo-700" : ""
                      )}
                    >
                      {item.label}
                    </Disclosure.Button>
                  </Link>
                ))}
            </div>
            <div className="border-t border-gray-200">
              <div className="space-y-1">
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                  onClick={() => (auth.isAuthenticated ? auth.removeUser() : auth.signinRedirect())}
                >
                  {auth.isAuthenticated ? "Logg ut" : "Logg inn"}
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
