const { default: mongoose } = require("mongoose");
const { v4: uuidv4 } = require('uuid');


const RelationShipModelSchema = new mongoose.Schema({
    rid: {
        type: String,
        unique: true,
        default: uuidv4

    },
    person1_id: {
        type: String,
        required: true,
        trim: true
    },
    person2_id: {
        type: String,
        required: true,
        trim: true
    },
    relationship_type: {
        type: String,
        required: true,
        enum: ["Married", "Divorced", "Widowed", "Separated", "Other"]
    },
    status: {
        type: String,
        required: true,
        default: "",
        enum: ["Active", "Inactive"],
        required: true,
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

export default mongoose.models.RelationShip || mongoose.model('RelationShip', RelationShipModelSchema);