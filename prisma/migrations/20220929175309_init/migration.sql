-- CreateTable
CREATE TABLE "ApiCallLog" (
    "id" TEXT NOT NULL,
    "requestMessage" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "response" TEXT,
    "clientRequestId" TEXT,
    "requestStatus" INTEGER,
    "retryScheduled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookCallLog" (
    "id" TEXT NOT NULL,
    "lastCallResponse" TEXT,
    "lastCallResponseStatus" INTEGER,
    "lastCalledAt" TIMESTAMP(3) NOT NULL,
    "apiCallLogId" TEXT NOT NULL,

    CONSTRAINT "WebhookCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiCallLog_requestMessage_idx" ON "ApiCallLog"("requestMessage");

-- AddForeignKey
ALTER TABLE "WebhookCallLog" ADD CONSTRAINT "WebhookCallLog_apiCallLogId_fkey" FOREIGN KEY ("apiCallLogId") REFERENCES "ApiCallLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
