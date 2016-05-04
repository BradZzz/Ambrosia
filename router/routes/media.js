/***
nasdaq stocks
http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&render=download
nyse stocks
http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NYSE&render=download
asx stocks
http://www.asx.com.au/asx/research/ASXListedCompanies.csv
***/

require('dotenv').load()

var Q        = require('q')
var _        = require('underscore')
var request  = require('request')
var Media    = require('../../models/media')

String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

module.exports = function (app) {
    app.get('/cast/media/static', function (req, res) {
      return res.status(200).json({ pre : process.env.MEDIA_PREFIX, post : process.env.MEDIA_POSTFIX })
    })
}
