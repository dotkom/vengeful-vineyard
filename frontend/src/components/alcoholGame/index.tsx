import { useState } from "react"
const AlcoholGame = ({ quit, next }: { quit: any; next: any }) => {
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [isTestFinished, setIsTestFinished] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false) // new state variable

  //   Is the random time used for the delay in the test, from 1 second to X
  const randomTime = 3

  const startTest = () => {
    setIsWaiting(true) // set waiting state to true
    setIsTestFinished(false)
    setReactionTime(null)
    const delay = Math.random() * randomTime * 1000 + 1000 // generates a random delay between 1-5 seconds
    setTimeout(() => {
      setIsWaiting(false) // set waiting state to false
      setIsTestRunning(true)
      setStartTime(Date.now())
    }, delay)
  }

  const endTest = () => {
    setIsTestRunning(false)
    if (startTime) {
      setReactionTime(Date.now() - startTime)
    }
    setIsTestFinished(true)
  }

  //   TODO USE MODAL INSTEAD:
  // TODO Tips, Modal.tsx
  // TODO use dialog

  return (
    <div className="w-full h-full fixed flex flex-col justify-center items-center text-center">
      <div className="w-full h-full bg-black fixed z-10 opacity-50"></div>
      <div
        className={`w-full h-full fixed z-[30] flex flex-col justify-center items-center p-4 ${
          isTestRunning ? "bg-red-500" : "bg-green-500"
        }`}
      >
        <div
          className={`flex flex-col justify-center items-center text-white cursor-pointer ${
            isTestRunning ? "bg-red-500" : "bg-green-500"
          }`}
          onClick={isTestRunning ? endTest : startTest}
        >
          {isTestRunning ? (
            <p className="text-2xl font-bold">Click anywhere now!</p>
          ) : isTestFinished ? (
            <>
              <p className="text-lg">Your reaction time was: {reactionTime}ms</p>
              <button onClick={quit} className="py-2 px-4 bg-gray-700 text-white rounded-lg mt-4">
                Quit
              </button>
              <button onClick={startTest} className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-4">
                Try Again
              </button>
              {reactionTime && reactionTime > 500 ? (
                <p className="text-red-500 mt-4">Sorry, you are too drunk</p>
              ) : (
                <button className="py-2 px-4 bg-yellow-500 text-white rounded-lg mt-4" onClick={next}>
                  Give penalty
                </button>
              )}
            </>
          ) : isWaiting ? (
            <p className="text-xl">Wait...</p>
          ) : (
            <p className="text-xl">Click anywhere to start the test</p>
          )}
        </div>
      </div>
    </div>
  )
}
export default AlcoholGame
