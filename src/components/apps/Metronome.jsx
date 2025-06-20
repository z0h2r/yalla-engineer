import { useState, useEffect, useRef } from 'react';

// Create simple audio data URLs for fallback (beep sounds)
const createBeepDataUrl = (frequency, duration = 0.1) => {
  const sampleRate = 8000;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);
  
  // Generate beep
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 10);
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [useWebAudio, setUseWebAudio] = useState(true);
  const audioElementRef = useRef(null);
  
  // Refs for precise timing
  const audioContextRef = useRef(null);
  const nextBeatTimeRef = useRef(0);
  const timerIdRef = useRef(null);
  const beatCountRef = useRef(0);

  // Initialize audio context
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      setIsLoaded(true);
      
      // Check if Web Audio API is supported
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.log('Web Audio API not supported, using HTML5 Audio fallback');
        setUseWebAudio(false);
        
        // Create fallback audio element
        const audio = new Audio();
        const soundConfig = metronomeTypes[selectedSound];
        const audioUrl = createBeepDataUrl(soundConfig.frequency, 0.1);
        audio.src = audioUrl;
        audio.preload = 'auto';
        audioElementRef.current = audio;
        
        setAudioEnabled(true);
        return;
      }
      
      console.log('Web Audio API is supported');
      
      // Don't create audio context on initial load for mobile - wait for user interaction
      // This prevents issues with autoplay policies
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        URL.revokeObjectURL(audioElementRef.current.src);
      }
    };
  }, []);

  // Update fallback audio when sound type changes
  useEffect(() => {
    if (!useWebAudio && audioElementRef.current) {
      const soundConfig = metronomeTypes[selectedSound];
      const audioUrl = createBeepDataUrl(soundConfig.frequency, 0.1);
      URL.revokeObjectURL(audioElementRef.current.src);
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.preload = 'auto';
    }
  }, [selectedSound, useWebAudio]);

  // Create metronome sound (Web Audio API version)
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

  // Fallback audio using HTML5 Audio (for browsers without Web Audio API)
  const playFallbackSound = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.volume = volume;
      audioElementRef.current.play().catch(error => {
        console.error('Failed to play fallback audio:', error);
      });
    }
  };

  // Precise metronome scheduler (Web Audio API version)
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

  // Simple fallback scheduler (HTML5 Audio version)
  const fallbackScheduler = () => {
    playFallbackSound();
    
    // Update beat counter for visual feedback
    beatCountRef.current = (beatCountRef.current + 1) % 4;
    setCurrentBeat(beatCountRef.current);
    
    // Calculate next beat time (less precise but works)
    const millisecondsPerBeat = (60.0 / bpm) * 1000;
    timerIdRef.current = setTimeout(fallbackScheduler, millisecondsPerBeat);
  };

  // Start/stop metronome
  const toggleMetronome = async () => {
    console.log('Toggle metronome clicked, isPlaying:', isPlaying);
    setAudioError(null);
    
    if (!isPlaying) {
      try {
        if (useWebAudio) {
          // Web Audio API path
          const audioInitialized = await initializeAudio();
          if (!audioInitialized) {
            setAudioError('Failed to initialize audio. Please try again.');
            console.error('Failed to initialize audio');
            return;
          }
          
          const audioContext = audioContextRef.current;
          
          // Double-check audio context is running
          if (audioContext.state !== 'running') {
            setAudioError(`Audio context not ready (${audioContext.state}). Please try again.`);
            console.error('Audio context not running, state:', audioContext.state);
            return;
          }
          
          nextBeatTimeRef.current = audioContext.currentTime;
          beatCountRef.current = 0;
          setCurrentBeat(0);
          scheduler();
          setIsPlaying(true);
          console.log('Metronome started successfully with Web Audio API');
        } else {
          // HTML5 Audio fallback path
          if (!audioElementRef.current) {
            setAudioError('Audio not ready. Please try again.');
            return;
          }
          
          beatCountRef.current = 0;
          setCurrentBeat(0);
          fallbackScheduler();
          setIsPlaying(true);
          console.log('Metronome started successfully with HTML5 Audio fallback');
        }
      } catch (error) {
        setAudioError('Error starting metronome: ' + error.message);
        console.error('Error in toggleMetronome:', error);
      }
    } else {
      // Stop
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      setIsPlaying(false);
      setCurrentBeat(0);
      console.log('Metronome stopped');
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

  // Initialize audio on first user interaction (mobile requirement)
  const initializeAudio = async () => {
    console.log('Initializing audio...');
    
    try {
      // Create or get audio context
      let audioContext = audioContextRef.current;
      
      if (!audioContext) {
        console.log('Creating new audio context...');
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.error('AudioContext not supported in this browser');
          return false;
        }
        
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        console.log('New audio context created, state:', audioContext.state);
      }
      
      console.log('Current audio context state:', audioContext.state);
      
      // For mobile browsers, we need to resume the context
      if (audioContext.state === 'suspended') {
        console.log('Attempting to resume suspended audio context...');
        try {
          await audioContext.resume();
          console.log('Audio context resume called, new state:', audioContext.state);
          
          // Give it some time to actually resume
          let attempts = 0;
          while (audioContext.state !== 'running' && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
            console.log(`Attempt ${attempts}: Audio context state:`, audioContext.state);
          }
          
          if (audioContext.state !== 'running') {
            console.error('Audio context failed to resume after multiple attempts');
            return false;
          }
        } catch (resumeError) {
          console.error('Failed to resume audio context:', resumeError);
          return false;
        }
      }
      
      // Final verification
      if (audioContext.state !== 'running') {
        console.error('Audio context is not running. Current state:', audioContext.state);
        return false;
      }
      
      console.log('Audio context is running! Testing audio capabilities...');
      
      // Test audio by creating a very brief, silent oscillator
      try {
        const testOscillator = audioContext.createOscillator();
        const testGain = audioContext.createGain();
        
        testGain.gain.setValueAtTime(0, audioContext.currentTime);
        testOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        
        testOscillator.connect(testGain);
        testGain.connect(audioContext.destination);
        
        testOscillator.start(audioContext.currentTime);
        testOscillator.stop(audioContext.currentTime + 0.001);
        
        console.log('Audio test successful - oscillator created and scheduled');
      } catch (testError) {
        console.error('Audio test failed:', testError);
        return false;
      }
      
      setAudioEnabled(true);
      console.log('✅ Audio fully initialized and ready!');
      return true;
      
    } catch (error) {
      console.error('❌ Audio initialization failed with error:', error);
      return false;
    }
  };

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

  // Show loading state until component is ready
  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 mb-8 border border-slate-700">
          <div className="text-center">
            <div className="text-6xl font-black text-white mb-2 font-mono tracking-wider animate-pulse">
              120
            </div>
            <div className="text-xl text-slate-300 font-semibold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      
      {/* Main Metronome Display */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 mb-8 border border-slate-700">
        
        {/* BPM Display */}
        <div className="text-center mb-8">
          <div className="text-5xl sm:text-6xl font-black text-white mb-2 font-mono tracking-wider">
            {bpm}
          </div>
          <div className="text-lg sm:text-xl text-slate-300 font-semibold">BPM</div>
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
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full font-bold transition-all duration-300 shadow-2xl border-4 touch-manipulation ${
              isPlaying
                ? 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-red-300 shadow-red-500/40 hover:scale-105'
                : !audioEnabled
                ? 'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 border-orange-300 shadow-orange-500/40 hover:scale-110'
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
          {!audioEnabled && !audioError && (
            <p className="text-slate-400 text-sm mt-2">
              Tap to enable audio
            </p>
          )}
          {audioError && (
            <div className="mt-2 max-w-xs mx-auto">
              <p className="text-red-400 text-sm mb-2">
                {audioError}
              </p>
              <button
                onClick={async () => {
                  setAudioError(null);
                  // Force recreate audio context
                  if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                  }
                  const success = await initializeAudio();
                  if (!success) {
                    setAudioError('Audio still not working. Your browser may not support Web Audio API.');
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-lg transition-colors touch-manipulation"
              >
                Try Again
              </button>
            </div>
          )}
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
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-0">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => handleBpmChange(bpm - 10)}
                className="w-12 sm:w-14 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs sm:text-sm transition-colors touch-manipulation"
              >
                -10
              </button>
              <button
                onClick={() => handleBpmChange(bpm - 1)}
                className="w-10 sm:w-12 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs sm:text-sm transition-colors touch-manipulation"
              >
                -1
              </button>
            </div>
            
            <div className="mx-2 sm:mx-4 px-3 sm:px-4 py-2 bg-slate-800 rounded-lg border border-slate-600">
              <span className="text-white font-mono text-base sm:text-lg font-bold">{bpm}</span>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => handleBpmChange(bpm + 1)}
                className="w-10 sm:w-12 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs sm:text-sm transition-colors touch-manipulation"
              >
                +1
              </button>
              <button
                onClick={() => handleBpmChange(bpm + 10)}
                className="w-12 sm:w-14 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs sm:text-sm transition-colors touch-manipulation"
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
        <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">
          🎵 Choose Your Sound
          {!useWebAudio && (
            <span className="text-sm font-normal text-orange-600 block mt-1">
              (Using fallback audio - limited sound options)
            </span>
          )}
        </h3>
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