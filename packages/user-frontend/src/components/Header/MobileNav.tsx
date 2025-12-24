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
      <SheetTrigger>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className=" overflow-hidden">
        <SheetHeader className="border-b-3 border-black">
          <SheetTitle>ECOM</SheetTitle>
        </SheetHeader>

        <div className="">
          {navItems.map((topItem) => {
            if (topItem.hasMenu) {
              return (
                <div
                  key={topItem.id}
                  className="py-2 px-4 cursor-pointer border-b-2 border-blue-200 flex justify-between"
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
                  className="py-2 px-4 cursor-pointer border-b-2 border-blue-200  w-full block"
                  to={topItem.href}
                >
                  {topItem.label}
                </Link>
              );
            }
          })}

          <div
            className={`
    absolute inset-0 bg-white mt-14
    transition-transform duration-300 ease-out
    ${open && activeItem ? "translate-x-0" : "translate-x-full"}
  `}
          >
            <button
              className="py-1 mb-2 border-black border rounded-4xl  px-5"
              onClick={() => setActiveItem(null)}
            >
              ← Back
            </button>

            {activeItem?.hasMenu?.map((section) => (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={section.name}>
                  <AccordionTrigger className="border-2">{section.name}</AccordionTrigger>
                  <AccordionContent className="p-3 flex flex-col gap-4 text-balance">
                    {section.items.map((list) => (
                      <ul>
                        <li>
                          <Link to={list.href} className="text-gray-500">{list.label}</Link>
                          {!list.badge ? (
                            ""
                          ) : (
                            <span className="ml-2 border-2 text-[0.7rem] rounded-full border-red-300 text-red-300 font-bold px-2 py-px">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
