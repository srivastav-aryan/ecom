/**
 * Represents the deepest level link in the navigation menu (e.g. "T-Shirts" or "Jeans").
 */
export interface MegamenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string; // Optional UI hint like "New", "Sale", or "Hot"
}

/**
 * Represents a column or section in the megamenu (e.g. "Topwear" containing "T-shirts", "Shirts").
 */
export interface MegamenuSection {
  name: string;
  items: MegamenuItem[];
}

/**
 * Represents a top-level navbar category (e.g. "Men", "Women") which may contain a megamenu.
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  hasMenu?: MegamenuSection[];
}

/**
 * The root structure representing the entire global navigation data configuration.
 * Fetched by the frontend layout loaders to dynamically populate the main header.
 */
export interface NavigationData {
  navItems: NavigationItem[];
  lastUpdated?: string;
}
