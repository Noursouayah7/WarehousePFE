-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESTOCK_REQUESTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'IN_DELIVERY', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ShipmentType" AS ENUM ('RESTOCK');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('REQUESTED', 'IN_TRANSIT', 'RECEIVED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER';

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deliveryDeadline" TIMESTAMP(3) NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "managerNote" TEXT,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "restockAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER,
    "type" "ShipmentType" NOT NULL DEFAULT 'RESTOCK',
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "blocId" INTEGER NOT NULL,
    "supplierName" TEXT,
    "trackingNumber" TEXT,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "status" "ShipmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "blocs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
