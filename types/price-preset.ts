import { z } from "zod";
import { Inventory } from "./inventory";

export interface Price {
  id: string;
  stockID: string;
  price: number;
  createdAt: string;
}

export interface PricePreset {
  id: string;
  inventoryID: string;
  inventory?: Inventory;
  prices: Price[];
  createdAt: string;
  updatedAt: string;
}
