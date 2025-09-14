export const DANCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '⭐' },
  { value: 'advanced', label: 'Advanced', emoji: '🔥' },
  { value: 'expert', label: 'Expert', emoji: '👑' }
] as const;

export type DanceLevel = typeof DANCE_LEVELS[number]['value']; 