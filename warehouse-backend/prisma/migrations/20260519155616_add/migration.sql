-- CreateEnum
CREATE TYPE "RestockAlertStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RestockPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
ALTER TYPE "InventoryOperationType" ADD VALUE 'RESTOCK_ALERT';

-- AlterEnum
ALTER TYPE "ShipmentType" ADD VALUE 'ORDER';

-- AlterTable
ALTER TABLE "inventory_movements" ADD COLUMN     "restockAlertId" INTEGER;

-- CreateTable
CREATE TABLE "restock_alerts" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "productName" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "blocId" INTEGER NOT NULL,
    "priority" "RestockPriority" NOT NULL DEFAULT 'MEDIUM',
    "managerNote" TEXT,
    "status" "RestockAlertStatus" NOT NULL DEFAULT 'PENDING',
    "managerId" INTEGER,
    "technicianId" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restock_alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "restock_alerts" ADD CONSTRAINT "restock_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_alerts" ADD CONSTRAINT "restock_alerts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_alerts" ADD CONSTRAINT "restock_alerts_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "blocs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_alerts" ADD CONSTRAINT "restock_alerts_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_alerts" ADD CONSTRAINT "restock_alerts_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_restockAlertId_fkey" FOREIGN KEY ("restockAlertId") REFERENCES "restock_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
