var mongoose = require('mongoose')

var miscSchema = new mongoose.Schema({
    previousTime: { type: Number, required: true, index: true },
	created: { type: Date, default: Date.now },
	__v: { type: Number, select: false },
})

module.exports = mongoose.model('misc', miscSchema)
