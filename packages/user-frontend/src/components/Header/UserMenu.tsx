import { User, LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          className="flex items-center  gap-1.5 focus:outline-none group"
          aria-label="User account"
        >
          <User className="h-7 w-7 md:h-8 md:w-8 transition-opacity group-hover:opacity-70" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-52 p-0 rounded-none border border-black"
        align="end"
        sideOffset={10}
      >
        {isAuthenticated ? (
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold truncate">
                {user?.firstname} {user?.lastname}
              </p>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 group/link"
            >
              <User className="h-4 w-4 text-gray-400 group-hover/link:text-black transition-colors" />
              <span>Profile</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left w-full group/btn"
            >
              <LogOut className="h-4 w-4 text-gray-400 group-hover/btn:text-black transition-colors" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <Link
              to="/auth/login"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 group/link"
            >
              <UserCircle className="h-4 w-4 text-gray-400 group-hover/link:text-black transition-colors" />
              <span>Sign in</span>
            </Link>

            <Link
              to="/auth/register"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors group/link"
            >
              <User className="h-4 w-4 text-gray-400 group-hover/link:text-black transition-colors" />
              <span>Create account</span>
            </Link>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
