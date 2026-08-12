import { prisma } from '../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export interface OrderDTO {
  productId: string;
  quantity: number;
  userId: string;
  status?: OrderStatus;
}

export class OrderService {
  static async createOrder(data: OrderDTO) {
    // Run order placement in a transaction
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: data.productId, isDeleted: false },
      });

      if (!product) {
        const error: any = new Error('Product not found or has been deleted');
        error.statusCode = 400;
        throw error;
      }

      if (product.status !== 'ACTIVE') {
        const error: any = new Error('Product is currently not available for ordering');
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < data.quantity) {
        const error: any = new Error(`Insufficient stock. Only ${product.stock} items left`);
        error.statusCode = 400;
        throw error;
      }

      // Calculate total price
      const totalPrice = product.price * data.quantity;

      // Decrement stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - data.quantity,
        },
      });

      // Create order
      return tx.order.create({
        data: {
          quantity: data.quantity,
          totalPrice,
          userId: data.userId,
          productId: data.productId,
          status: data.status || 'PENDING',
        },
        include: {
          product: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }

  static async getAllOrders(
    requester: { id: string; role: 'ADMIN' | 'USER' },
    filters: { status?: OrderStatus } = {}
  ) {
    const whereClause: any = { isDeleted: false };

    // Regular users can only see their own orders
    if (requester.role !== 'ADMIN') {
      whereClause.userId = requester.id;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    return prisma.order.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderById(id: string, requester: { id: string; role: 'ADMIN' | 'USER' }) {
    const order = await prisma.order.findFirst({
      where: { id, isDeleted: false },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Regular users can only see their own order details
    if (requester.role !== 'ADMIN' && order.userId !== requester.id) {
      const error: any = new Error('Forbidden: You can only view your own orders');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  static async updateOrderStatus(id: string, newStatus: OrderStatus, requester: { id: string; role: 'ADMIN' | 'USER' }) {
    // Fetch existing order
    const order = await this.getOrderById(id, requester);

    // If order is already cancelled, block modifications
    if (order.status === 'CANCELLED') {
      const error: any = new Error('Cannot update status of a cancelled order');
      error.statusCode = 400;
      throw error;
    }

    // Standard state updates or transactional stock restoration if cancelled
    return prisma.$transaction(async (tx) => {
      if (newStatus === 'CANCELLED') {
        // Restore stock
        const product = await tx.product.findUnique({
          where: { id: order.productId },
        });

        if (product) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock + order.quantity,
            },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: {
          product: true,
        },
      });
    });
  }

  static async deleteOrder(id: string, requester: { id: string; role: 'ADMIN' | 'USER' }) {
    const order = await this.getOrderById(id, requester);

    // Perform soft delete
    return prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
