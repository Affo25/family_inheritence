// app/api/Users/route.js
import { NextResponse } from 'next/server';
import connectToMongo from '../../lib/mongodb_connection';
import Users from '../../../Models/user';

// GET API to fetch all users
export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userType = searchParams.get('user_type');
    const search = searchParams.get('search');
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (userType) {
      query.user_type = userType;
    }
    
    if (search) {
      query = {
        ...query,
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { contact: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Fetch users with pagination
    const users = await Users.find(query)
      .select('-password') // Exclude password from results
      .sort({ created_on: -1 }); // Sort by creation date, newest first
    
    return NextResponse.json(
      {
        success: true,
        message: "Users fetched successfully",
        data: users
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ User Fetch Error:", {
      message: error.message,
      stack: error.stack
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

// PUT API to update a user
export async function PUT(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Remove password if it's empty
    if (body.password === '') {
      delete body.password;
    }
    
    // Check if email or contact already exists for another user
    if (body.email || body.contact) {
      const existingUser = await Users.findOne({
        _id: { $ne: body._id },
        $or: [
          ...(body.email ? [{ email: body.email }] : []),
          ...(body.contact ? [{ contact: body.contact }] : [])
        ]
      });
      
      if (existingUser) {
        const conflictField = existingUser.email === body.email ? 'Email' : 'Contact';
        return NextResponse.json(
          { success: false, message: `${conflictField} already exists` },
          { status: 409 }
        );
      }
    }
    
    // Update user
    const updatedUser = await Users.findByIdAndUpdate(
      body._id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ User Update Error:", {
      message: error.message,
      stack: error.stack
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

// DELETE API to delete a user
export async function DELETE(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('_id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Delete user
    const deletedUser = await Users.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ User Delete Error:", {
      message: error.message,
      stack: error.stack
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