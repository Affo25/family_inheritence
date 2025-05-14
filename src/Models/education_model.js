const { default: mongoose } = require("mongoose");
const { v4: uuidv4 } = require('uuid');


const EducationModelSchema = new mongoose.Schema({
    education_id: {
        type: String,
        unique: true,
        default: uuidv4

    },
    prodile_id: {
        type: String,
        required: true,
        trim: true
    },
    class_name: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true,
    },
    institute: {
        type: String,
        required: true,
        trim: true
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
}, {
    
});

export default mongoose.models.Education || mongoose.model('Education', EducationModelSchema);