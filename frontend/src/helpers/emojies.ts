const emojis = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🥺",
  "😍",
  "😘",
  "😋",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "😎",
  "🤓",
  "😠",
  "😡",
  "🤬",
  "😢",
  "😭",
  "😤",
  "😩",
  "😪",
  "🥱",
  "😏",
  "😌",
  "😓",
  "😖",
  "😞",
  "😟",
  "😤",
  "😢",
  "😭",
  "🥴",
  "🤯",
  "🤠",
  "🥳",
  "😇",
  "🥰",
  "😕",
  "😑",
  "😒",
  "🙄",
  "🤥",
  "🤔",
  "🤫",
  "🤭",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🥵",
  "🥶",
  "🥴",
  "🤠",
  "👀",
  "👁️",
  "👄",
  "👅",
  "👋",
  "🤚",
  "🖐️",
  "✋",
  "🖖",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "💪",
  "🙏",
  "💃",
  "🕺",
  "🚶",
  "🧍",
  "🧎",
  "🧏",
  "🧑",
  "👨",
  "👩",
  "🧓",
  "👴",
  "👵",
  "👶",
  "🧒",
  "👦",
  "👧",
  "🧔",
  "🦸",
  "🦹",
  "🧙",
  "🧚",
  "🧜",
  "🧝",
]

const simpleHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

export const textToEmoji = (text: string) => {
  const hash = simpleHash(text)
  return emojis[Math.abs(hash) % emojis.length]
}
