import { Dialog, Transition } from "@headlessui/react"
import { Fragment, forwardRef, useState, useEffect } from "react"
import Cookies from "js-cookie"

interface AlcoholGameProps {
  quit: any
  next: any
}

const AlcoholGame = forwardRef<HTMLDivElement, AlcoholGameProps>(({ quit, next }, ref) => {
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [isTestFinished, setIsTestFinished] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [failCount, setFailCount] = useState<number>(0)
  const [blocked, setBlocked] = useState<boolean>(false)
  const [benchmarkTime, setBenchmarkTime] = useState<number>(0)

  const failedAttempts = 3
  const reactionTimeThreshold = 500
  const offsetForSlowPhones = 400
  const benchmarkTimeThreshold = 50

  const randomTime = 3
  const [timeoutHandle, setTimeoutHandle] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timestamp = Cookies.get("blockedTime")
    if (timestamp) {
      const diff = Date.now() - parseInt(timestamp)
      if (diff < 3600000 * 2) {
        setBlocked(true)
      } else {
        Cookies.remove("blockedTime")
        setBlocked(false)
      }
    }

    // Benchmark the loop
    const startBenchmark = performance.now()
    for (let i = 1; i <= 1000000; i++) {
      Math.sqrt(i)
    }
    const endBenchmark = performance.now()
    setBenchmarkTime(endBenchmark - startBenchmark)
  }, [])

  const startTest = () => {
    if (blocked) return
    setIsWaiting(true)
    setIsTestFinished(false)
    setReactionTime(null)
    const delay = Math.random() * randomTime * 1000 + 1000
    setTimeoutHandle(
      setTimeout(() => {
        showClick()
      }, delay)
    )
  }

  const cancelWaiting = () => {
    clearTimeout(timeoutHandle as ReturnType<typeof setTimeout>)
    endTest()
    setTimeout(() => {
      setReactionTime(null)
    }, 50)
  }

  const showClick = () => {
    setIsWaiting(false)
    setIsTestRunning(true)
    setStartTime(Date.now())
  }

  const endTest = () => {
    setIsTestRunning(false)
    if (startTime) {
      const newReactionTime =
        Date.now() - startTime - (benchmarkTimeThreshold < benchmarkTime ? offsetForSlowPhones : 0)
      setReactionTime(newReactionTime)
      if (newReactionTime >= reactionTimeThreshold) {
        const newFailCount = failCount + 1
        setFailCount(newFailCount)
        if (newFailCount >= failedAttempts) {
          Cookies.set("blockedTime", Date.now().toString())
          setBlocked(true)
        }
      }
    }
    setIsTestFinished(true)
  }

  const [open, setOpen] = useState(true)
  const onClose = () => {
    quit()
    setOpen(false)
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          if (onClose) onClose()
          setOpen(false)
        }}
        ref={ref}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform bg-gray-50 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div
                  className={`flex h-[600px] flex-col min-w-[50vw] justify-center items-center text-white ${
                    isTestRunning ? "bg-red-500" : "bg-green-500"
                  }${!isTestFinished ? " cursor-pointer" : ""}`}
                  onClick={
                    !isTestFinished ? (isTestRunning ? endTest : isWaiting ? cancelWaiting : startTest) : () => {}
                  }
                >
                  <h1>{benchmarkTime}</h1>
                  {blocked ? (
                    <>
                      <p className="text-xl">You have failed too many times, YOU ARE DRUNK</p>
                      <p className="text-xl"> Play again when sober :)</p>
                      <button onClick={() => onClose()} className="py-2 px-4 bg-gray-700 text-white rounded-lg mt-4">
                        Quit
                      </button>
                    </>
                  ) : isTestRunning ? (
                    <p className="text-2xl font-bold">Click anywhere now!</p>
                  ) : isTestFinished || blocked ? (
                    <>
                      <p className="text-lg">
                        {reactionTime ? `Your reaction time was: ${reactionTime}ms` : "Sorry, but you are too quick"}
                      </p>
                      <button onClick={() => onClose()} className="py-2 px-4 bg-gray-700 text-white rounded-lg mt-4">
                        Quit
                      </button>
                      <button onClick={startTest} className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-4">
                        Try Again
                      </button>
                      {reactionTime && reactionTime < 500 ? (
                        <button className="py-2 px-4 bg-yellow-500 text-white rounded-lg mt-4" onClick={next}>
                          Give penalty
                        </button>
                      ) : (
                        <p className="text-red-500 mt-4">{reactionTime && "Sorry, you are too drunk"}</p>
                      )}
                    </>
                  ) : isWaiting ? (
                    <p className="text-xl">Wait...</p>
                  ) : (
                    <p className="text-xl">Click anywhere to start the test</p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
})
export default AlcoholGame
