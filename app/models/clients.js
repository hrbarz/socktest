/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * ClientsSchema
 */
var ClientsSchema = new Schema({
    code: String,
    name: String,
    info: Schema.Types.Mixed,
    talk:  [{
        user: String,
        comment: {type: String, trim: true},
        date: { type: Date, default: Date.now }
    }],
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});


mongoose.model('Clients', ClientsSchema);