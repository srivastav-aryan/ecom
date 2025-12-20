export interface MegamenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

// 3rd 
export interface MegamenuSection {
  name: string;
  items: MegamenuItem[];
}

// 2nd 
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  hasMenu?: MegamenuSection[];
}

// outter most
export interface NavigationData {
  navItems: NavigationItem[];
  lastUpdated?: string;
}
