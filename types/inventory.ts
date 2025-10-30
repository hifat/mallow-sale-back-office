import { z } from "zod";
import { UsageUnit } from "./usage-unit";

export interface InventoryItem {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseQuantity: number;
  purchaseUnit: UsageUnit;
  yieldPercentage: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export const INVENTORY_YIELD_MIN = 0;
export const INVENTORY_YIELD_MAX = 100;

export const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  purchaseUnit: z.object({ code: z.string().min(1), name: z.string().min(1) }),
  yieldPercentage: z
    .number()
    .min(INVENTORY_YIELD_MIN, { message: "Yield percentage must be between 0 and 100" })
    .max(INVENTORY_YIELD_MAX, { message: "Yield percentage must be between 0 and 100" }),
  remark: z.string().optional(),
});

export type InventoryInput = z.infer<typeof inventorySchema>;

