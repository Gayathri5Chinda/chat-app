import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Function to create a new Prisma client for each request
export const createPrismaClient = (databaseUrl: string) => {
  return new PrismaClient({
    datasourceUrl: databaseUrl, // Pass the database URL directly
  }).$extends(withAccelerate());
};