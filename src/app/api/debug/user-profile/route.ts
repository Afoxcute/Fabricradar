import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { isProfileComplete, debugProfileStatus } from "@/utils/user-profile-utils";

// Mark this route as explicitly dynamic since it uses request parameters
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("walletAddress");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    // Diagnostic data to return
    const diagnostics = {
      timestamp: new Date().toISOString(),
      queries: {
        walletAddress: walletAddress || null,
        userId: userId ? parseInt(userId) : null,
        email: email || null,
        phone: phone || null,
      },
      results: {
        byWallet: null as any,
        byId: null as any,
        byEmail: null as any,
        byPhone: null as any,
      },
    };

    // Try to find user by wallet address
    if (walletAddress) {
      try {
        const user = await db.user.findFirst({
          where: { walletAddress },
        });
        
        diagnostics.results.byWallet = user 
          ? { 
              found: true, 
              profile: debugProfileStatus(user),
              isComplete: isProfileComplete(user)
            }
          : { found: false };
      } catch (error) {
        diagnostics.results.byWallet = { error: "Database error when querying by wallet" };
      }
    }

    // Try to find user by ID
    if (userId) {
      try {
        const user = await db.user.findUnique({
          where: { id: parseInt(userId) },
        });
        
        diagnostics.results.byId = user 
          ? { 
              found: true, 
              profile: debugProfileStatus(user),
              isComplete: isProfileComplete(user)
            }
          : { found: false };
      } catch (error) {
        diagnostics.results.byId = { error: "Database error when querying by ID" };
      }
    }

    // Try to find user by email
    if (email) {
      try {
        const user = await db.user.findFirst({
          where: { email },
        });
        
        diagnostics.results.byEmail = user 
          ? { 
              found: true, 
              profile: debugProfileStatus(user),
              isComplete: isProfileComplete(user)
            }
          : { found: false };
      } catch (error) {
        diagnostics.results.byEmail = { error: "Database error when querying by email" };
      }
    }

    // Try to find user by phone
    if (phone) {
      try {
        const user = await db.user.findFirst({
          where: { phone },
        });
        
        diagnostics.results.byPhone = user 
          ? { 
              found: true, 
              profile: debugProfileStatus(user),
              isComplete: isProfileComplete(user)
            }
          : { found: false };
      } catch (error) {
        diagnostics.results.byPhone = { error: "Database error when querying by phone" };
      }
    }

    // Return diagnostic information
    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error) {
    console.error("Error in user profile diagnostics:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to run diagnostics",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 