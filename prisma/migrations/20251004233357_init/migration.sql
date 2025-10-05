/*
  Warnings:

  - You are about to alter the column `weight` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(6,3)`.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "weight" DROP DEFAULT,
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(6,3);

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "label_url" TEXT,
ADD COLUMN     "melhor_envio_order_id" TEXT,
ADD COLUMN     "shipping_city" TEXT,
ADD COLUMN     "shipping_company" TEXT,
ADD COLUMN     "shipping_complement" TEXT,
ADD COLUMN     "shipping_cost" DECIMAL(10,2),
ADD COLUMN     "shipping_country" TEXT DEFAULT 'Brasil',
ADD COLUMN     "shipping_neighborhood" TEXT,
ADD COLUMN     "shipping_number" TEXT,
ADD COLUMN     "shipping_service" TEXT,
ADD COLUMN     "shipping_state" TEXT,
ADD COLUMN     "shipping_street" TEXT,
ADD COLUMN     "shipping_zip_code" TEXT,
ADD COLUMN     "tracking_code" TEXT;
