-- AlterTable
ALTER TABLE "ApiCallLog" ALTER COLUMN "webhookUrl" DROP NOT NULL,
ALTER COLUMN "response" DROP NOT NULL,
ALTER COLUMN "clientRequestId" DROP NOT NULL,
ALTER COLUMN "requestStatus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WebhookCallLog" ALTER COLUMN "lastCallResponse" DROP NOT NULL,
ALTER COLUMN "lastCallResponseStatus" DROP NOT NULL;
