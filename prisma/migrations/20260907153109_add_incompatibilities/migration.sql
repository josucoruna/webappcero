-- CreateTable
CREATE TABLE "incompatibilities" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incompatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incompatibilities_teamId_userAId_userBId_key" ON "incompatibilities"("teamId", "userAId", "userBId");

-- AddForeignKey
ALTER TABLE "incompatibilities" ADD CONSTRAINT "incompatibilities_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incompatibilities" ADD CONSTRAINT "incompatibilities_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incompatibilities" ADD CONSTRAINT "incompatibilities_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
