import { sampleMenu } from "@/constants/sampleMenu";
import { apiClient } from "@/lib/apiClient";
import type { MenuItem, MenuItemsResponse } from "@/types/menu";

export type MenuLoadResult = {
  items: MenuItem[];
  source: "api" | "sample";
  notice?: string;
};

export const getFeaturedMenuItems = async (): Promise<MenuLoadResult> => {
  try {
    const data = await apiClient<MenuItemsResponse>("/public/menu?featured=true&limit=6");
    return {
      items: data.items.slice(0, 6),
      source: "api"
    };
  } catch (error) {
    return {
      items: sampleMenu,
      source: "sample",
      notice: error instanceof Error ? error.message : "Menu API is not available yet."
    };
  }
};

export const getPublicMenuItems = async (): Promise<MenuLoadResult> => {
  try {
    const data = await apiClient<MenuItemsResponse>("/public/menu");
    return { items: data.items, source: "api" };
  } catch (error) {
    return {
      items: sampleMenu,
      source: "sample",
      notice: error instanceof Error ? error.message : "Menu API is not available yet."
    };
  }
};
