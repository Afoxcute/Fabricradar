import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

// Mark this route as explicitly dynamic since it uses request parameters
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const identifier = searchParams.get("identifier");

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Email or phone identifier is required" },
        { status: 400 }
      );
    }

    console.log(`Looking up user with identifier: ${identifier}`);

    // Check if identifier looks like an email
    const isEmail = identifier.includes('@');

    // Find user by email or phone
    const user = await db.user.findFirst({
      where: isEmail 
        ? { email: identifier }
        : { phone: identifier },
    });

    if (!user) {
      console.log(`No user found with identifier: ${identifier}`);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log(`Found user with ID ${user.id} for identifier: ${identifier}`);

    // Return the user data
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user by identifier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 