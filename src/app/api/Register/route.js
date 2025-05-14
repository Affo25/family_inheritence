// app/api/user/route.ts
import { NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';
import Users from '../../../Models/user';

// POST API to Create a User
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();

    const body = await request.json();
    console.log("Received create request with body:", body);

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'contact', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists by email or contact
    const existingUser = await Users.findOne({
      $or: [{ email: body.email }, { contact: body.contact }]
    });

    if (existingUser) {
      const conflictField = existingUser.email === body.email ? 'Email' : 'Contact';
      return NextResponse.json(
        { success: false, message: `${conflictField} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new Users({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      contact: body.contact,
      password: body.password,
      status: body.status || 'Active',
      user_type: body.user_type || 'User',
    });

    // Save to DB
    await newUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: newUser._id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ User Creation Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}
