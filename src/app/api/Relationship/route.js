import  Relationship  from '@/Models/relationship_model';
import { NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';
import { v4 as uuidv4 } from 'uuid';


// POST API to Create a Profile
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectToMongo();

    const body = await request.json();
    console.log("Received create request with body:", body);

    // Validate required fields
    if (!body.person1_id || !body.person2_id || !body.relationship_type) {
      return NextResponse.json(
        { success: false, message: "Person1 ID, Person2 ID, and relationship type are required" },
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

  
// Add new field to the customer (newField can be any field)
const newFieldValue = body.newField || 'default value'; // Set a default value if not provided
    const pid = body.pid || uuidv4();

    // Create new profile with explicit field mapping
    const profileData = {
        rid: pid,  // Make sure we're using the correct field name from the model
        person1_id: body.person1_id,
        person2_id: body.person2_id,
        relationship_type: body.relationship_type,
        status: body.status,
        newField: newFieldValue,
        created_by: body.created_by,
        created_on: new Date(),
        updated_on: new Date()
    };
    
    // Log the profile data
    console.log("Profile data:", profileData);
    
    const profile = new Relationship(profileData);

    // Log the profile object before saving
    console.log("Profile object to be saved:", profile);
    
    // Save profile to the database
    const savedProfile = await profile.save();
    
    // Log the saved profile
    console.log("Saved profile:", savedProfile);

    return NextResponse.json(
      {
        success: true,
        message: "Record created successfully",
        pid: profile._id,
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


export async function GET() {
  try {
    await connectToMongo();

    // Retrieve all customers with populated devices
    const customers = await Relationship.find({});
    console.log("📌 Record Data:", customers);

    return NextResponse.json(
      { 
        success: true, 
        message: "Mrriges Record retrieved successfully",
        relationship: customers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Detailed Error:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    console.error("Error retrieving Mrriges Record:", error);
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
    const deletedProfile = await Relationship.findByIdAndDelete(profileId);

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
      await connectToMongo(); // Ensure MongoDB is connected
  
      const body = await request.json();
      console.log("Received update request with body:", body);
      console.log("Received rry list request with body:", body.devicesList);
  
      const {
        _id,
        person1_id,
        person2_id,
        rid,
        relationship_type,
        status,
      } = body;
  
  
      // // ✅ Validate required fields
      // if (!person1_id ||!person2_id ||!relationship_type ||!status) {
      //   return NextResponse.json(
      //     { success: false, message: 'All required fields must be provided' },
      //     { status: 400 }
      //   );
      // }
  
      // // ✅ Check for existing customer (excluding the current one)
      // const existingCustomer = await Relationship.findOne({
      //   rid: rid,
      //   _id: { $ne: _id }
      // });
  
      // if (existingCustomer) {
      //   return NextResponse.json(
      //     { success: false, message: "Another record with this id already exists" },
      //     { status: 409 }
      //   );
      // }
  
      // ✅ Build updated data
      const updatedCustomerData = {
        _id,
        person1_id,
        person2_id,
        rid,
        relationship_type,
        status,
        updatedAt: new Date()
      };
  
      console.log("Updating Record with ID:", _id);
      console.log("Update data:", updatedCustomerData);
  
      // ✅ Update the customer
      const updatedCustomer = await Relationship.findByIdAndUpdate(
        _id,
        updatedCustomerData,
        { new: true }
      );
  
      if (!updatedCustomer) {
        return NextResponse.json(
          { success: false, message: 'Record not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { success: true, message: 'Record updated successfully', customer: updatedCustomer },
        { status: 200 }
      );
    } catch (error) {
      console.error("❌ Detailed Error:", {
        message: error.message,
        stack: error.stack,
        fullError: error
      });
  
      return NextResponse.json(
        { success: false, message: 'Internal Server Error' },
        { status: 500 }
      );
    }
}