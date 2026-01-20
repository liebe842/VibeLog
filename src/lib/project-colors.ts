// Project color presets (GitHub-inspired)
export const PROJECT_COLORS = {
  gray: {
    name: "Gray",
    bg: "bg-[#6e7681]",
    text: "text-[#6e7681]",
    border: "border-[#6e7681]",
    bgLight: "bg-[#6e7681]/10",
    hover: "hover:bg-[#6e7681]/20",
  },
  blue: {
    name: "Blue",
    bg: "bg-[#539bf5]",
    text: "text-[#539bf5]",
    border: "border-[#539bf5]",
    bgLight: "bg-[#539bf5]/10",
    hover: "hover:bg-[#539bf5]/20",
  },
  green: {
    name: "Green",
    bg: "bg-[#2ea043]",
    text: "text-[#2ea043]",
    border: "border-[#2ea043]",
    bgLight: "bg-[#2ea043]/10",
    hover: "hover:bg-[#2ea043]/20",
  },
  purple: {
    name: "Purple",
    bg: "bg-[#a371f7]",
    text: "text-[#a371f7]",
    border: "border-[#a371f7]",
    bgLight: "bg-[#a371f7]/10",
    hover: "hover:bg-[#a371f7]/20",
  },
  red: {
    name: "Red",
    bg: "bg-[#f85149]",
    text: "text-[#f85149]",
    border: "border-[#f85149]",
    bgLight: "bg-[#f85149]/10",
    hover: "hover:bg-[#f85149]/20",
  },
  yellow: {
    name: "Yellow",
    bg: "bg-[#d4a72c]",
    text: "text-[#d4a72c]",
    border: "border-[#d4a72c]",
    bgLight: "bg-[#d4a72c]/10",
    hover: "hover:bg-[#d4a72c]/20",
  },
  orange: {
    name: "Orange",
    bg: "bg-[#e0823d]",
    text: "text-[#e0823d]",
    border: "border-[#e0823d]",
    bgLight: "bg-[#e0823d]/10",
    hover: "hover:bg-[#e0823d]/20",
  },
  pink: {
    name: "Pink",
    bg: "bg-[#db61a2]",
    text: "text-[#db61a2]",
    border: "border-[#db61a2]",
    bgLight: "bg-[#db61a2]/10",
    hover: "hover:bg-[#db61a2]/20",
  },
} as const;

export type ProjectColor = keyof typeof PROJECT_COLORS;

export function getProjectColor(color: string) {
  return PROJECT_COLORS[color as ProjectColor] || PROJECT_COLORS.gray;
}

// Project icon presets
export const PROJECT_ICONS = [
  "📁", "💻", "🚀", "⚡", "🔥", "✨", "🎯", "📚",
  "🎨", "🛠️", "🌟", "💡", "🔧", "📦", "🎮", "🌈",
  "🎪", "🎭", "🎬", "🎵", "🎸", "🎹", "🎤", "🎧",
] as const;

export type ProjectIcon = typeof PROJECT_ICONS[number];
