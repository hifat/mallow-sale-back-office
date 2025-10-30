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


