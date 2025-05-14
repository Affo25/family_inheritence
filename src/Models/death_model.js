const { default: mongoose } = require("mongoose");
const { v4: uuidv4 } = require('uuid');


const DeathModelSchema = new mongoose.Schema({
    death_id: {
        type: String,
        unique: true,
        default: uuidv4

    },
    prodile_id: {
        type: String,
        required: true,
        trim: true
    },
    death_date: {
        type: Date,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Death date cannot be in the future'
        }
    },
    death_place: {
        type: String,
        required: true,
    },
    death_reason: {
        type: String,
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

export default mongoose.models.Death || mongoose.model('death', DeathModelSchema);