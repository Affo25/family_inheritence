import  connectToMongo  from '../../lib/mongodb_connection';
import { NextResponse } from 'next/server';
import Profile from '../../../Models/person_info';

export async function GET(request) {
  try {
    await connectToMongo();
    
    const { searchParams } = new URL(request.url);
    const query = {};

    // Text search fields (case-insensitive regex)
    const textSearchFields = [
      'first_name', 'last_name', 'email', 'contact', 
      'birth_place', 'occupation', 'cnic'
    ];
    
    textSearchFields.forEach(field => {
      if (searchParams.get(field)) {
        query[field] = { $regex: searchParams.get(field), $options: 'i' };
      }
    });

    // Exact match fields
    const exactMatchFields = [
      'pid', 'gr_father_id', 'gr_mother_id', 
      'mother_id', 'father_id', 'created_by', 'updated_by'
    ];
    
    exactMatchFields.forEach(field => {
      if (searchParams.get(field)) {
        query[field] = searchParams.get(field);
      }
    });

    // Enum fields with validation
    if (searchParams.get('gender')) {
      query.gender = { $in: searchParams.get('gender').split(',') };
    }
    
    if (searchParams.get('status')) {
      query.status = { $in: searchParams.get('status').split(',') };
    }
    
    if (searchParams.get('blood_group')) {
      query.blood_group = { $in: searchParams.get('blood_group').split(',') };
    }
    
    if (searchParams.get('marital_status')) {
      query.marital_status = { $in: searchParams.get('marital_status').split(',') };
    }

    // Boolean field
    if (searchParams.get('alive') !== null) {
      query.alive = searchParams.get('alive') === 'true';
    }

    // Date range queries
    if (searchParams.get('birth_date_from') || searchParams.get('birth_date_to')) {
      query.birth_date = {};
      if (searchParams.get('birth_date_from')) {
        query.birth_date.$gte = new Date(searchParams.get('birth_date_from'));
      }
      if (searchParams.get('birth_date_to')) {
        query.birth_date.$lte = new Date(searchParams.get('birth_date_to'));
      }
    }

    // Created/updated date ranges
    if (searchParams.get('created_from') || searchParams.get('created_to')) {
      query.created_on = {};
      if (searchParams.get('created_from')) {
        query.created_on.$gte = new Date(searchParams.get('created_from'));
      }
      if (searchParams.get('created_to')) {
        query.created_on.$lte = new Date(searchParams.get('created_to'));
      }
    }

    if (searchParams.get('updated_from') || searchParams.get('updated_to')) {
      query.updated_on = {};
      if (searchParams.get('updated_from')) {
        query.updated_on.$gte = new Date(searchParams.get('updated_from'));
      }
      if (searchParams.get('updated_to')) {
        query.updated_on.$lte = new Date(searchParams.get('updated_to'));
      }
    }

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    const sortField = searchParams.get('sortBy') || 'updated_on';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    sort[sortField] = sortOrder;

    // Execute query
    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Profile.countDocuments(query)
    ]);
    console.log(profiles);

    return NextResponse.json(
      { 
        success: true, 
        message: "Profiles retrieved successfully",
        data: profiles,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile search error:", {
      message: error.message,
      stack: error.stack,
      query: searchParams.toString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Error searching profiles",
        error: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}