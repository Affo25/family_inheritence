const {mongoose,Document} = require("mongoose");
const { v4: uuidv4 } = require('uuid');

// Define enums for dropdown options
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const ProfileModelSchema = new mongoose.Schema({
    pid: {
        type: String,
        unique: true,
        default: uuidv4

    },
    image: String,
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
     gender: {
        type: String,
        required: true,
        default: "",
        enum: ["Male", "Female"]
    },
     status: {
        type: String,
        required: true,
        default: "Pending",
        enum: ["Pending", "Approved"]
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    contact: {
        type: String,
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please fill a valid contact number']
    },
    birth_date: {
        type: Date,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Birth date cannot be in the future'
        }
    },
    birth_place: {
        type: String,
        trim: true
    },
    blood_group: {
        type: String,
        enum: BLOOD_GROUPS,
        default: 'Unknown'
    },
    marital_status: {
        type: String,
        enum: MARITAL_STATUS,
        default: 'Single'
    },
    occupation: {
        type: String,
        trim: true
    },
    alive: {
        type: Boolean,
        default: true
    },
    cnic: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Please fill a valid CNIC (XXXXX-XXXXXXX-X)']
    },
    gr_father_id: {
        type: String,
        default: "",
    },
    gr_mother_id: {
        type: String,
         default: "",
    },
     mother_id: {
        type: String,
        unique: true,
        default: uuidv4
  },
  father_id: {
        type: String,
        unique: true,
        default: uuidv4
    },
    created_on: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: String,
        ref: 'User'
    },
    updated_by: {
        type: String,
        ref: 'User'
    }
},
    
);

// Export the enums along with the model
export default mongoose.models.Profile || mongoose.model('Profile', ProfileModelSchema);
