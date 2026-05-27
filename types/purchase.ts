export type PurchaseStatusCode = "PENDING" | "IN_PROGRESS" | "SUCCESS" | "CANCEL"

export type PaymentTypeCode = "CASH" | "E_PAYMENT" | "CREDIT_CARD"

export interface PurchaseOrder {
  inventoryID: string
  inventoryName: string
  quantity: number
  usageUnitCode: string
  unitPrice: number
  totalPrice: number
  statusCode: PurchaseStatusCode
}

export interface PurchaseSupplier {
  supplierId: string
  supplierName: string
  statusCode: PurchaseStatusCode
  paymentType: PaymentTypeCode
  orders: PurchaseOrder[]
}

export interface PurchaseListItem {
  id: string
  purchaseStatusCode: PurchaseStatusCode
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  id: string
  purchaseStatusCode: PurchaseStatusCode
  suppliers: PurchaseSupplier[]
  createdAt: string
  updatedAt: string
}

export interface PurchasePayload {
  purchaseStatusCode?: PurchaseStatusCode
  suppliers: PurchaseSupplier[]
}

export interface PurchaseListParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
}

export interface SupplierInventorySupplier {
  id: string
  imgUrl?: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface SupplierInventoryItem {
  createdAt: string
  id: string
  name: string
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: {
    code: string
    name: string
  }
  remark?: string
  supplierID: string
  updatedAt: string
  yieldPercentage: number
}

export interface SupplierInventoryGroup {
  supplier: SupplierInventorySupplier
  inventories: SupplierInventoryItem[]
}

export interface GroupBySupplierResponse {
  items: SupplierInventoryGroup[]
  meta: {
    total: number
  }
}
