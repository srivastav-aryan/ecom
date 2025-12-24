import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { NavigationItem } from "@e-com/shared/types";
import { Link } from "react-router-dom";
import { useState } from "react";

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
      <SheetTrigger>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className=" overflow-hidden">
        <SheetHeader className="border-b-3 border-black">
          <SheetTitle>ECOM</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {navItems.map((topItem) => {
            if (topItem.hasMenu) {
              return (
                <div
                  key={topItem.id}
                  className="py-2 px-4 cursor-pointer border-b flex justify-between"
                  onClick={() => setActiveItem(topItem)}
                >
                  <p>{topItem.label}</p>
                  <span className="text-gray-400">{">"}</span>
                </div>
              );
            } else {
              return (
                <Link
                  key={topItem.id}
                  className="py-2 px-4 cursor-pointer border-b  w-full block"
                  to={topItem.href}
                >
                  {topItem.label}
                </Link>
              );
            }
          })}

          <div
            className={`
    absolute inset-0 bg-red-200 mt-14
    transition-transform duration-300 ease-out
    ${open && activeItem ? "translate-x-0" : "translate-x-full"}
  `}
          >
            <button
              className="py-3 bg-black text-white px-4"
              onClick={() => setActiveItem(null)}
            >
              ← Back
            </button>

            {activeItem?.hasMenu?.map((section) => (
              <div key={section.name} className="flex-col">
                <p>{section.name}</p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
