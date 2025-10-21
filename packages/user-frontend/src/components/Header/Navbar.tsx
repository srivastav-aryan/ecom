import type { NavigationItem } from "@e-com/shared/types";

interface NavProps {
  navItems: NavigationItem[];
}

function Navbar({ navItems }: NavProps) {
  return (
    <nav>
      <ul className="flex gap-6">
        {navItems.map((items) => (
          <li key={items.id}> {items.label}</li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
