/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface FilterPanelProps {
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, isLoading }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const presets = [
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.' },
    { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.' },
    { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.' },
  ];
  
  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };
  
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyFilter(activePrompt);
    }
  };

  return (
    <div className="w-full bg-[#F4EAD5]/80 border-2 border-stone-500 rounded-lg p-4 backdrop-blur-sm shadow-[8px_8px_0px_rgba(61,43,31,0.2)] flex flex-col gap-4 animate-fade-in">
      <h3 className="text-xl font-display text-center text-stone-800">Apply a Filter</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center bg-[#FDF6E3] border-2 border-stone-800 text-stone-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-stone-200 active:bg-stone-300 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-300 ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-[#F4EAD5] ring-[#40826D]' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe a custom filter (e.g., '80s synthwave glow')"
        className="flex-grow bg-white border-2 border-stone-800 text-stone-900 rounded-lg p-4 focus:ring-2 focus:ring-[#40826D] focus:outline-none transition w-full disabled:cursor-not-allowed disabled:bg-stone-200 text-base"
        disabled={isLoading}
      />
      
      {activePrompt && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
          <button
            onClick={handleApply}
            className="w-full bg-[#40826D] text-white font-bold py-4 px-6 rounded-lg transition-all duration-150 ease-in-out border-2 border-[#3D2B1F] shadow-[4px_4px_0px_#3D2B1F] hover:bg-[#356a58] active:translate-x-1 active:translate-y-1 active:shadow-none text-base disabled:bg-stone-400 disabled:shadow-none disabled:text-stone-600 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !activePrompt.trim()}
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;