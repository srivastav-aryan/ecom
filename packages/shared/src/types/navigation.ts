export interface MegamenuSection {
  name: string;
  items: MegamenuItem[];
}

export interface MegamenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  hasMenu?: MegamenuSection[];
}

export interface NavigationData {
  navItems: NavigationItem[];
  lastUpdated?: string;
}
