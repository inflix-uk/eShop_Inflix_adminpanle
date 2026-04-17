/**
 * Notification Sound Utility
 * Plays notification sound when new messages are received
 */

let audio = null;

/**
 * Initialize the audio element
 */
const initializeAudio = () => {
  if (!audio) {
    audio = new Audio('/notification.wav');
    audio.volume = 0.5; // Set volume to 50%
  }
  return audio;
};

/**
 * Play notification sound
 * @param {boolean} force - Force play even if user hasn't interacted (may be blocked by browser)
 */
export const playNotificationSound = async (force = false) => {
  try {
    const audioElement = initializeAudio();

    // Reset audio to beginning
    audioElement.currentTime = 0;

    // Play the sound
    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      await playPromise;
    }
  } catch (error) {
    // Browser may block autoplay - this is expected
    if (!force) {
      console.log('Notification sound blocked by browser. User interaction required.');
    } else {
      console.error('Error playing notification sound:', error);
    }
  }
};

/**
 * Set notification sound volume
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export const setNotificationVolume = (volume) => {
  const audioElement = initializeAudio();
  audioElement.volume = Math.max(0, Math.min(1, volume));
};
