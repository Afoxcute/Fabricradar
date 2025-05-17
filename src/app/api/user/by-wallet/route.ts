import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log(`Looking up user with wallet address: ${walletAddress}`);

    // Find user by wallet address - use exact match with findUnique
    const user = await db.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (!user) {
      console.log(`No user found with wallet address: ${walletAddress}`);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log(`Found user with ID ${user.id} for wallet address: ${walletAddress}`);

    // Return the user data
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user by wallet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 