import { NextRequest, NextResponse } from 'next/server'

// Mock database - in a real app, use a proper database
let users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }
    
    if (!data.email && !data.phone) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      )
    }
    
    // Check if user with this wallet address already exists
    const existingUserIndex = users.findIndex(
      (user) => user.walletAddress === data.walletAddress
    )
    
    // Create a timestamp for the user
    const timestamp = new Date().toISOString()
    
    // If user exists, update their information
    if (existingUserIndex !== -1) {
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        ...data,
        updatedAt: timestamp
      }
      
      return NextResponse.json(users[existingUserIndex])
    }
    
    // Create a new user
    const newUser = {
      id: users.length + 1,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    users.push(newUser)
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }
    
    // Find user with this wallet address
    const user = users.find((u) => u.walletAddress === walletAddress)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error retrieving user:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 