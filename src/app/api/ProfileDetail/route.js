
import  Profile  from '../../../Models/person_info';
import { NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';

export async function GET() {
  try {
    await connectToMongo();

    // Retrieve all customers with populated devices
    const customers = await Profile.find({});
    console.log("📌 Profile Data:", customers);

    return NextResponse.json(
      { 
        success: true, 
        message: "Profile record retrieved successfully",
        user: customers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Detailed Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    console.error("Error retrieving Record:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}