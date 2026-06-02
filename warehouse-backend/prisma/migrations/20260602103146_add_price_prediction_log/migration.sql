-- CreateTable
CREATE TABLE "price_prediction_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "role" "UserRole" NOT NULL,
    "input" JSONB NOT NULL,
    "predictedPrice" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_prediction_logs_pkey" PRIMARY KEY ("id")
);
