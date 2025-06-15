import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

import { RequestsOrderService } from './../../../services/requests/requests.order.service';
import { RequestsProductService } from './../../../services/requests/requests-product.service';
import { Order, OrderListStatus } from './../../../models/order.model';
import { RateService } from './../../../services/rate.service';

interface ProductDisplay {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  skuName: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit {

  public orders: Order[] = [];
  public error: string | null = null;
  public OrderListStatus = OrderListStatus;

  // Track which order is expanded
  public expandedOrderId: string | null = null;
  public expandedOrderProducts: ProductDisplay[] = [];
  public expandedOrderTotalBGN: number = 0;
  public expandedOrderLoading = false;

  // Cache product details by order id
  public orderProductsMap: { [orderId: string]: ProductDisplay[] } = {};

  constructor(
    private requestsOrderService: RequestsOrderService,
    private requestsProductService: RequestsProductService,
    private rateService: RateService
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  public async fetchOrders(): Promise<void> {
    this.error = null;
    try {
      const response = await lastValueFrom(this.requestsOrderService.getOrders());
      if (response.status === 200 && Array.isArray(response.data)) {
        this.orders = (response.data as Order[]).map(o => ({ ...o, id: (o as any).id || (o as any)._id }));
      } else {
        this.error = response.error || 'Failed to fetch orders';
      }
      console.log(this.orders);
    } catch (err) {
      this.error = 'Error fetching orders';
      console.error(err);
    }
  }

  public async updateStatus(order: Order, status: OrderListStatus): Promise<void> {
    try {
      const orderId = (order as any).id || (order as any)._id;
      const response = await lastValueFrom(this.requestsOrderService.updateOrder(orderId as string, { status }));
      if (response.status === 200) {
        order.status = status;
      } else {
        this.error = response.error || 'Failed to update order status';
      }
    } catch (err) {
      this.error = 'Error updating order';
      console.error(err);
    }
  }

  public async deleteOrder(order: Order): Promise<void> {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (!confirmDelete) {
      return;
    }
    try {
      const orderId = (order as any).id || (order as any)._id;
      const response = await lastValueFrom(this.requestsOrderService.deleteOrder(orderId as string));
      if (response.status === 200) {
        this.orders = this.orders.filter(o => (o as any).id !== orderId);
      } else {
        this.error = response.error || 'Failed to delete order';
      }
    } catch (err) {
      this.error = 'Error deleting order';
      console.error(err);
    }
  }

  public formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  public async toggleDetails(order: Order): Promise<void> {
    const orderId = (order as any).id || (order as any)._id;

    if (this.expandedOrderId === orderId) {
      // Collapse if already open
      this.expandedOrderId = null;
      this.expandedOrderProducts = [];
      return;
    }

    this.expandedOrderId = orderId;
    this.expandedOrderLoading = true;
    this.expandedOrderProducts = [];
    if (!this.orderProductsMap[orderId]) {
      await this.loadProductDetails(order);
    }
    this.expandedOrderProducts = this.orderProductsMap[orderId] || [];
    this.expandedOrderTotalBGN = this.expandedOrderProducts.reduce((sum, p) => sum + this.getBGN(p.price * p.quantity), 0);
    this.expandedOrderLoading = false;
  }

  private async loadProductDetails(order: Order): Promise<void> {
    const orderId = (order as any).id || (order as any)._id;
    const products: ProductDisplay[] = [];

    for (const op of order.products) {
      let prod: any = op.productId;
      let id2 = prod.id_2 || prod.id || prod._id;
      let platform = prod.platform || 'WEIDIAN';
      let detail: any = null;
      let sku: any = null;
      let color: string | undefined;
      let size: string | undefined;

      try {
        // Fetch product details from getCNFansProductDetail
        const resp = await lastValueFrom(this.requestsProductService.getCNFansProductDetail(id2, platform));
        if (resp.status === 200 && resp.data?.data?.productInfo) {
          detail = resp.data.data.productInfo;
          // Find the exact SKU by skuId
          sku = detail.skus?.find((s: any) => s.skuID === op.skuId);
          if (sku) {
            // Try to extract color/size from nameTrans (e.g. 'Colour: Black; Size: M')
            if (sku.nameTrans) {
              const parts = sku.nameTrans.split(';').map((p: string) => p.trim());
              for (const part of parts) {
                if (part.toLowerCase().startsWith('colour:')) color = part.split(':')[1]?.trim();
                if (part.toLowerCase().startsWith('color:')) color = part.split(':')[1]?.trim();
                if (part.toLowerCase().startsWith('size:')) size = part.split(':')[1]?.trim();
              }
            }
          }
        }
      } catch (err) {
        // ignore, fallback to prod
      }

      products.push({
        productId: id2,
        title: detail?.titleTrans || detail?.title || prod.title || 'Unknown product',
        image: sku?.imgUrl || (detail?.imgList && detail.imgList[0]) || (Array.isArray(prod.images) ? prod.images[0] : ''),
        price: Number(op.price),
        quantity: op.quantity,
        color,
        size,
        skuName: sku?.nameTrans || sku?.name || '',
      });
    }

    this.orderProductsMap[orderId] = products;
  }

  /**
   * Returns the status of the currently expanded order (for badge display)
   */
  public getExpandedOrderStatus(): string {
    if (!this.expandedOrderId) return '';
    const order = this.orders.find(o => (o.id || o._id) === this.expandedOrderId);
    return order?.status || '';
  }

  public getBGN(price: number): number {
    const rate = this.rateService.getRate() || 0.89;
    return +(price * rate).toFixed(2);
  }

  public getPaddingClass(): string {
    return 'expanded-order-details-padding';
  }
} 