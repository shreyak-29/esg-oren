-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Response" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "electricity" INTEGER NOT NULL,
    "renewable" INTEGER NOT NULL,
    "fuel" INTEGER NOT NULL,
    "emissions" INTEGER NOT NULL,
    "employees" INTEGER NOT NULL,
    "femaleEmployees" INTEGER NOT NULL,
    "trainingHours" INTEGER NOT NULL,
    "communitySpend" INTEGER NOT NULL,
    "boardPercent" INTEGER NOT NULL,
    "privacyPolicy" BOOLEAN NOT NULL,
    "revenue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
