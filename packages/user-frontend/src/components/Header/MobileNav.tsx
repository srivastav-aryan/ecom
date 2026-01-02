import {
  Sheet,
  SheetFooter,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FacebookIcon, InstagramIcon, Menu, TwitterIcon}from "lucide-react";
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
      <SheetContent side="left" className="bg-[rgb(28,28,28)] text-white overflow-hidden">
        <SheetHeader className="border-b border-gray-600">
          <SheetTitle className="text-white">ECOM</SheetTitle>
        </SheetHeader>

        <div className="w-[90%] mx-auto border-b border-gray-600">
          {navItems.map((topItem) => {
            if (topItem.hasMenu) {
              return (
                <div
                  key={topItem.id}
                  className="py-2  cursor-pointer  flex gap-2.5"
                  onClick={() => setActiveItem(topItem)}
                >
                  <p className="text-[1.3rem]">{topItem.label}</p>
                  <span className="text-white ">{">"}</span>
                </div>

              );
            }
            else {
              return (
                <Link
                  key={topItem.id}
                  className="py-2 text-[1.3rem] w-full block"
                  to={topItem.href}
                >
                  {topItem.label}
                </Link>
              );
            }

          })}

          <div
            className={`
    absolute inset-0  bg-[rgb(28,28,28)]  px-3 mt-20
    transition-transform duration-300 ease-out
    ${open && activeItem ? "translate-x-0" : "translate-x-full"}
  `}
          >
            <button
              className="py-1 mb-6  bg-[rgb(55,55,55)] rounded-4xl text-sm px-2"
              onClick={() => setActiveItem(null)}
            >
              ← Back
            </button>

            {activeItem?.hasMenu?.map((section) => (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={section.name} className=" ">
                  <AccordionTrigger className="">{section.name}</AccordionTrigger>
                  <AccordionContent className="p-3 flex flex-col gap-4 text-balance">
                    {section.items.map((list) => (
                      <ul>
                        <li>
                          <Link to={list.href} className="text-gray-400 ">{list.label}</Link>
                          {!list.badge ? (
                            ""
                          ) : (
                            <span className="ml-2 border-2 text-[0.7rem] text-white rounded-full border-red-300  font-bold px-2 py-px">
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

        <SheetFooter className="border-gray-600 border-y">
        <div className=" flex justify-between">
          <FacebookIcon className="h-5 w-5" />
          <InstagramIcon className="h-5 w-5"/>
          <TwitterIcon className="h-5 w-5"/>
        </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
