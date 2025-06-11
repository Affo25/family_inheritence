

import  Profile  from '../../../Models/person_info';
import { NextRequest, NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';



export async function GET(req) {
    const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    await connectToMongo();
   if (!id) {
  return NextResponse.json(
    {
      success: false,
      message: "No ID provided",
    },
    { status: 400 } // 400 Bad Request is more appropriate here
  );
}

    // Retrieve all customers with populated devices
    const userRecord = await Profile.find({
        $or:[{father_id:id},{mother_id:id}]
    });
    console.log("📌 Record  children Data:", userRecord);

    return NextResponse.json(
      { 
        success: true, 
        message: "children Records retrieved successfully",
        data: userRecord
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
