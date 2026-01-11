import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Hash, Mail } from 'lucide-react';

// --- Book Structural Mapping (Volume & Chapter Breakdown) ---
const bookStructure = {
  1: { label: "Volume I", chapters: Array.from({ length: 23 }, (_, i) => i + 1) },
  2: { label: "Volume II", chapters: Array.from({ length: 19 }, (_, i) => i + 24) },
  3: { label: "Volume III", chapters: Array.from({ length: 19 }, (_, i) => i + 43) }
};

// --- Search Highlighting Logic ---
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="search-match bg-amber-200 text-stone-900 rounded-sm px-0.5">{part}</mark> 
          : part
      )}
    </>
  );
};

export default function PrideApp() {
  const [selectedVol, setSelectedVol] = useState(1);
  const [selectedCh, setSelectedCh] = useState(1);
  const [selectedPara, setSelectedPara] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);

  // --- Chapter Data Simulation ---
  // This logic takes the text and splits it by double newlines to create the paragraph array
  const getParagraphs = (ch: number): string[] => {
    // CHAPTER 1 snippet as example
    if (ch === 1) return [
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      "\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\"",
      "Mr. Bennet replied that he had not."
    ];
    return [`Full text for Chapter ${ch} paragraph 1.`, `Full text for Chapter ${ch} paragraph 2.`];
  };

  const paragraphs = getParagraphs(selectedCh);

  // --- Handlers ---
  const handleVolumeChange = (v: number) => {
    const firstChapter = bookStructure[v as keyof typeof bookStructure].chapters[0];
    setSelectedVol(v);
    setSelectedCh(firstChapter);
    setSelectedPara(0);
    mainRef.current?.scrollTo(0, 0);
  };

  const handleParaJump = (index: number) => {
    setSelectedPara(index);
    const element = document.getElementById(`para-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const jumpToNextMatch = () => {
    const matches = document.querySelectorAll('.search-match');
    if (matches.length === 0) return;
    const nextMatch = (matchIndex + 1) % matches.length;
    setMatchIndex(nextMatch);
    matches[nextMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 max-w-md mx-auto border-x border-stone-200 font-serif overflow-hidden shadow-2xl">
      
      {/* 1. STICKY MOBILE HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 p-4 z-30 shadow-sm">
        <h1 className="text-xl font-bold text-stone-800 mb-3 text-center tracking-tight italic">Jane Austen</h1>
        
        {/* Navigation Grid: Volume, Chapter, Paragraph */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="relative">
            <select 
              value={selectedVol} 
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full appearance-none bg-stone-100 border border-stone-200 rounded-lg px-2 py-2 text-[11px] font-bold text-stone-600 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={1}>Vol. I</option>
              <option value={2}>Vol. II</option>
              <option value={3}>Vol. III</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-2.5 w-3 h-3 text-stone-400" />
          </div>

          <div className="relative">
            <select 
              value={selectedCh} 
              onChange={(e) => {
                setSelectedCh(Number(e.target.value));
                setSelectedPara(0);
                mainRef.current?.scrollTo(0, 0);
              }}
              className="w-full appearance-none bg-stone-100 border border-stone-200 rounded-lg px-2 py-2 text-[11px] font-bold text-stone-600 outline-none focus:ring-2 focus:ring-amber-500"
            >
              {bookStructure[selectedVol as keyof typeof bookStructure].chapters.map(ch => (
                <option key={ch} value={ch}>Ch. {ch}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-2.5 w-3 h-3 text-stone-400" />
          </div>

          <div className="relative">
            <select 
              value={selectedPara} 
              onChange={(e) => handleParaJump(Number(e.target.value))}
              className="w-full appearance-none bg-amber-50 border border-amber-200 rounded-lg px-2 py-2 text-[11px] font-bold text-amber-800 outline-none"
            >
              {paragraphs.map((_, i) => (
                <option key={i} value={i}>Para {i + 1}</option>
              ))}
            </select>
            <Hash className="absolute right-1.5 top-2.5 w-3 h-3 text-amber-400" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search chapter..."
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setMatchIndex(0);}}
              className="w-full pl-9 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm outline-none"
            />
          </div>
          {searchQuery && (
            <button onClick={jumpToNextMatch} className="bg-amber-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN READING AREA */}
      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto p-6 bg-[#fcfbf7] scroll-smooth"
      >
        <article className="max-w-prose mx-auto">
          <div className="text-center mb-10 opacity-50">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
              {bookStructure[selectedVol as keyof typeof bookStructure].label}
            </span>
            <h2 className="text-2xl mt-1">Chapter {selectedCh}</h2>
          </div>

          <div className="space-y-8 text-lg text-stone-900 leading-relaxed antialiased">
            {paragraphs.map((text, idx) => (
              <p 
                key={idx} 
                id={`para-${idx}`} 
                className={`transition-colors duration-700 ${selectedPara === idx ? "bg-amber-50/80 -mx-2 px-2 rounded-md" : ""}`}
              >
                <Highlight text={text} query={searchQuery} />
              </p>
            ))}
          </div>
        </article>
      </main>

      {/* 3. MOBILE TAB BAR */}
      <footer className="p-3 bg-white border-t border-stone-200 flex justify-between items-center px-8">
        <button className="flex flex-col items-center text-stone-400">
          <Mail className="w-5 h-5" />
          <span className="text-[8px] uppercase mt-1 font-bold">Share</span>
        </button>
        <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
          {paragraphs.length} Paragraphs
        </span>
        <div className="w-5" /> {/* Spacer */}
      </footer>
    </div>
  );
}
