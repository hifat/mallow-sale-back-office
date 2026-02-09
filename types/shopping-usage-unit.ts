import { z } from "zod";

export interface ShoppingUsageUnit {
  id: string;
  code: string;
  name: string;
}

export const shoppingUsageUnitSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less"),
  name: z.string().min(1, "Name is required"),
});

export type ShoppingUsageUnitInput = z.infer<typeof shoppingUsageUnitSchema>;

export interface ShoppingUsageUnitResponse {
  items: ShoppingUsageUnit[];
  meta: {
    total: number;
  };
}
