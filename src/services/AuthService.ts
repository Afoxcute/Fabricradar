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
      // Always allow "000000" as a valid OTP for testing in development environment
      if (process.env.NODE_ENV === "development") {
        console.log(`Development mode: Verifying OTP ${otpCode} for user ${userId}`);
        
        // In development mode, always accept "000000" as valid
        if (otpCode === "000000") {
          console.log("Development mode: Using default OTP 000000 - auto-validating");
          return true;
        }
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
        console.log(`OTP verification failed for user ${userId}: No valid OTP record found for code ${otpCode}`);
        
        // In development, if it's not the default code but OTP verification fails, check if any OTP exists
        if (process.env.NODE_ENV === "development") {
          const anyOtp = await this.db.oTPVerification.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
          
          if (anyOtp) {
            console.log(`Development mode: Latest OTP for user ${userId} is ${anyOtp.otpCode} (expires ${anyOtp.expiresAt})`);
          } else {
            console.log(`Development mode: No OTP records found for user ${userId}`);
          }
        }
        
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
      
      console.log(`OTP verification successful for user ${userId}`);
      return true;
    } catch (e) {
      console.error(`Error verifying OTP for user ${userId}:`, e);
      return false;
    }
  }
}
