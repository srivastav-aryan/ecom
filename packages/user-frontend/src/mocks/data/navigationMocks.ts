import type { NavigationData } from "@e-com/shared/types";

export const mockNaviData: NavigationData = {
  navItems: [
    {
      id: "new-in",
      label: "NEW IN",
      href: "/new-in",
    },
    {
      id: "underwear",
      label: "UNDERWEAR",
      href: "/underwear",
      hasMenu: [
        {
          name: "MENS UNDERWEAR",
          items: [
            {
              id: "boxer-shorts",
              label: "Boxer Shorts",
              href: "/underwear/mens/boxer-shorts",
              badge: "POPULAR",
            },
            {
              id: "bamboo-boxers",
              label: "Bamboo Boxer Shorts",
              href: "/underwear/mens/bamboo-boxers",
              badge: "SELLING FAST",
            },
            {
              id: "briefs",
              label: "Briefs",
              href: "/underwear/mens/briefs",
            },
          ],
        },
        {
          name: "WOMENS UNDERWEAR",
          items: [
            {
              id: "bralettes",
              label: "Bralettes",
              href: "/underwear/womens/bralettes",
            },
            {
              id: "lace-panties",
              label: "Lace Panties",
              href: "/underwear/womens/lace-panties",
              badge: "BESTSELLER",
            },
          ],
        },
      ],
    },
    {
      id: "clothing",
      label: "CLOTHING",
      href: "/clothing",
      hasMenu: [
        {
          name: "MENS CLOTHING",
          items: [
            {
              id: "t-shirts",
              label: "T-Shirts",
              href: "/clothing/mens/t-shirts",
              badge: "NEW",
            },
            {
              id: "hoodies",
              label: "Hoodies",
              href: "/clothing/mens/hoodies",
            },
          ],
        },
        {
          name: "WOMENS CLOTHING",
          items: [
            {
              id: "dresses",
              label: "Dresses",
              href: "/clothing/womens/dresses",
              badge: "TRENDING",
            },
            {
              id: "jackets",
              label: "Jackets",
              href: "/clothing/womens/jackets",
              badge: "LIMITED",
            },
          ],
        },
      ],
    },
    {
      id: "accessories",
      label: "ACCESSORIES",
      href: "/accessories",
      hasMenu: [
        {
          name: "BAGS",
          items: [
            {
              id: "backpacks",
              label: "Backpacks",
              href: "/accessories/bags/backpacks",
            },
            {
              id: "handbags",
              label: "Handbags",
              href: "/accessories/bags/handbags",
            },
          ],
        },
        {
          name: "JEWELRY",
          items: [
            {
              id: "necklaces",
              label: "Necklaces",
              href: "/accessories/jewelry/necklaces",
            },
            {
              id: "rings",
              label: "Rings",
              href: "/accessories/jewelry/rings",
              badge: "POPULAR",
            },
            {
              id: "crown",
              label: "Crown",
              href: "/accessories/jewelry/crown",
            }
          ],
        },
      ],
    },
    {
      id: "sale",
      label: "SALE",
      href: "/sale",
    },
  ],
  lastUpdated: "2025-10-01T12:00:00Z",
};
