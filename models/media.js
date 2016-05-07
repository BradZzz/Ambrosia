var mongoose = require('mongoose')

var mediaSchema = new mongoose.Schema({
    seriesID: { type: Number, required: true, index: true },
	name: { type: String, required: true, index: true },
	status: { type: String },
	poster: { type: String },
	banner: { type: String },
	fanart: { type: String },
	rating: { type: Number },
	imdbRating: { type: Number },
	content: { type: String },
	imdb: { type: String },
	genre: [{ type: String }],
	meta: [{ type: mongoose.Schema.Types.Mixed }],
	episodes: [{ type: mongoose.Schema.Types.Mixed }],
	created: { type: Date, default: Date.now },
	__v: { type: Number, select: false },
})

module.exports = mongoose.model('media', mediaSchema)
