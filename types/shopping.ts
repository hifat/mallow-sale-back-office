import { z } from "zod";
import { UsageUnit } from "./usage-unit";

export interface Shopping {
  id: string;
  isComplete: boolean;
  name: string;
  purchaseQuantity: number;
  purchaseUnit: UsageUnit;
}

export const shoppingSchema = z.object({
  isComplete: z.boolean().default(false),
  name: z.string().min(1, "Name is required"),
  purchaseQuantity: z
    .number()
    .nonnegative({ message: "Quantity must be zero or greater" }),
  purchaseUnit: z.object({ code: z.string().min(1, "Unit is required") }),
});

export type ShoppingInput = z.infer<typeof shoppingSchema>;

export interface ReceiptItem {
  inventoryID: string;
  name: string;
  nameEdited: string;
  purchasePrice: number;
  purchaseQuantity: number;
  remark: string;
}

export interface ReceiptResponse {
  items: ReceiptItem[];
  meta: {
    total: number;
  };
}

export const receiptItemSchema = z.object({
  inventoryID: z.string().min(1, "Inventory ID is required"),
  name: z.string(),
  nameEdited: z.string(),
  purchasePrice: z.number().nonnegative({ message: "Price must be zero or greater" }),
  purchaseQuantity: z.number().nonnegative({ message: "Quantity must be zero or greater" }),
  remark: z.string().optional(),
});

export type ReceiptItemInput = z.infer<typeof receiptItemSchema>;

export interface ShoppingInventoryItem {
  inventoryID: string;
  inventoryName: string;
}

export interface ShoppingInventorySupplier {
  id: string;
  supplierID: string;
  supplierName: string;
  inventories: ShoppingInventoryItem[];
}

export interface ShoppingInventoryResponse {
  items: ShoppingInventorySupplier[];
  meta: {
    total: number;
  };
}
