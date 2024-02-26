import { useAuth } from "react-oidc-context"
import { Button } from "../../components/button"
import { useRequestToJoinGroupModal } from "../../helpers/context/modal/requestToJoinGroupModalContext"
import { useCreateGroupModal } from "../../helpers/context/modal/createGroupModalContext"

export const LandingPage = () => {
  const { setOpen: setRequestToJoinGroupModalOpen } = useRequestToJoinGroupModal()
  const { setOpen: setCreateGroupModalOpen } = useCreateGroupModal()
  const auth = useAuth()

  return (
    <div className="relative isolate overflow-hidden bg-white">
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" />
      </svg>
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <h1 className="md:mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
            Vengeful Vineyard
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Vengeful Vineyard er en mystisk og hensynsløs vinmark kjent for å ha en uforklarlig historie med hevn og
            ondskap. Folk sier at den eies av en gammel familie med dype røtter i vinsmaking, men at den også er
            hjemsøkt av en ubarmhjertig kraft som straffer de som våger å stjele eller ødelegge avlingene. Ingenting kan
            forberede deg på de overnaturlige konsekvensene som følger med å bryte lovene som styrer denne vingården.
          </p>
          <div className="mt-4 flex items-center gap-x-2">
            {!auth.isAuthenticated ? (
              <Button onClick={() => void auth.signinRedirect()} label="Logg inn" />
            ) : (
              <>
                <Button
                  variant="REGULAR"
                  label="Lag ny gruppe"
                  onClick={() => setCreateGroupModalOpen && setCreateGroupModalOpen(true)}
                />
                <Button
                  variant="REGULAR"
                  label="Søk etter gruppe"
                  onClick={() => setRequestToJoinGroupModalOpen && setRequestToJoinGroupModalOpen(true)}
                />
              </>
            )}
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/wide/34a15dcf-66da-4ff5-9405-8e154a5bfe03.jpeg"
                alt="Fadderuke"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
