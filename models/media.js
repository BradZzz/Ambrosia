var mongoose = require('mongoose')

var mediaSchema = new mongoose.Schema({
    seriesID: { type: Number, required: true, index: true },
	name: { type: String, required: true, index: true },
	meta: [{ type: mongoose.Schema.Types.Mixed }],
	episodes: [{ type: mongoose.Schema.Types.Mixed }],
	created: { type: Date, default: Date.now },
	__v: { type: Number, select: false },
})

module.exports = mongoose.model('media', mediaSchema)
