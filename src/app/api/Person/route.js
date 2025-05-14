import  Profile  from '../../../Models/person_info';
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
    if (!body.first_name || !body.last_name) {
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

    // // Validate dropdown fields
    // if (body.blood_group && !BLOOD_GROUPS.includes(body.blood_group)) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid blood group" },
    //     { status: 400 }
    //   );
    // }

    // if (body.marital_status && !MARITAL_STATUS.includes(body.marital_status)) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid marital status" },
    //     { status: 400 }
    //   );
    // }

    // Generate UUIDs if not provided
    const gr_father_id = body.gr_father_id || uuidv4();
    const gr_mother_id = body.gr_mother_id || uuidv4();
    const father_id = body.father_id || uuidv4();
    const mother_id = body.mother_id || uuidv4();

    // Create new profile
    const profile = new Profile({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      contact: body.contact,
      birth_date: body.birth_date ? new Date(body.birth_date) : null,
      birth_place: body.birth_place,
      blood_group: body.blood_group || 'Unknown',
      marital_status: body.marital_status || 'Single',
      occupation: body.occupation,
      alive: body.alive !== false, // Default to true if not specified
      cnic: body.cnic,
      gr_father_id,
      gr_mother_id,
      mother_id,
      father_id,
      created_by: body.created_by
    });

    // Save profile to the database
    await profile.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile created successfully",
        profileId: profile._id,
        pid: profile.pid
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Profile Creation Error:", {
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


export async function GET() {
  try {
    await connectToMongo();

    // Retrieve all customers with populated devices
    const persons = await Profile.find({});
    console.log("📌 Persons Data:", persons);

    return NextResponse.json(
      { 
        success: true, 
        message: "Persons retrieved successfully",
        persons: persons
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Detailed Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    console.error("Error retrieving Persons:", error);
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

    // Check if profile has any family references
    const referencedAsFamily = await Profile.findOne({
      $or: [
        { gr_father_id: profileId },
        { gr_mother_id: profileId },
        { mother_id: profileId },
        { father_id: profileId }
      ]
    });

    if (referencedAsFamily) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot delete profile as it is referenced in family relationships" 
        },
        { status: 400 }
      );
    }

    // Find and delete the profile
    const deletedProfile = await Profile.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile deleted successfully",
        profileId: profileId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile Deletion Error:", {
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
    if (!body._id || !body.first_name || !body.last_name) {
      return NextResponse.json(
        { success: false, message: "ID, first name and last name are required" },
        { status: 400 }
      );
    }

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

    // Check for existing profile with same CNIC or email (excluding current)
    const existingConditions = [];
    if (body.cnic) existingConditions.push({ cnic: body.cnic, _id: { $ne: body._id } });
    if (body.email) existingConditions.push({ email: body.email, _id: { $ne: body._id } });
    
    if (existingConditions.length > 0) {
      const existingProfile = await Profile.findOne({
        $or: existingConditions
      });
      
      if (existingProfile) {
        const conflictField = existingProfile.cnic === body.cnic ? 'CNIC' : 'email';
        return NextResponse.json(
          { success: false, message: `Another profile with this ${conflictField} already exists` },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      contact: body.contact,
      birth_date: body.birth_date ? new Date(body.birth_date) : null,
      birth_place: body.birth_place,
      blood_group: body.blood_group,
      marital_status: body.marital_status,
      occupation: body.occupation,
      alive: body.alive,
      cnic: body.cnic,
      gr_father_id: body.gr_father_id,
      gr_mother_id: body.gr_mother_id,
      mother_id: body.mother_id,
      father_id: body.father_id,
      updated_by: body.updated_by
    };

    // Update the profile
    const updatedProfile = await Profile.findByIdAndUpdate(
      body._id,
      updateData,
      { new: true }
    ).populate('gr_father_id gr_mother_id mother_id father_id', 'first_name last_name pid');

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Profile updated successfully", 
        profile: updatedProfile 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile Update Error:", {
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