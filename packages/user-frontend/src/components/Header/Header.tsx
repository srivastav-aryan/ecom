// import React from 'react'
import { Heart, Search, ShoppingBasketIcon, User } from "lucide-react";

function Header() {
  return (
    <header>
      <div className=" flex items-center justify-between px-11">
        <svg
          width="200"
          height="60"
          viewBox="0 0 200 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Ecom Logo with Tailwind CSS</title>

          <text
            x="0"
            y="45"
            className="font-sans text-5xl font-bold fill-black tracking-tighter"
          >
            ecom
          </text>
        </svg>

        <div className="relative w-full max-w-xl font-sans">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Search..."
            className="
          w-full
          py-2.5 pl-10 pr-4
          text-gray-900
          bg-white
          border border-gray-300
          rounded-xl
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          placeholder-gray-500
          transition duration-150 ease-in-out
        "
          />
        </div>

        <div className="flex gap-4">
          <User size={30} />
          <Heart size={30} />
          <ShoppingBasketIcon size={30} />
        </div>
      </div>

      <div>
        <nav>{/* wait for it  */}</nav>
      </div>
    </header>
  );
}

export default Header;
