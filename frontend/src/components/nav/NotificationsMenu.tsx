import { Menu, Transition } from "@headlessui/react"
import { MdOutlineNotifications } from "react-icons/md"
import { Fragment } from "react"
import { classNames } from "../../helpers/classNames"
import { GroupInviteWithMetadata } from "../../helpers/types"
import { useMutation } from "@tanstack/react-query"
import { acceptGroupInvite, declineGroupInvite } from "../../helpers/api"
import { useNavigate } from "react-router-dom"

export const NotificationsMenu = ({ invites }: { invites: GroupInviteWithMetadata[] }) => {
  const navigate = useNavigate()
  const acceptInvite = useMutation(async ({ group_id, group_name }: { group_id: string; group_name: string }) => {
    await acceptGroupInvite(group_id)
    navigate(`/komiteer/${group_name}`)
  })
  const declineInvite = useMutation({
    mutationFn: ({ group_id }: { group_id: string }) => declineGroupInvite(group_id),
    onSuccess: () => alert("TODO: Implement invite decline"),
  })

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <span className="sr-only">Open notifications</span>
        <div className="relative">
          <MdOutlineNotifications className="h-10 w-10" />
          {invites.length > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600"></span>}
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {invites.map((invite) => (
            <Menu.Item key={invite.invite.group_id}>
              {() => (
                <div className={classNames("block px-4 py-2 text-sm text-gray-700")}>
                  {invite.created_by_name} har invitert deg til <b>{invite.group_name}</b>
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() =>
                        acceptInvite.mutate({
                          group_id: invite.invite.group_id,
                          group_name: invite.group_name,
                        })
                      }
                      className="block px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                    >
                      Aksepter
                    </button>
                    <button
                      onClick={() => declineInvite.mutate({ group_id: invite.invite.group_id })}
                      className="block px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Avslå
                    </button>
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
