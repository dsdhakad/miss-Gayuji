/**
 * Configuration for "Just One Conversation" Journey
 * Centralizes recipient WhatsApp details, prefilled texts, audio and visual physics settings.
 */
export const CONFIG = {
  phone: "919202797157",
  whatsapp: {
    yesMessage: "Okay, we can meet once.",
    timeMessage: "I read everything. I just need some time."
  },
  audio: {
    src: "assets/audio/letter-theme.mp3",
    fadeDurationMs: 1400,
    targetVolume: 0.55,
    duckVolume: 0.15
  },
  visuals: {
    totalLevels: 6,
    petalCount: 16,
    orbGlowColor: "rgba(105, 166, 255, 0.4)"
  }
};
