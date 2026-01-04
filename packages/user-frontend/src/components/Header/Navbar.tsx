import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { NavigationItem } from "@e-com/shared/types";
import { Link } from "react-router-dom";

interface NavProps {
  navItems: NavigationItem[];
}

function Navbar({ navItems }: NavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="relative hidden lg:block w-full mt-2.5"
    >
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.id}>
                {item.hasMenu ? (
                  <>
                    <NavigationMenuTrigger
                      className="mx-5"
                      aria-label={`${item.label} menu`}
                    >
                      <Link to={item.href}>{item.label}</Link>
                    </NavigationMenuTrigger>

                    <NavigationMenuContent className="md:w-screen top-full md:fixed z-50 bg-popover text-popover-foreground border-b shadow-[0_8px_20px_rgba(0,0,0,0.08)] animate-in fade-in-0 slide-in-from-top-1 duration-200">
                      <div className="flex gap-16 py-8 justify-around">
                        {item.hasMenu.map((section) => (
                          <section key={section.name}>
                            <h2 className="font-bold mb-2">{section.name}</h2>
                            <ul>
                              {section.items.map((link) => (
                                <li key={link.id} className="my-2">
                                  <Link
                                    to={link.href}
                                    className="text-gray-500 hover:text-foreground transition-colors"
                                    aria-label={link.label}
                                  >
                                    {link.label}
                                    {link.badge && (
                                      <span
                                        className="ml-2 border-2 text-[0.7rem] rounded-full border-red-300 text-red-300 font-bold px-2 py-px"
                                        aria-label={`Badge: ${link.badge}`}
                                      >
                                        {link.badge}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href || "#"}
                      className="mx-5"
                      aria-label={item.label}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default Navbar;
