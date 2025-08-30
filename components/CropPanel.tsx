/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
}

type AspectRatio = 'free' | '1:1' | '16:9';

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onSetAspect, isLoading, isCropping }) => {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>('free');
  
  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
  }

  const aspects: { name: AspectRatio, value: number | undefined }[] = [
    { name: 'free', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '16:9', value: 16 / 9 },
  ];

  return (
    <div className="w-full bg-[#F4EAD5]/80 border-2 border-stone-500 rounded-lg p-4 backdrop-blur-sm shadow-[8px_8px_0px_rgba(61,43,31,0.2)] flex flex-col items-center gap-4 animate-fade-in">
      <h3 className="text-xl font-display text-stone-800">Crop Image</h3>
      <p className="text-sm text-stone-600 -mt-2">Click and drag on the image to select a crop area.</p>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-stone-700">Aspect Ratio:</span>
        {aspects.map(({ name, value }) => (
          <button
            key={name}
            onClick={() => handleAspectChange(name, value)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 border-2 border-[#3D2B1F] ${
              activeAspect === name 
              ? 'bg-[#40826D] text-white shadow-[2px_2px_0px_#3D2B1F]' 
              : 'bg-[#FDF6E3] hover:bg-stone-200 text-stone-800'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <button
        onClick={onApplyCrop}
        disabled={isLoading || !isCropping}
        className="w-full max-w-xs mt-2 bg-[#B22222] text-white font-bold py-4 px-6 rounded-lg transition-all duration-150 ease-in-out border-2 border-[#3D2B1F] shadow-[4px_4px_0px_#3D2B1F] hover:bg-[#9d1d1d] active:translate-x-1 active:translate-y-1 active:shadow-none text-base disabled:bg-stone-400 disabled:shadow-none disabled:text-stone-600 disabled:cursor-not-allowed disabled:transform-none"
      >
        Apply Crop
      </button>
    </div>
  );
};

export default CropPanel;