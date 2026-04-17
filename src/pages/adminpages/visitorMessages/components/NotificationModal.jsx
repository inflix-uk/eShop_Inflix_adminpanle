import { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Bell, X, MessageSquare } from "lucide-react";

// Request notification permission on module load
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

export default function NotificationModal({
  isOpen,
  onClose,
  visitorName,
  message,
  onViewMessage,
  isNewUser = false, // New prop: true = new user (loop sound), false = returning user (single sound)
}) {
  const audioRef = useRef(null);
  const notificationRef = useRef(null);

  // Play notification sound
  const playSound = useCallback(() => {
    try {
      // Stop any existing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Different sound and behavior based on user type
      // New user: continuous ringing with visiterMessage.mp3
      // Returning user: single notification with notification.wav
      const soundFile = isNewUser ? "/visiterMessage.mp3" : "/notification.wav";

      audioRef.current = new Audio(soundFile);
      audioRef.current.loop = isNewUser; // Only loop for new users
      audioRef.current.volume = 1.0;

      // Try to play - may fail due to autoplay restrictions
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🔊 Notification sound playing (${isNewUser ? 'NEW USER - looping' : 'RETURNING USER - single'})!`);
          })
          .catch((err) => {
            console.log("⚠️ Audio autoplay blocked:", err.message);
            // Audio blocked - user needs to interact with page first
            // The modal will still show, user can click to acknowledge
          });
      }
    } catch (err) {
      console.log("Audio error:", err);
    }
  }, [isNewUser]);

  // Show browser notification (works even when tab is in background)
  const showBrowserNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        notificationRef.current = new Notification("New Visitor Message!", {
          body: `${visitorName || "Visitor"}: ${message || "Sent you a message"}`,
          icon: "/favicon.ico",
          tag: "visitor-message", // Prevents duplicate notifications
          requireInteraction: true, // Keeps notification visible until user interacts
        });

        notificationRef.current.onclick = () => {
          window.focus();
          onViewMessage();
          notificationRef.current.close();
        };
      } catch (err) {
        console.log("Browser notification error:", err);
      }
    }
  }, [visitorName, message, onViewMessage]);

  useEffect(() => {
    if (isOpen) {
      console.log("🔔 NotificationModal opened - Playing sound and showing notification");
      // Play sound
      playSound();

      // Show browser notification (for background tabs)
      showBrowserNotification();
    }

    return () => {
      // Stop audio when modal closes or component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      // Close browser notification
      if (notificationRef.current) {
        notificationRef.current.close();
        notificationRef.current = null;
      }
    };
  }, [isOpen, playSound, showBrowserNotification]);

  // Try to play sound when user interacts (click unlocks audio)
  const tryPlaySound = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => {
        console.log("🔊 Sound started playing after user interaction");
      }).catch(() => {});
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  };

  const handleViewMessage = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onViewMessage();
  };

  // When modal is open, any click on the modal will try to play sound
  const handleModalClick = () => {
    tryPlaySound();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal - click anywhere to start sound if blocked */}
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-bounce-in"
        onClick={handleModalClick}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Header with animated bell */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-ring">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">New Message!</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {visitorName ? visitorName.charAt(0).toUpperCase() : "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">
                {visitorName || "Visitor"}
              </p>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {message || "Sent you a message"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleViewMessage}
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              View Message
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes ring {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: rotate(-15deg);
          }
          20%, 40%, 60%, 80% {
            transform: rotate(15deg);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }

        .animate-ring {
          animation: ring 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  visitorName: PropTypes.string,
  message: PropTypes.string,
  onViewMessage: PropTypes.func.isRequired,
  isNewUser: PropTypes.bool,
};

NotificationModal.defaultProps = {
  visitorName: "Visitor",
  message: "",
  isNewUser: false,
};
