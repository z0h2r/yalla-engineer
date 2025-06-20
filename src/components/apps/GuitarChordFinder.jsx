import { useState } from 'react';

const chordData = {
  'C': { frets: [0, 1, 0, 2, 1, 0], fingers: ['', '1', '', '2', '1', ''] },
  'G': { frets: [3, 2, 0, 0, 3, 3], fingers: ['3', '2', '', '', '4', '4'] },
  'Am': { frets: [0, 0, 2, 2, 1, 0], fingers: ['', '', '2', '3', '1', ''] },
  'F': { frets: [1, 1, 3, 3, 2, 1], fingers: ['1', '1', '3', '4', '2', '1'] },
  'D': { frets: [2, 0, 0, 2, 3, 2], fingers: ['1', '', '', '2', '3', '4'] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: ['', '2', '3', '', '', ''] },
  'A': { frets: [0, 0, 2, 2, 2, 0], fingers: ['', '', '1', '2', '3', ''] },
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: ['', '2', '3', '1', '', ''] },
};

const strings = ['E', 'A', 'D', 'G', 'B', 'E'];

export default function GuitarChordFinder() {
  const [selectedChord, setSelectedChord] = useState('C');
  const [showFingers, setShowFingers] = useState(true);

  const chord = chordData[selectedChord];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-600 mb-2">🎸 Guitar Chord Finder</h2>
        <p className="text-gray-600">Select a chord to see the fingering pattern</p>
      </div>

      {/* Chord Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(chordData).map((chordName) => (
            <button
              key={chordName}
              onClick={() => setSelectedChord(chordName)}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                selectedChord === chordName
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {chordName}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowFingers(!showFingers)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
        >
          <span className="text-sm font-semibold">
            {showFingers ? 'Hide Fingers' : 'Show Fingers'}
          </span>
          <span className="text-lg">{showFingers ? '👋' : '🤚'}</span>
        </button>
      </div>

      {/* Guitar Neck */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 rounded-xl border-2 border-amber-200">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-black text-gray-800">{selectedChord}</h3>
          <p className="text-sm text-gray-600">Chord Diagram</p>
        </div>

        {/* Fretboard */}
        <div className="relative">
          {/* String labels */}
          <div className="flex justify-between mb-2 px-4">
            {strings.map((string, index) => (
              <div key={index} className="text-sm font-bold text-gray-600 w-8 text-center">
                {string}
              </div>
            ))}
          </div>

          {/* Frets */}
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((fret) => (
              <div key={fret} className="relative">
                {/* Fret line */}
                <div className={`h-1 bg-gray-400 rounded ${fret === 0 ? 'h-2 bg-gray-600' : ''}`}></div>
                
                {/* Dots for finger positions */}
                <div className="flex justify-between absolute -top-4 left-0 right-0 px-4">
                  {chord.frets.map((chordFret, stringIndex) => {
                    const isActive = chordFret === fret && fret > 0;
                    const isOpen = chordFret === 0 && fret === 0;
                    const isMuted = chordFret === -1 && fret === 0;
                    
                    return (
                      <div key={stringIndex} className="w-8 h-8 flex items-center justify-center">
                        {isActive && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            {showFingers && (
                              <span className="text-white text-xs font-bold">
                                {chord.fingers[stringIndex]}
                              </span>
                            )}
                          </div>
                        )}
                        {isOpen && (
                          <div className="w-5 h-5 border-2 border-green-500 rounded-full bg-green-100"></div>
                        )}
                        {isMuted && (
                          <div className="text-red-500 font-bold text-lg">×</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Fret numbers */}
          <div className="flex justify-start mt-4 ml-2">
            <div className="text-xs text-gray-500 space-x-8">
              <span>1st</span>
              <span>2nd</span>
              <span>3rd</span>
              <span>4th</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Press</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 rounded-full bg-green-100"></div>
            <span className="text-gray-600">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">×</span>
            <span className="text-gray-600">Muted</span>
          </div>
        </div>
      </div>

      {/* Fun fact */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 text-center">
          💡 <strong>Pro tip:</strong> Practice switching between chords slowly at first, focus on clean finger placement!
        </p>
      </div>
    </div>
  );
} 