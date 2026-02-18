-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "trend" TEXT NOT NULL,
    "variation" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sources" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
