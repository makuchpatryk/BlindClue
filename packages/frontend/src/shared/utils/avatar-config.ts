export const AVATAR_STYLES = [
  "avatar-001",
  "avatar-002",
  "avatar-003",
  "avatar-004",
  "avatar-005",
  "avatar-006",
  "avatar-007",
  "avatar-008",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

const DICEBEAR_STYLE_MAP: Record<AvatarStyle, string> = {
  "avatar-001": "adventurer",
  "avatar-002": "avataaars",
  "avatar-003": "big-ears",
  "avatar-004": "big-smile",
  "avatar-005": "croodles",
  "avatar-006": "fun-emoji",
  "avatar-007": "pixel-art",
  "avatar-008": "personas",
};

export function getAvatarUrl(avatarId: AvatarStyle): string {
  const style = DICEBEAR_STYLE_MAP[avatarId] || "avataaars";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${avatarId}`;
}

export function isValidAvatarId(id: string): id is AvatarStyle {
  return AVATAR_STYLES.includes(id as AvatarStyle);
}
