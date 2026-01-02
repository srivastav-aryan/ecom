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
    <header className="border-b border-black">
      <div className="px-4 sm:px-6 lg:px-11 py-3 ">

        <div className="flex items-center  justify-between ">
          <div className="lg:hidden flex">
            <MobileNav navItems={navData.navItems}/>
          </div>

          {/* Logo */}
         <h2 className="font-extrabold text-[1.5rem] md:text-[2.4rem]">ECOM</h2> 

          {/* search bar for large screens hidden on mobile*/}
          <div className="relative w-full font-sans lg:w-[40%] hidden lg:block">
            <SearchInput />
          </div>

          <div className="flex gap-2 md:gap-4">
            <User  className="h-5 w-5  md:h-8 md:w-8"/>
            <Heart className="h-5 w-5  md:h-8 md:w-8" />
            <ShoppingBasketIcon className="h-5 w-5  md:h-8 md:w-8"/>
          </div>
        </div>

        {/* Search bar — below logo on mobile, hidden on lg */}
        <div className="relative w-full mt-3 font-sans lg:hidden">
          <SearchInput />
        </div>
      </div>

      <Navbar navItems={navData.navItems} />
    </header>
  );
}

export default Header;

