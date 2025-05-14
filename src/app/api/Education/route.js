import Education from '../../../Models/education_model';
import { NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';
import { v4 as uuidv4 } from 'uuid';


// Define enums for dropdown options
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
// POST API to Create a Profile
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();

    const body = await request.json();
    console.log("Received create request with body:", body);

    // Validate required fields
    if (!body.year || !body.institute || !body.prodile_id) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 }
      );
    }

    // // Check for existing profile by CNIC or email
    // const existingProfileConditions = [];
    // if (body.cnic) existingProfileConditions.push({ cnic: body.cnic });
    // if (body.email) existingProfileConditions.push({ email: body.email });

    // if (existingProfileConditions.length > 0) {
    //   const existingProfile = await Profile.findOne({
    //     $or: existingProfileConditions
    //   });

    //   if (existingProfile) {
    //     const conflictField = existingProfile.cnic === body.cnic ? 'CNIC' : 'email';
    //     return NextResponse.json(
    //       { success: false, message: `Profile with this ${conflictField} already exists` },
    //       { status: 409 }
    //     );
    //   }
    // }

    // Validate dropdown fields
    if (body.blood_group && !BLOOD_GROUPS.includes(body.blood_group)) {
      return NextResponse.json(
        { success: false, message: "Invalid blood group" },
        { status: 400 }
      );
    }

    if (body.marital_status && !MARITAL_STATUS.includes(body.marital_status)) {
      return NextResponse.json(
        { success: false, message: "Invalid marital status" },
        { status: 400 }
      );
    }

    // Generate UUIDs if not provided
    const prodile_id = body.prodile_id || uuidv4();

    // Create new profile
    const profile = new Education({
      class_name: body.class_name,
      year: body.year,
      institute: body.institute,
      prodile_id,
      created_by: body.created_by
    });

    // Save profile to the database
    await profile.save();

    return NextResponse.json(
      {
        success: true,
        message: "Record created successfully",
        profileId: profile._id,
        pid: profile.pid
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Record Creation Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error:  error.message
      },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    await connectToMongo();

    // Retrieve all customers with populated devices
    const customers = await Education.find({});
    console.log("📌 Record Data:", customers);

    return NextResponse.json(
      { 
        success: true, 
        message: "Record retrieved successfully",
        customers: customers
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

// GET API to Retrieve Profiles
// export async function GET(request) {
//   try {
//     await connectToMongo();

//     // Parse query parameters
//     const url = new URL(request.url);
//     const search = url.searchParams.get('search');
//     const aliveOnly = url.searchParams.get('aliveOnly') !== 'false';
//     const page = parseInt(url.searchParams.get('page')) || 1;
//     const limit = parseInt(url.searchParams.get('limit')) || 10;

//     // Build query conditions
//     const query = {};
    
//     if (aliveOnly) {
//       query.alive = true;
//     }
    
//     if (search) {
//       const searchRegex = new RegExp(search, 'i');
//       query.$or = [
//         { first_name: searchRegex },
//         { last_name: searchRegex },
//         { email: searchRegex },
//         { cnic: searchRegex },
//         { contact: searchRegex }
//       ];
//     }

//     // Get total count for pagination
//     const total = await Profile.countDocuments(query);

//     // Retrieve profiles with pagination and family references populated
//     const profiles = await Profile.find(query)
//       .populate('gr_father_id', 'first_name last_name pid')
//       .populate('gr_mother_id', 'first_name last_name pid')
//       .populate('mother_id', 'first_name last_name pid')
//       .populate('father_id', 'first_name last_name pid')
//       .sort({ pid: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     return NextResponse.json(
//       { 
//         success: true, 
//         message: "Profiles retrieved successfully",
//         data: profiles,
//         pagination: {
//           total,
//           page,
//           pages: Math.ceil(total / limit),
//           limit
//         },
//         enums: {
//           blood_groups: BLOOD_GROUPS,
//           marital_statuses: MARITAL_STATUS
//         }
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Profile Retrieval Error:", {
//       message: error.message,
//       stack: error.stack,
//       fullError: error
//     });
    
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// DELETE API to Remove a Profile
export async function DELETE(request) {
  try {
    // Extract the profile ID from the URL
    const url = new URL(request.url);
    const profileId = url.searchParams.get('_id');

    if (!profileId) {
      return NextResponse.json(
        { success: false, message: "Profile ID is required" },
        { status: 400 }
      );
    }

    await connectToMongo();


    // Find and delete the profile
    const deletedProfile = await Education.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Record deleted successfully",
        profileId: profileId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Record Deletion Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT API to Update a Profile
export async function PUT(request) {
  try {
    await connectToMongo();

    const body = await request.json();
    console.log("Received update request with body:", body);

    // Validate required fields
    if (!body.class_name || !body.year || !body.institute) {
      return NextResponse.json(
        { success: false, message: "ID, first name and last name are required" },
        { status: 400 }
      );
    }

 

    // Check for existing profile with same CNIC or email (excluding current)
    const existingConditions = [];
    if (body.class_name) existingConditions.push({ class_name: body.class_name, _id: { $ne: body._id } });
    if (body.institute) existingConditions.push({ institute: body.institute, _id: { $ne: body._id } });
    
    if (existingConditions.length > 0) {
      const existingProfile = await Education.findOne({
        $or: existingConditions
      });
      
      if (existingProfile) {
        const conflictField = existingProfile.class_name === body.class_name ? 'class_name' : 'year';
        return NextResponse.json(
          { success: false, message: `Another profile with this ${conflictField} already exists` },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData = {
        class_name: body.class_name,
        year: body.year,
        institute: body.institute,
        prodile_id: body.prodile_id,
        updated_at: Date.now(),
        updated_by: body.updated_by
    };

    // Update the profile
    const updatedProfile = await Education.findByIdAndUpdate(
      body._id,
      updateData,
      { new: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Record updated successfully", 
        profile: updatedProfile 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Record Update Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}