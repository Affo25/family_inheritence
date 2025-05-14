import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionString } from "../../../Services/DbConnection";
import { Students } from "@/Models/student";

// MongoDB Connection Function (Prevents Multiple Connections)
const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(connectionString);
      console.log("✅ MongoDB Connected!");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      throw new Error("Database connection failed!");
    }
  }
};

// GET API to Fetch Students
export async function GET() {
  try {
    await connectDB(); // Ensure database connection

    const token = cookies().get("token")?.value;

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return Response.json(
      { success: true, message: "You have access to this protected route", userId: decoded.userId },
      { status: 200 }
    );

    // Fetch all students
    const data = await Students.find();
    console.log("📌 Students Data:", data);

    return NextResponse.json({ success: true, students: data });
  } catch (error) {
    console.error("❌ Fetching Data Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch students!" }, { status: 500 });
  }
}


export async function POST(request) { // <-- Use "request" instead of "req"
  try {
    await connectDB(); // Ensure database connection

    const body = await request.json(); // <-- Corrected JSON parsing

    if (!body.name || !body.email) {
      return Response.json({ success: false, message: "Name and Email are required" }, { status: 400 });
    }

    const student = new Students(body);
    await student.save(); // Save to database

    return Response.json({ success: true, message: "Student added successfully" });
  } catch (error) {
    console.error("Error saving student:", error);
    return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
