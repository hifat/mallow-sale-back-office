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
  suppliers: PurchaseSupplier[]
}

export interface PurchaseListParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
}
