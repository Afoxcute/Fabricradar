import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    // Get the identifier (email or ID) from the query params
    const identifier = request.nextUrl.searchParams.get("identifier");

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Missing identifier parameter" },
        { status: 400 }
      );
    }

    let user = null;

    // Check if identifier is numeric (ID)
    if (/^\d+$/.test(identifier)) {
      // Search by ID
      user = await db.user.findUnique({
        where: { id: parseInt(identifier) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          walletAddress: true,
        },
      });
    } else {
      // Search by email
      user = await db.user.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          walletAddress: true,
        },
    });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...user
    });
  } catch (error: any) {
    console.error("Error finding user by identifier:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
} 