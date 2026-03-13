import { ShoppingBasketIcon, User, LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { NavigationData } from "@e-com/shared/types";
import Navbar from "./Navbar";
import SearchInput from "./SearchInput";
import MobileNav from "./MobileNav";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface HeaderProps {
  navData: NavigationData;
}

function Header({ navData }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <header role="banner" className="border-b border-black">
      <div className="px-4 sm:px-6 lg:px-11 py-3">
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex">
            <MobileNav navItems={navData.navItems} />
          </div>

          {/* Logo */}
          <h2 className="font-extrabold text-[1.5rem] md:text-[2.4rem]">
            ECOM
          </h2>

          {/* search bar for large screens hidden on mobile*/}
          <div
            className="relative w-full font-sans lg:w-[40%] hidden lg:block"
            aria-label="Search"
          >
            <SearchInput />
          </div>

          <div className="flex gap-2 md:gap-4">
            <HoverCard openDelay={150} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="focus:outline-none">
                  <User
                    className="h-7 w-7 md:h-8 md:w-8 cursor-pointer"
                    aria-label="User account"
                  />
                </button>
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-56 p-0" 
                align="end"
                sideOffset={8}
              >
                {isAuthenticated ? (
                  <div className="flex flex-col">
                    <div className="px-4 py-3 font-medium text-sm border-b">
                      {user?.firstname} {user?.lastname}
                    </div>
                    <Link 
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors border-b"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors text-left w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link 
                      to="/auth/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors border-b"
                    >
                      <UserCircle className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link 
                      to="/auth/register"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Register
                    </Link>
                  </div>
                )}
              </HoverCardContent>
            </HoverCard>
            <ShoppingBasketIcon
              className="h-7 w-7 md:h-8 md:w-8"
              aria-label="Shopping cart"
            />
          </div>
        </div>

        {/* Search bar — below logo on mobile, hidden on lg */}
        <div
          className="relative w-full mt-3 font-sans lg:hidden"
          aria-label="Search"
        >
          <SearchInput />
        </div>
      </div>

      <Navbar navItems={navData.navItems} />
    </header>
  );
}

export default Header;
