export enum OrderListStatus {
  Draft = 'draft',
  Pending = 'pending',
  Paid = 'paid',
  Processing = 'processing',
  Shipping = 'shipping',
  Finished = 'finished',
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface OrderAddress {
  address: string;
  city: string;
  postalCode: string;
  street: string;
}

export interface OrderProduct {
  productId: string; // Assuming string for ObjectId
  quantity: number;
  price: number;
  skuId: string;
}

export interface Order {
  _id: string;
  // Alias used on the FE for convenience (copy of _id)
  id?: string;
  status: OrderListStatus;
  customer: OrderCustomer;
  address: OrderAddress;
  products: OrderProduct[];
  totalPrice: number;
  notes: string;
  createdAt: string | Date;
  updatedAt: string | Date;
} 