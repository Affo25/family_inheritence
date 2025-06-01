import  Profile  from '../../../Models/person_info';
import { NextRequest, NextResponse } from 'next/server';
import  connectToMongo  from '../../lib/mongodb_connection';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Define enums for dropdown options
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];


export async function GET(request) {
  try {
    await connectToMongo();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;
    

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [persons, total] = await Promise.all([
      Profile.find(query).skip(skip).limit(limit).lean(),
      Profile.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Persons retrieved successfully',
      data: {
        persons,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('❌ Detailed Error:', {
      message: error.message,
      stack: error.stack,
      fullError: error,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}


//GET API to Retrieve Profiles
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

async function saveFile(file) {
  // Check if file is valid before trying to access arrayBuffer
  if (!file || typeof file.arrayBuffer !== 'function') {
    console.error('Invalid file object:', file);
    throw new Error('Invalid file object');
  }
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    await connectToMongo();
    const form = await request.formData();

    // Log all form data for debugging
    console.log("Form data received in POST:");
    for (const [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);
    }

    const file = form.get('image');
    const first_name = form.get('first_name');
    const last_name = form.get('last_name');
    const email = form.get('email');
    const contact = form.get('contact');
    const birth_date = form.get('birth_date');
    const birth_place = form.get('birth_place');
    const blood_group = form.get('blood_group') || 'Unknown';
    const marital_status = form.get('marital_status') || 'Single';
    const occupation = form.get('occupation');
    const alive = form.get('alive') !== 'false';
    const cnic = form.get('cnic');
    const gender = form.get('gender');

    // Handle UUIDs as plain strings
    const father_id = form.get('father_id') || '';
    const mother_id = form.get('mother_id') || '';

    // If grandparents still use ObjectId
    const gr_father_id = toObjectIdOrNull(form.get('gr_father_id'));
    const gr_mother_id = toObjectIdOrNull(form.get('gr_mother_id'));

    console.log("Parent UUIDs:");
    console.log("father_id (UUID):", father_id);
    console.log("mother_id (UUID):", mother_id);

    const created_by = form.get('created_by');

    if (!email || !first_name || !last_name) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    // Save image and get URL path
    const imageUrl = await saveFile(file);

    const profileData = {
      first_name,
      last_name,
      image: imageUrl,
      email,
      gender,
      contact,
      birth_date: birth_date ? new Date(birth_date) : null,
      birth_place,
      blood_group,
      marital_status,
      occupation,
      alive,
      cnic,
      father_id,
      mother_id,
      gr_father_id,
      gr_mother_id,
      created_by
    };

    console.log("Final profile data to save:", profileData);

    const profile = new Profile(profileData);
    await profile.save();

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profileId: profile._id,
      data: profile
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Profile Creation Error:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}





export async function PUT(request) {
  try {
    await connectToMongo();

    const contentType = request.headers.get("content-type") || "";
    let body;
    let imageUrl;
    let formEntries = new Map();

    // Helper functions
    const formatUuid = (id) => {
      if (!id || id === "null" || id === "") return "";
      return id.toString().trim();
    };

    const toObjectIdOrNull = (id) => {
      if (!id || id === "null" || id === "") return null;
      if (/^[0-9a-fA-F]{24}$/.test(id)) return new mongoose.Types.ObjectId(id);
      return null;
    };

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();

      for (const [key, value] of form.entries()) {
        formEntries.set(key, value);
      }

      const file = form.get("image");
      if (file && typeof file === "object" && file.size > 0) {
        imageUrl = await saveFile(file);
      } else {
        imageUrl = form.get("image") || null;
      }

      body = {
        _id: form.get("_id"),
        first_name: form.get("first_name"),
        last_name: form.get("last_name"),
        email: form.get("email"),
        contact: form.get("contact"),
        birth_date: form.get("birth_date"),
        birth_place: form.get("birth_place"),
        blood_group: form.get("blood_group") || "Unknown",
        marital_status: form.get("marital_status") || "Single",
        occupation: form.get("occupation"),
        alive: form.get("alive") !== "false",
        cnic: form.get("cnic"),
        gender: form.get("gender"),
        gr_father_id: toObjectIdOrNull(form.get("gr_father_id")),
        gr_mother_id: toObjectIdOrNull(form.get("gr_mother_id")),
        father_id: formatUuid(form.get("father_id")),
        mother_id: formatUuid(form.get("mother_id")),
        updated_by: form.get("updated_by"),
      };
    } else {
      body = await request.json();
      imageUrl = body.image || null;

      for (const [key, value] of Object.entries(body)) {
        formEntries.set(key, value);
      }

      body = {
        ...body,
        gr_father_id: toObjectIdOrNull(body.gr_father_id),
        gr_mother_id: toObjectIdOrNull(body.gr_mother_id),
        father_id: formatUuid(body.father_id),
        mother_id: formatUuid(body.mother_id),
      };
    }

    const {
      _id,
      first_name,
      last_name,
      email,
      contact,
      birth_date,
      birth_place,
      blood_group,
      marital_status,
      occupation,
      alive,
      cnic,
      image,
      gr_father_id,
      gr_mother_id,
      father_id,
      mother_id,
      updated_by,
    } = body;

    // Validate required fields
    if (!_id || !first_name || !last_name) {
      return NextResponse.json(
        {
          success: false,
          message: "ID, First Name, and Last Name are required.",
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ID format
    if (!/^[0-9a-fA-F]{24}$/.test(_id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format. Must be a MongoDB ObjectId." },
        { status: 400 }
      );
    }

    // Validate UUID format for father_id and mother_id
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    if (father_id && !uuidRegex.test(father_id)) {
      return NextResponse.json(
        { success: false, message: "Invalid father_id UUID format." },
        { status: 400 }
      );
    }

    if (mother_id && !uuidRegex.test(mother_id)) {
      return NextResponse.json(
        { success: false, message: "Invalid mother_id UUID format." },
        { status: 400 }
      );
    }

    const existingProfile = await Profile.findById(_id).lean();
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found." },
        { status: 404 }
      );
    }

    const updatedData = {
      first_name,
      last_name,
      email,
      contact,
      birth_date: birth_date ? new Date(birth_date) : null,
      birth_place,
      blood_group,
      image,
      marital_status,
      occupation,
      alive,
      cnic,
      father_id,
      mother_id,
      gr_father_id,
      gr_mother_id,
      updated_by,
    };

    if (imageUrl) {
      updatedData.image = imageUrl;
    }

    // Check and add new fields if any
    const existingFields = Object.keys(existingProfile);
    const newFields = {};
    for (const [key, value] of formEntries.entries()) {
      if (key === "_id" || key in updatedData) continue;
      if (!existingFields.includes(key) && value !== undefined && value !== null) {
        newFields[key] = value;
      }
    }

    const finalUpdatedData = {
      ...updatedData,
      ...newFields,
    };

    const updatedProfile = await Profile.findByIdAndUpdate(_id, finalUpdatedData, {
      new: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        data: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile Update Error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}




