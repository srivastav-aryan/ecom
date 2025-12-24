import { Heart, ShoppingBasketIcon, User } from "lucide-react";
import type { NavigationData } from "@e-com/shared/types";
import Navbar from "./Navbar";
import SearchInput from "./SearchInput";
import MobileNav from "./MobileNav";

interface HeaderProps {
  navData: NavigationData;
}

function Header({ navData }: HeaderProps) {
  return (
    <header className="border-b-2 border-black">
      <div className="px-4 sm:px-6 lg:px-11 py-4 ">
        <div className="flex items-center justify-between ">
          <div className="lg:hidden">
            <MobileNav navItems={navData.navItems}/>
          </div>

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
          <div className="relative w-full font-sans lg:w-[40%] hidden lg:block">
            <SearchInput />
          </div>

          <div className="flex gap-4">
            <User size={30} />
            <Heart size={30} />
            <ShoppingBasketIcon size={30} />
          </div>
        </div>

        {/* Search bar — below logo on mobile, hidden on lg */}
        <div className="relative w-full font-sans lg:hidden">
          <SearchInput />
        </div>
      </div>

      <Navbar navItems={navData.navItems} />
    </header>
  );
}

export default Header;

// upper row header is not acessible no aria fields
