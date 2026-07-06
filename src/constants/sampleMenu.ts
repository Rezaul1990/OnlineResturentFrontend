import type { MenuItem } from "@/types/menu";

export const sampleMenu: MenuItem[] = [
  {
    name: "Smoked Chicken Platter",
    description: "Char-grilled chicken with herb rice, roasted vegetables, and house sauce.",
    category: "Grill",
    price: 14.99,
    isAvailable: true,
    isFeatured: true
  },
  {
    name: "Margherita Garden Pizza",
    description: "Crisp sourdough base, tomato, basil, mozzarella, and olive oil.",
    category: "Pizza",
    price: 11.5,
    isAvailable: true,
    isFeatured: true
  },
  {
    name: "Creamy Seafood Pasta",
    description: "Prawns, calamari, garlic cream, parsley, and handmade fettuccine.",
    category: "Pasta",
    price: 16.25,
    isAvailable: true,
    isFeatured: false
  }
];

