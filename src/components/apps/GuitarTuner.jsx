import { useState, useRef, useEffect } from 'react';

const guitarStrings = [
  { name: 'E', frequency: 82.41, color: 'bg-red-500', note: 'Low E (6th string)' },
  { name: 'A', frequency: 110.00, color: 'bg-orange-500', note: 'A (5th string)' },
  { name: 'D', frequency: 146.83, color: 'bg-yellow-500', note: 'D (4th string)' },
  { name: 'G', frequency: 196.00, color: 'bg-green-500', note: 'G (3rd string)' },
  { name: 'B', frequency: 246.94, color: 'bg-blue-500', note: 'B (2nd string)' },
  { name: 'E', frequency: 329.63, color: 'bg-purple-500', note: 'High E (1st string)' },
];

export default function GuitarTuner() {
  const [activeString, setActiveString] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    }

    // Cleanup on unmount
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, []);

  const playTone = (frequency, stringIndex) => {
    if (!audioContextRef.current) return;

    // Stop any currently playing tone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    // Resume audio context if suspended (required by browsers)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Create oscillator
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    // Connect nodes
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Configure oscillator
    oscillatorRef.current.frequency.value = frequency;
    oscillatorRef.current.type = 'sine';

    // Configure gain (volume)
    gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
    gainNodeRef.current.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2);

    // Start playing
    oscillatorRef.current.start();
    oscillatorRef.current.stop(audioContextRef.current.currentTime + 2);

    setActiveString(stringIndex);
    setIsPlaying(true);

    // Reset state after tone ends
    setTimeout(() => {
      setActiveString(null);
      setIsPlaying(false);
    }, 2000);
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      setActiveString(null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-600 mb-2">🎵 Guitar Tuner</h2>
        <p className="text-gray-600">Click each string to hear its tuning note</p>
      </div>

      {/* Guitar Neck Visualization */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 rounded-xl border-2 border-amber-200 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-gray-800">Standard Tuning</h3>
          <p className="text-sm text-gray-600">From thickest to thinnest string</p>
        </div>

        <div className="space-y-4">
          {guitarStrings.map((string, index) => {
            const isActive = activeString === index;
            return (
              <div key={index} className="relative">
                {/* String */}
                <div 
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? `${string.color} shadow-lg animate-pulse` 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => playTone(string.frequency, index)}
                />
                
                {/* String Info */}
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${string.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {string.name}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{string.note}</div>
                      <div className="text-xs text-gray-500">{string.frequency.toFixed(1)} Hz</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => playTone(string.frequency, index)}
                    disabled={isPlaying && activeString === index}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                    }`}
                  >
                    {isActive ? '🔊 Playing' : '▶️ Play'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => {
            guitarStrings.forEach((string, index) => {
              setTimeout(() => playTone(string.frequency, index), index * 500);
            });
          }}
          disabled={isPlaying}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎼 Play All Strings
        </button>
        
        <button
          onClick={stopTone}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          ⏹️ Stop
        </button>
      </div>

      {/* Tuning Tips */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-2">🎯 Tuning Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Listen carefully</strong> - Match your guitar string to the reference tone</li>
          <li>• <strong>Turn slowly</strong> - Small adjustments make big differences</li>
          <li>• <strong>Tune up</strong> - Always tune from below the target pitch</li>
          <li>• <strong>Check twice</strong> - Tuning one string affects the others slightly</li>
        </ul>
      </div>

      {/* Browser Compatibility Note */}
      {typeof window !== 'undefined' && !window.AudioContext && !window.webkitAudioContext && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Audio playback requires a modern browser with Web Audio API support.
          </p>
        </div>
      )}
    </div>
  );
} 