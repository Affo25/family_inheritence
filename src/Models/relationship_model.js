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
    date: {
        type: Date,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Birth date cannot be in the future'
        }
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