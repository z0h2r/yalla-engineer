import { useState, useEffect, useRef } from 'react';

// Metronome sound configurations
const metronomeTypes = {
  classic: {
    name: '🎯 Classic',
    description: 'Traditional metronome click',
    frequency: 1000,
    waveform: 'square',
    attack: 0.01,
    decay: 0.1,
    volume: 0.3
  },
  wood: {
    name: '🪵 Wood Block',
    description: 'Warm wooden percussion',
    frequency: 800,
    waveform: 'triangle',
    attack: 0.005,
    decay: 0.15,
    volume: 0.4
  },
  bell: {
    name: '🔔 Bell',
    description: 'Pleasant bell chime',
    frequency: 1200,
    waveform: 'sine',
    attack: 0.01,
    decay: 0.3,
    volume: 0.25
  },
  digital: {
    name: '💫 Digital',
    description: 'Modern electronic beep',
    frequency: 1500,
    waveform: 'sawtooth',
    attack: 0.005,
    decay: 0.08,
    volume: 0.35
  },
  soft: {
    name: '🌙 Soft',
    description: 'Gentle, muted click',
    frequency: 600,
    waveform: 'sine',
    attack: 0.02,
    decay: 0.2,
    volume: 0.2
  },
  pop: {
    name: '🎈 Pop',
    description: 'Crisp pop sound',
    frequency: 2000,
    waveform: 'square',
    attack: 0.003,
    decay: 0.05,
    volume: 0.3
  }
};

