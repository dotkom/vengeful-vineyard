import { BetType } from "../BettingModal"

// Red numbers on European roulette wheel
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// European roulette numbers in wheel order
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26,
]

// Number of segments on European roulette wheel (0-36)
export const ROULETTE_SEGMENT_COUNT = WHEEL_NUMBERS.length

// Spin animation constants
export const MIN_EXTRA_SPINS = 5
export const MAX_EXTRA_SPINS = 8

// Preset colors for wheel segments
export const PRESET_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#8b5cf6",
  "#6366f1",
  "#22c55e",
  "#10b981",
  "#ef4444",
  "#dc2626",
  "#f59e0b",
  "#3b82f6",
]

// Segment colors for person wheel
export const SEGMENT_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#6366f1",
  "#8b5cf6",
  "#2563eb",
  "#3b82f6",
  "#0891b2",
  "#06b6d4",
  "#059669",
  "#10b981",
  "#d97706",
  "#f59e0b",
  "#dc2626",
  "#ef4444",
  "#db2777",
  "#ec4899",
]

export const getNumberColor = (num: number): "red" | "black" | "green" => {
  if (num === 0) return "green"
  return RED_NUMBERS.includes(num) ? "red" : "black"
}

export const getBetLabel = (bet: BetType): string => {
  switch (bet.type) {
    case "number":
      return `#${bet.value}`
    case "color":
      return bet.value === "red" ? "Rød" : "Svart"
    case "evenOdd":
      return bet.value === "even" ? "Partall" : "Oddetall"
    case "highLow":
      return bet.value === "low" ? "1-18" : "19-36"
    case "dozen":
      return `Dusin ${bet.value}`
  }
}

export const getPayoutMultiplier = (bet: BetType): number => {
  switch (bet.type) {
    case "number":
      return 35
    case "color":
      return 1
    case "evenOdd":
      return 1
    case "highLow":
      return 1
    case "dozen":
      return 2
  }
}

export const calculateWinnings = (bet: BetType, stake: number): number => {
  return stake * getPayoutMultiplier(bet)
}

export const checkWin = (bet: BetType, resultNum: number): boolean => {
  if (resultNum === 0) return bet.type === "number" && bet.value === 0

  switch (bet.type) {
    case "number":
      return bet.value === resultNum
    case "color":
      return getNumberColor(resultNum) === bet.value
    case "evenOdd":
      return bet.value === "even" ? resultNum % 2 === 0 : resultNum % 2 === 1
    case "highLow":
      return bet.value === "low" ? resultNum <= 18 : resultNum >= 19
    case "dozen":
      if (bet.value === 1) return resultNum >= 1 && resultNum <= 12
      if (bet.value === 2) return resultNum >= 13 && resultNum <= 24
      return resultNum >= 25 && resultNum <= 36
  }
}

// Generate conic gradient for roulette wheel
export const generateRouletteGradient = () => {
  const segmentAngle = 360 / ROULETTE_SEGMENT_COUNT
  const stops: string[] = []

  WHEEL_NUMBERS.forEach((num, i) => {
    const color = getNumberColor(num)
    const colorHex = color === "red" ? "#dc2626" : color === "black" ? "#1f2937" : "#16a34a"
    const startAngle = i * segmentAngle
    const endAngle = (i + 1) * segmentAngle
    stops.push(`${colorHex} ${startAngle}deg ${endAngle}deg`)
  })

  return `conic-gradient(from -${segmentAngle / 2}deg, ${stops.join(", ")})`
}
