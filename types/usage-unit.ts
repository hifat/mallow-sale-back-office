export interface UsageUnit {
    code: string
    name: string
}

export const USAGE_UNITS: UsageUnit[] = [
    { code: "kg", name: "Kilogram (kg)" },
    { code: "g", name: "Gram (g)" },
    { code: "l", name: "Liter (l)" },
    { code: "ml", name: "Milliliter (ml)" },
    { code: "pcs", name: "Pieces" },
    { code: "dozen", name: "Dozen" },
    { code: "box", name: "Box" },
    { code: "bag", name: "Bag" },
];
