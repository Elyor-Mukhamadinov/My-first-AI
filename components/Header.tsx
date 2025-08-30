/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { CameraIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full py-3 px-8 border-b-4 border-[#3D2B1F] bg-[#40826D] shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3">
          <CameraIcon className="w-8 h-8 text-[#FDF6E3]" />
          <h1 className="text-3xl font-display tracking-wider text-[#FDF6E3]">
            Suratkash
          </h1>
      </div>
    </header>
  );
};

export default Header;