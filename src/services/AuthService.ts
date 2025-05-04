import { BaseService } from "../../src/services/BaseService";

export class AuthService extends BaseService {
  /**
   * Find a user by email
   * @param email
   */
  async findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by phone
   * @param phone
   */
  async findUserByPhone(phone: string) {
    return this.db.user.findUnique({
      where: { phone },
    });
  }
  
  /**
   * Create or update OTP for a user
   * @param userId
   * @param otpCode
   */
  async createOtp(userId: number, otpCode: string): Promise<boolean> {
    try {
      await this.db.oTPVerification.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          otpCode,
          verified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        update: {
          otpCode,
          verified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  /**
   * Verify OTP for a user
   * @param userId
   * @param otpCode
   */
  async verifyOtp(userId: number, otpCode: string): Promise<boolean> {
    try {
      // Always allow "000000" as a valid OTP for testing in any environment
      if (otpCode === "000000" && process.env.NODE_ENV !== "production") {
        return true;
      }
      
      // Find the OTP verification record
      const otpVerification = await this.db.oTPVerification.findFirst({
        where: {
          userId,
          otpCode,
          verified: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      
      if (!otpVerification) {
        return false;
      }
      
      // Mark as verified
      await this.db.oTPVerification.update({
        where: {
          id: otpVerification.id,
        },
        data: {
          verified: true,
        },
      });
      
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
