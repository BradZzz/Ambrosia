/***
nasdaq stocks
http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&render=download
nyse stocks
http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NYSE&render=download
asx stocks
http://www.asx.com.au/asx/research/ASXListedCompanies.csv
***/

require('dotenv').load()

var fs          = require('fs')
var csv         = require('fast-csv')
var Q           = require('q')
var _           = require('underscore')
var request     = require('request')
var parseString = require('xml2js').parseString
var Media       = require('../../models/media')
var Misc        = require('../../models/misc')

var cache       = {}
cache.mediaMeta = {}
cache.meta      = {}
var series      = fs.createReadStream("./media_csv/series.csv")

String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

module.exports = function (app) {

    app.get('/media/all', function (req, res) {
      if ('page' in req.query && 'limit' in req.query) {
        var page = req.query.page
        var limit = req.query.limit
        Media.find({ "status" : { "$exists" : true }}, function(err, data){
          if (err) {
            return res.status(500).json(err)
          }
          return res.status(200).json(data)
        }).skip(page > 0 ? ((page - 1) * limit) : 0).limit(limit)
      }
    })

    app.get('/media/meta', function (req, res) {
        if ('id' in req.query){
            if (req.query.id in cache.mediaMeta) {
                return res.status(200).json(cache.mediaMeta[req.query.id])
            } else {
                getTVMeta(req.query.id).then(function(results){
                    return res.status(200).json(results)
                })
            }
        } else {
            return res.status(400).json("Request doesn't contain all necessary parameters")
        }
    })

    //Pull in the most recent time from the db
    app.get('/media/populate', function (req, res) {
      getStockStream(series).then(function(results){

        var promises = _.map(results, function(result) {
            var deferred = Q.defer()
            Media.findOneAndUpdate({ seriesID : result.seriesID }, result, {upsert:true,new:true}, function(err, data){
              if (err) {
                console.log(err)
                deferred.resolve(err)
              } else {
                console.log("done: " + result.name)
                deferred.resolve(data)
              }
            })
            return deferred.promise
        })

        Q.all(promises).then(function(result){
          return res.status(200).json(result)
        }, function (err){
          return res.status(400).json(err)
        })
      })
    })

    app.get('/media/clean2', function (req, res) {
      Media.find({ "meta" : { "$exists" : true }, "status" : { "$exists" : false } }, function(err, data){
        var count = 0
        console.log("returned")
        if (data.length === 0) {
            return res.status(200).json("Done")
        }
        _.each(data, function(dat){
            var meta = dat.meta[0]
            dat.status = meta.Status[0]
            dat.poster = meta.poster[0]
            dat.banner = meta.banner[0]
            dat.fanart = meta.fanart[0]
            dat.rating = isNaN(parseFloat(meta.Rating[0])) ? -1 : parseFloat(meta.Rating[0])
            dat.content = meta.ContentRating[0]
            dat.imdb = meta.IMDB_ID[0]
            dat.imdbRating = -1
            dat.genre = _.filter(meta.Genre[0].split("|"),function(genre){
                return genre
            })
            dat.meta = undefined
            dat.episodes = undefined
            console.log(dat)
            dat.save(function(err, obj){
                count += 1
                console.log(err)
                console.log(obj)
                console.log("Saved: " + dat.name + " : " + count)
                if (count === data.length) {
                    return res.status(200).json("Done")
                }
            })
        })
      }).limit(1000)
    })

    app.get('/media/clean', function (req, res) {
      Media.find({ "meta" : { "$exists" : false }, "status" : { "$exists" : false } }, function(err, data){
        console.log('exists returned')
        Q.all(getStockPipelinePromises(data)).then(function(result){
          return res.status(200).json(result)
        }, function (err){
          return res.status(400).json(err)
        })
      })
    })

    //Pull in the most recent time from the db
    app.get('/media/update', function (req, res) {
      Misc.findOne({}, function(err, meta) {
        if (err) {
          return res.status(500).json(err)
        }

        //if no time is found, hold the current time = 1
        var currentTime = 1

        //if a time is found, hold the current time = pulled time
        if (meta && 'previousTime' in meta) {
            currentTime = meta.previousTime
        }

        var url = "http://thetvdb.com/api/Updates.php?type=all&time=" + currentTime

        request(url, function(err, response, html){
            if (err) {
              return res.status(500).json(err)
            }
            parseString(html, function (err, result) {
              var showUrls = _.map(result.Items.Series, function (showId) {
                return "http://thetvdb.com/api/" + process.env.TVDBAPI + "/series/" + showId + "/all/en.xml"
              })

              return res.status(200).json(result)
            });
        })

      })

      /*
        Steps
            1) Pull in the most recent time from the db
                a) if no time is found, hold the current time = 1
                b) if a time is found, hold the current time = pulled time
            2) Use the found time to pull the updated series list from tvdb
                a) update series in db for each found
            3) Pull the current time in from tvdb server
                a) update current time in
      */
    })

    function getStockPipelinePromises(results){
        return _.map(results, function(result) {

            delete result['_id']

            var deferred = Q.defer()
            if (result.seriesID in cache.meta) {
                console.log("cache: " + result.seriesID)
                var meta = cache.meta[result.seriesID]
                result.meta = meta.Data.Series
                //result.episodes = meta.Data.Episode
                Media.findOneAndUpdate({ seriesID : result.seriesID }, result, {upsert:true,new:true}, function(err, data){
                  if (err) {
                    console.log(err)
                    deferred.resolve(err)
                  } else {
                    console.log("done: " + result.name)
                    deferred.resolve(data)
                  }
                })
            } else {
                getTVMeta(result.seriesID).then(function(meta){
                  console.log("meta: " + result.name + ":" + result.seriesID)
                  if ("Data" in meta) {
                    cache.meta[result.seriesID] = meta
                    result.meta = meta.Data.Series
                    //result.episodes = meta.Data.Episode
                    Media.findOneAndUpdate({ seriesID : result.seriesID }, result, {upsert:true,new:true}, function(err, data){
                      if (err) {
                        console.log(err)
                        deferred.resolve(err)
                      } else {
                        console.log("done: " + result.name)
                        deferred.resolve(data)
                      }
                    })
                  } else {
                    console.log("Error resolving: " + result.name + ":" + result.seriesID)
                    deferred.resolve("")
                  }
                }, function(err){
                  console.log(err)
                  deferred.resolve(err)
                })
            }
            return deferred.promise
        })
    }

    function getStockStream(stream){
      var deferred = Q.defer()
      var builder = []
      var csvStream = csv().on("data", function(data){
        if (data.length > 1 && data[0].trim() && data[1].trim()) {
          builder.push({ name : data[0].trim(), seriesID : data[1].trim() })
        }
      }).on("end", function(){
        deferred.resolve(builder)
      })
      stream.pipe(csvStream)
      return deferred.promise
    }

    function getTVMeta(id){
        var deferred = Q.defer()
        var url = "http://thetvdb.com/api/" + process.env.TVDBAPI + "/series/" + id + "/all/en.xml"
        console.log("querying: " + url)

        request(url, function(err, response, html){
            if (err) {
              deferred.resolve(err)
            }
            parseString(html, function (err, result) {
              if (err) {
                deferred.resolve(err)
              }
              deferred.resolve(result)
            })
        })
        return deferred.promise
    }

}
