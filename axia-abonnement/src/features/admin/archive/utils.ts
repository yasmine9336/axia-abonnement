export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-sky-100 text-sky-700",
  "bg-blue-100 text-blue-700",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export function avatarColor(name: string) {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}