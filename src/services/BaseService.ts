import { db } from "../server/db";

// Use a type that works with any Prisma client structure
export class BaseService {
  protected readonly db: any; // Use 'any' to avoid type conflicts with different Prisma versions

  constructor(db: any) { // Use 'any' for parameter type to avoid circular reference
    this.db = db;
  }
}
