import  Death  from '../../../Models/death_model';
import { NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';
import { MARITAL_STATUS, BLOOD_GROUPS } from '../../../Models/person_info';
import { v4 as uuidv4 } from 'uuid';



// POST API to Create a Profile
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();

    const body = await request.json();
    console.log("Received create request with body:", body);

    // Validate required fields
    if (!body.death_date || !body.death_place || !body.death_reason) {
      return NextResponse.json(
        { success: false, message: "Death place, death reason and death date are required" },
        { status: 400 }
      );
    }


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

  

    // Use either prodile_id or profile_id from the request
    const profileId = body.prodile_id || body.profile_id;
    
    if (!profileId) {
      return NextResponse.json(
        { success: false, message: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Create new profile
    const profile = new Death({
        death_date: body.death_date,
        death_place: body.death_place,
        death_reason: body.death_reason,
      prodile_id: profileId, // Handle both field names
      profile_id: profileId, // Store in both fields for consistency
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



export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connectToMongo();

    if (id) {
      console.log(`🔍 Looking for single death record with prodile_id/profile_id: ${id}`);

      // Find one record that matches either prodile_id or profile_id
      const deathRecord = await Death.findOne({
        $or: [
          { prodile_id: id },
        ]
      });

      if (!deathRecord) {
        return NextResponse.json(
          { success: false, message: "Death record not found for the given profile ID" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Death record retrieved successfully",
          death: deathRecord,
        },
        { status: 200 }
      );
    } else {
      const allDeathRecords = await Death.find({});
      console.log(`📦 Found ${allDeathRecords.length} total death records`);

      return NextResponse.json(
        {
          success: true,
          message: "All death records retrieved successfully",
          deaths: allDeathRecords,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ Error retrieving death records:", {
      message: error.message,
      stack: error.stack,
      fullError: error,
    });

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
    const deletedProfile = await Death.findByIdAndDelete(profileId);

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
    if (!body.death_date || !body.death_place || !body.death_reason) {
      return NextResponse.json(
        { success: false, message: "Death place, death reason and death date are required" },
        { status: 400 }
      );
    }

 

    // Check for existing profile with same CNIC or email (excluding current)
    const existingConditions = [];
    if (body.death_date) existingConditions.push({ death_date: body.death_date, _id: { $ne: body._id } });
    if (body.death_place) existingConditions.push({ death_place: body.death_place, _id: { $ne: body._id } });
    
    if (existingConditions.length > 0) {
      const existingProfile = await Death.findOne({
        $or: existingConditions
      });
      
      if (existingProfile) {
        const conflictField = existingProfile.death_date === body.death_date ? 'death date' : 'death place';
        return NextResponse.json(
          { success: false, message: `Another profile with this ${conflictField} already exists` },
          { status: 409 }
        );
      }
    }

    // Use either prodile_id or profile_id from the request
    const profileId = body.prodile_id || body.profile_id;
    
    // Build update data
    const updateData = {
        death_date: body.death_date,
        death_place: body.death_place,
        death_reason: body.death_reason,
        prodile_id: profileId,
        profile_id: profileId, // Store in both fields for consistency
        updated_at: Date.now(),
        updated_by: body.updated_by
    };

    // Update the profile
    const updatedProfile = await Death.findByIdAndUpdate(
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