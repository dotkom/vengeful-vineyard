import { AuthContextProps } from "react-oidc-context";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Avatar } from "../avatar";
import { classNames } from "../../helpers/classNames";

interface ProfileModalProps {
  auth: AuthContextProps;
}

export const ProfileModal = ({ auth }: ProfileModalProps) => {
  const [isShowing, setIsShowing] = useState(false);

  const toggleModal = () => setIsShowing(!isShowing);

  const links = ["Innstillinger", "Hva i", "Tips"];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button onClick={toggleModal}>
        <figure className="cursor-pointer">
          <Avatar />
        </figure>
      </Menu.Button>
      <Transition
        show={isShowing}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {auth.isAuthenticated && (
            <div className="px-4 py-3">
              <p className="text-sm">Innlogget som</p>
              <p className="truncate text-sm font-medium text-gray-900">
                {auth.user?.id_token}
              </p>
            </div>
          )}
          <div className="py-1">
            {links.map((link) => (
              <Menu.Item key={link}>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    {link}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Fragment>
                  {auth.isAuthenticated ? (
                    <button
                      onClick={() => void auth.removeUser()}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block w-full px-4 py-2 text-left text-sm"
                      )}
                    >
                      Logg ut
                    </button>
                  ) : (
                    <button
                      onClick={() => void auth.signinRedirect()}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block w-full px-4 py-2 text-left text-sm"
                      )}
                    >
                      Logg inn
                    </button>
                  )}
                </Fragment>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
