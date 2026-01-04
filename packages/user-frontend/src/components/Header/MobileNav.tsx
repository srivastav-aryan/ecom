import {
  Sheet,
  SheetFooter,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FacebookIcon, InstagramIcon, Menu, TwitterIcon } from "lucide-react";
import type { NavigationItem } from "@e-com/shared/types";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface NavProps {
  navItems: NavigationItem[];
}

function MobileNav({ navItems }: NavProps) {
  const [activeItem, setActiveItem] = useState<NavigationItem | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setActiveItem(null);
      }}
    >
      <SheetTrigger aria-label="Open navigation menu" aria-expanded={open}>
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-[rgb(28,28,28)] w-screen text-white overflow-hidden"
      >
        <SheetHeader className="border-b border-gray-600">
          <SheetTitle className="text-white">ECOM</SheetTitle>
        </SheetHeader>

        <nav
          aria-label="Mobile navigation"
          className="w-[90%] mx-auto border-b border-gray-600"
        >
          {navItems.map((topItem) => {
            if (topItem.hasMenu) {
              return (
                <div
                  key={topItem.id}
                  className="py-2 cursor-pointer flex gap-2.5"
                  onClick={() => setActiveItem(topItem)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${topItem.label} menu`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveItem(topItem);
                    }
                  }}
                >
                  <p className="text-[1.3rem]">{topItem.label}</p>
                  <span className="text-white">{">"}</span>
                </div>
              );
            } else {
              return (
                <Link
                  key={topItem.id}
                  className="py-2 text-[1.3rem] w-full block"
                  to={topItem.href}
                  aria-label={topItem.label}
                >
                  {topItem.label}
                </Link>
              );
            }
          })}

          <div
            className={`absolute inset-0 bg-[rgb(28,28,28)] px-3 mt-20 transition-transform duration-300 ease-out ${
              activeItem ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              className="py-1 mb-6 bg-[rgb(55,55,55)] rounded-full text-sm px-2"
              onClick={() => setActiveItem(null)}
              aria-label="Go back to main menu"
            >
              ← Back
            </button>

            {activeItem?.hasMenu?.map((section) => (
              <Accordion
                key={section.name}
                type="single"
                collapsible
                className="w-full"
              >
                <AccordionItem value={section.name}>
                  <AccordionTrigger>{section.name}</AccordionTrigger>
                  <AccordionContent className="p-3 flex flex-col gap-4 text-balance">
                    {section.items.map((list) => (
                      <ul key={list.id}>
                        <li>
                          <Link
                            to={list.href}
                            className="text-gray-400"
                            aria-label={list.label}
                          >
                            {list.label}
                          </Link>
                          {list.badge && (
                            <span
                              className="ml-2 border-2 text-[0.7rem] text-white rounded-full border-red-300 font-bold px-2 py-px"
                              aria-label={`Badge: ${list.badge}`}
                            >
                              {list.badge}
                            </span>
                          )}
                        </li>
                      </ul>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </nav>

        <SheetFooter className="border-gray-600 border-y">
          <div
            className="flex justify-between"
            role="list"
            aria-label="Social media links"
          >
            <FacebookIcon className="h-5 w-5" aria-label="Facebook" />
            <InstagramIcon className="h-5 w-5" aria-label="Instagram" />
            <TwitterIcon className="h-5 w-5" aria-label="Twitter" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
