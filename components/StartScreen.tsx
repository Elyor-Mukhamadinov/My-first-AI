/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-[#40826D]/20 border-dashed border-[#40826D]' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-5xl font-display tracking-tight text-[#3D2B1F] sm:text-6xl md:text-7xl">
          AI Foto Tahrirlash, <span className="text-[#B22222]">Vintage Uslubida</span>.
        </h1>
        <p className="max-w-2xl text-lg text-stone-700 md:text-xl">
          Oddiy matnli ko‘rsatmalar yordamida suratlarni retush qiling, ijodiy filtrlarni qo‘llang yoki professional sozlashlar kiriting. Barchasi klassik, retro uslubda.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
            <label htmlFor="image-upload-start" className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-[#B22222] rounded-lg cursor-pointer group hover:bg-[#9d1d1d] border-2 border-[#3D2B1F] shadow-[4px_4px_0px_#3D2B1F] transition-all duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none">
                <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-300 ease-in-out group-hover:scale-110" />
                Rasm Yuklash
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <p className="text-sm text-stone-500">yoki faylni sudrab olib keling</p>
        </div>

        <div className="mt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#F4EAD5]/60 p-6 rounded-lg border-2 border-[#3D2B1F] flex flex-col items-center text-center shadow-[8px_8px_0px_rgba(61,43,31,0.2)]">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#40826D] rounded-full mb-4 border-2 border-[#3D2B1F]">
                       <MagicWandIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-display text-[#3D2B1F]">Aniq Retush</h3>
                    <p className="mt-2 text-stone-700">Nuqsonlarni olib tashlash, ranglarni o‘zgartirish yoki yuqori aniqlik bilan elementlar qo‘shish uchun rasmingizdagi istalgan nuqtani bosing.</p>
                </div>
                <div className="bg-[#F4EAD5]/60 p-6 rounded-lg border-2 border-[#3D2B1F] flex flex-col items-center text-center shadow-[8px_8px_0px_rgba(61,43,31,0.2)]">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#40826D] rounded-full mb-4 border-2 border-[#3D2B1F]">
                       <PaletteIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-display text-[#3D2B1F]">Ijodiy Filtrlar</h3>
                    <p className="mt-2 text-stone-700">Suratlarni badiiy uslublar bilan o‘zgartiring. Vintage ko‘rinishlardan xayoliy yorug‘liklargacha, mukammal filtrni toping yoki yarating.</p>
                </div>
                <div className="bg-[#F4EAD5]/60 p-6 rounded-lg border-2 border-[#3D2B1F] flex flex-col items-center text-center shadow-[8px_8px_0px_rgba(61,43,31,0.2)]">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#40826D] rounded-full mb-4 border-2 border-[#3D2B1F]">
                       <SunIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-display text-[#3D2B1F]">Professional Sozlashlar</h3>
                    <p className="mt-2 text-stone-700">Yoritishni kuchaytiring, orqa fonni xiralashtiring yoki kayfiyatni o‘zgartiring. Murakkab vositalarsiz studiya sifatidagi natijalarga erishing.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;