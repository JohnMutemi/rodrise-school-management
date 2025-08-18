-- CreateTable
CREATE TABLE "public"."photo_receipts" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "photoPath" TEXT NOT NULL,
    "notes" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "captureDate" TIMESTAMP(3) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."photo_receipts" ADD CONSTRAINT "photo_receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."fee_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
