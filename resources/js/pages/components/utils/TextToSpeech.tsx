import React, { useState, useRef } from 'react';

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const loopCountRef = useRef(0);
  const stoppedRef = useRef(false);

  const speak = () => {
    if (speaking || buttonDisabled) return;

    stoppedRef.current = false;
    // Jangan reset loopCountRef ke 0 lagi, supaya bisa lanjut dari iterasi terakhir
    // Tapi karena user stop bisa ulang dari iterasi ke-1, kita reset hanya kalau belum ada iterasi
    if (loopCountRef.current >= 2) {
      // Kalau sudah 2x selesai, tidak boleh speak lagi
      return;
    }
    setSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      loopCountRef.current += 1;

      if (stoppedRef.current) {
        setSpeaking(false);
        return;
      }

      if (loopCountRef.current < 2) {
        window.speechSynthesis.speak(utterance);
      } else {
        setSpeaking(false);
        setButtonDisabled(true);
      }
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!speaking) return;
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);

    // Set loopCount jadi 1 saat user stop, dianggap sudah iterasi 1
    loopCountRef.current = 1;
  };

  return (
    <div>
      <button
        onClick={speaking ? stop : speak}
        disabled={buttonDisabled}
        className={`px-4 py-2 rounded text-white ${
          speaking ? 'bg-red-600' : buttonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'
        }`}
      >
        {speaking ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default TextToSpeech;
