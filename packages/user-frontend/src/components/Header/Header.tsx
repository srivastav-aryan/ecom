import { Heart, Search, ShoppingBasketIcon, User, Menu } from "lucide-react";
import type { NavigationData } from "@e-com/shared/types";
import Navbar from "./Navbar";

interface HeaderProps {
  navData: NavigationData;
}

function Header({ navData }: HeaderProps) {
  return (
    <header className="border-b-2 border-black">
      <div className="px-4 sm:px-6 lg:px-11 py-4 ">
        {/* Top row */}
        <div className="flex items-center justify-between ">
          {/* Hamburger (only on mobile) */}
          <button className="lg:hidden">
            <Menu size={28} />
          </button>

          {/* Logo */}
          <svg
            viewBox="0 0 200 60"
            xmlns="http://www.w3.org/2000/svg"
            className="w-auto h-10 sm:h-12 lg:h-14 mx-auto lg:mx-0"
          >
            <text
              x="0"
              y="45"
              className="font-sans text-5xl font-bold fill-black tracking-tighter"
            >
              ecom
            </text>
          </svg>

          {/* search bar for large screens hidden on mobile*/}
          <div className="mt-4 hidden lg:block lg:mt-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:w-[40%] border-black ">
            <div className="relative w-full font-sans">
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
          border border-black 
          rounded-xl
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          placeholder-gray-500
          transition duration-150 ease-in-out
        "
              />
            </div>
          </div>

          <div className="flex gap-4">
            <User size={30} />
            <Heart size={30} />
            <ShoppingBasketIcon size={30} />
          </div>
        </div>

        {/* Search bar — below logo on mobile, hidden on lg */}
        <div className="mt-4 lg:hidden lg:mt-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:w-[40%] ">
          <div className="relative w-full font-sans">
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
        </div>
      </div>

      <Navbar navItems={navData.navItems} />
    </header>
  );
}

export default Header;


// upper row header is not acessible no aria fields 
//code duplication for the input 
