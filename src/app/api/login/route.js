

import  connectToMongo  from '../../lib/mongodb_connection';
import jwt from "jsonwebtoken";
import Users from "../../../Models/user";
import { NextResponse } from 'next/server';





export async function POST(request) {
  try {
      await connectToMongo();


    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required or select user role' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { email, password } = body;
    console.log("body data",body);

    
   
  

    const customer = await Users.findOne({ email,password });
   

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Uncomment this in production
    // const isPasswordValid = await bcrypt.compare(password, customer.password);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { success: false, message: 'Incorrect password' },
    //     { status: 401 }
    //   );
    // }

    const token = jwt.sign(
      {
        userId: customer._id.toString(),
        email: customer.email,
        role: customer.userRole,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' , algorithm: 'HS256'}
    );
    console.log("procees environment",process.env.JWT_KEY);

    const customerObj = customer.toObject();
    const { password: _, ...customerWithoutPassword } = customerObj;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: customerWithoutPassword,
      token: token
    });

    // Set the token as an HttpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
     console.log("Cookie set resposne",response);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    );
  }
}
