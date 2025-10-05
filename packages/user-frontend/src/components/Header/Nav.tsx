import type { NavigationItem } from "@e-com/shared/types";

interface NavProps {
  navItems: NavigationItem[];
}

function Nav({ navItems }: NavProps) {
  return <div>Nav</div>;
}

export default Nav;