// Common BPM presets with detailed explanations
const bpmPresets = [
  { 
    name: 'Largo', 
    bpm: 60, 
    description: 'Very slow',
    explanation: 'Largo (Italian for "broad") is one of the slowest tempo markings in classical music. It creates a sense of grandeur and solemnity. Famous examples include the "Largo" movement from Dvořák\'s New World Symphony and Handel\'s "Ombra mai fu" (Largo from Xerxes).',
    range: '40-66 BPM',
    mood: 'Majestic, solemn, deeply expressive'
  },
  { 
    name: 'Adagio', 
    bpm: 80, 
    description: 'Slow',
    explanation: 'Adagio (Italian for "at ease") indicates a slow, leisurely tempo that allows for expressive, lyrical playing. It\'s often used in the slow movements of symphonies and sonatas. Mozart\'s Piano Sonata K.331 and Barber\'s famous "Adagio for Strings" are beautiful examples.',
    range: '66-76 BPM',
    mood: 'Relaxed, expressive, contemplative'
  },
  { 
    name: 'Andante', 
    bpm: 100, 
    description: 'Walking pace',
    explanation: 'Andante (Italian for "walking") suggests a comfortable, natural walking pace. It\'s neither rushed nor dragging, making it perfect for melodies that need to breathe. Think of Mozart\'s "Andante" from Piano Sonata K.331 or the second movement of Beethoven\'s Symphony No. 5.',
    range: '76-108 BPM',
    mood: 'Flowing, natural, comfortable'
  },
  { 
    name: 'Moderato', 
    bpm: 120, 
    description: 'Moderate',
    explanation: 'Moderato (Italian for "moderate") is a balanced, middle-ground tempo that\'s neither fast nor slow. It\'s the most common tempo for many classical pieces and popular songs. This tempo allows for both clarity in fast passages and expression in lyrical sections.',
    range: '108-120 BPM',
    mood: 'Balanced, steady, versatile'
  },
  { 
    name: 'Allegro', 
    bpm: 140, 
    description: 'Fast',
    explanation: 'Allegro (Italian for "cheerful" or "lively") indicates a fast, energetic tempo. It\'s commonly used in first and final movements of classical works. Mozart\'s "Eine kleine Nachtmusik" and Beethoven\'s "Ode to Joy" are famous Allegro pieces that showcase its bright, spirited character.',
    range: '120-168 BPM',
    mood: 'Cheerful, lively, energetic'
  },
  { 
    name: 'Presto', 
    bpm: 180, 
    description: 'Very fast',
    explanation: 'Presto (Italian for "quickly") is one of the fastest tempo markings, demanding virtuosic skill and precision. It creates excitement and showcases technical brilliance. Chopin\'s "Minute Waltz" and the finale of Mozart\'s Symphony No. 41 "Jupiter" demonstrate Presto\'s thrilling energy.',
    range: '168-200 BPM',
    mood: 'Exciting, virtuosic, brilliant'
  }
];

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState('classic');
  const [volume, setVolume] = useState(0.7);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Refs for precise timing
  const audioContextRef = useRef(null);
  const nextBeatTimeRef = useRef(0);
  const timerIdRef = useRef(null);
  const beatCountRef = useRef(0);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create metronome sound
  const playMetronomeSound = (when = 0) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const soundConfig = metronomeTypes[selectedSound];
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Add some harmonics for richer sound
    const harmonic = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    
    oscillator.type = soundConfig.waveform;
    oscillator.frequency.setValueAtTime(soundConfig.frequency, when);
    
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(soundConfig.frequency * 2, when);
    
    // Main sound envelope
    gainNode.gain.setValueAtTime(0, when);
    gainNode.gain.linearRampToValueAtTime(soundConfig.volume * volume, when + soundConfig.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, when + soundConfig.decay);
    
    // Harmonic envelope (softer)
    harmonicGain.gain.setValueAtTime(0, when);
    harmonicGain.gain.linearRampToValueAtTime(soundConfig.volume * volume * 0.3, when + soundConfig.attack);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, when + soundConfig.decay * 0.7);
    
    // Connect audio nodes
    oscillator.connect(gainNode);
    harmonic.connect(harmonicGain);
    gainNode.connect(audioContext.destination);
    harmonicGain.connect(audioContext.destination);
    
    // Start and stop
    oscillator.start(when);
    harmonic.start(when);
    oscillator.stop(when + soundConfig.decay);
    harmonic.stop(when + soundConfig.decay * 0.7);
  };

  // Precise metronome scheduler
  const scheduler = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Look ahead time (100ms)
    const lookAhead = 100.0;
    const scheduleAheadTime = 0.1;

    while (nextBeatTimeRef.current < audioContext.currentTime + scheduleAheadTime) {
      playMetronomeSound(nextBeatTimeRef.current);
      
      // Update beat counter for visual feedback
      beatCountRef.current = (beatCountRef.current + 1) % 4;
      setCurrentBeat(beatCountRef.current);
      
      // Calculate next beat time
      const secondsPerBeat = 60.0 / bpm;
      nextBeatTimeRef.current += secondsPerBeat;
    }

    timerIdRef.current = setTimeout(scheduler, lookAhead);
  };

  // Start/stop metronome
  const toggleMetronome = () => {
    if (!isPlaying) {
      // Start
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      nextBeatTimeRef.current = audioContext.currentTime;
      beatCountRef.current = 0;
      setCurrentBeat(0);
      scheduler();
      setIsPlaying(true);
    } else {
      // Stop
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  // BPM input handler
  const handleBpmChange = (newBpm) => {
    const clampedBpm = Math.max(30, Math.min(300, newBpm));
    setBpm(clampedBpm);
  };

  // Dialog handlers
  const openDialog = (preset) => {
    setSelectedPreset(preset);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPreset(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Main Metronome Display */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 mb-8 border border-slate-700">
        
        {/* BPM Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-black text-white mb-2 font-mono tracking-wider">
            {bpm}
          </div>
          <div className="text-xl text-slate-300 font-semibold">BPM</div>
        </div>

        {/* Visual Beat Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-3">
            {[0, 1, 2, 3].map((beat) => (
              <div
                key={beat}
                className={`w-4 h-4 rounded-full transition-all duration-100 ${
                  currentBeat === beat && isPlaying
                    ? 'bg-green-400 shadow-lg shadow-green-400/50 scale-125'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Play/Stop Button */}
        <div className="text-center mb-8">
          <button
            onClick={toggleMetronome}
            className={`w-24 h-24 rounded-full font-bold transition-all duration-300 shadow-2xl border-4 ${
              isPlaying
                ? 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-red-300 shadow-red-500/40 hover:scale-105'
                : 'bg-gradient-to-br from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 border-blue-300 shadow-blue-500/40 hover:scale-110'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-center justify-center">
                <div className="w-3 h-8 bg-white rounded-sm mr-1"></div>
                <div className="w-3 h-8 bg-white rounded-sm"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center ml-1">
                <div 
                  className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"
                ></div>
              </div>
            )}
          </button>
        </div>

        {/* BPM Controls */}
        <div className="mb-6 space-y-4">
          {/* Slider */}
          <div className="flex justify-center">
            <input
              type="range"
              min="30"
              max="300"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="w-full max-w-xs h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          {/* Button Controls */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleBpmChange(bpm - 10)}
                className="w-14 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
              >
                -10
              </button>
              <button
                onClick={() => handleBpmChange(bpm - 1)}
                className="w-12 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
              >
                -1
              </button>
            </div>
            
            <div className="mx-4 px-4 py-2 bg-slate-800 rounded-lg border border-slate-600">
              <span className="text-white font-mono text-lg font-bold">{bpm}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleBpmChange(bpm + 1)}
                className="w-12 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => handleBpmChange(bpm + 10)}
                className="w-14 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-4">
          <span className="text-slate-300 font-semibold">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-slate-300 font-semibold text-sm w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Sound Selection */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-8">
        <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">🎵 Choose Your Sound</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(metronomeTypes).map(([key, sound]) => (
            <button
              key={key}
              onClick={() => setSelectedSound(key)}
              className={`p-4 rounded-xl transition-all duration-200 text-left ${
                selectedSound === key
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-bold text-lg mb-1">{sound.name}</div>
              <div className={`text-sm ${selectedSound === key ? 'text-blue-100' : 'text-gray-500'}`}>
                {sound.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BPM Presets */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">🎼 Tempo Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {bpmPresets.map((preset) => (
            <div key={preset.name} className="relative">
              <button
                onClick={() => handleBpmChange(preset.bpm)}
                className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                  bpm === preset.bpm
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-bold text-lg mb-1">{preset.name}</div>
                <div className={`text-sm mb-1 ${bpm === preset.bpm ? 'text-purple-100' : 'text-gray-600'}`}>
                  {preset.bpm} BPM
                </div>
                <div className={`text-xs ${bpm === preset.bpm ? 'text-purple-200' : 'text-gray-500'}`}>
                  {preset.description}
                </div>
              </button>
              
              {/* WTF Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDialog(preset);
                }}
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-black transition-all duration-200 hover:scale-125 hover:rotate-12 shadow-lg ${
                  bpm === preset.bpm
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600 shadow-purple-300'
                    : 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 shadow-orange-300'
                }`}
                title={`WTF is ${preset.name}?`}
              >
                wtf
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && selectedPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black mb-2">{selectedPreset.name}</h2>
                  <div className="flex items-center gap-4 text-purple-100">
                    <span className="text-lg font-semibold">{selectedPreset.bpm} BPM</span>
                    <span className="text-sm bg-purple-400 px-3 py-1 rounded-full">
                      {selectedPreset.range}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDialog}
                  className="text-white hover:text-purple-200 transition-colors text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">What is {selectedPreset.name}?</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {selectedPreset.explanation}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-800 mb-2">📊 Typical Range</h4>
                  <p className="text-blue-700">{selectedPreset.range}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 mb-2">🎭 Musical Mood</h4>
                  <p className="text-green-700">{selectedPreset.mood}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleBpmChange(selectedPreset.bpm);
                    closeDialog();
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Set to {selectedPreset.bpm} BPM
                </button>
                <button
                  onClick={closeDialog}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 