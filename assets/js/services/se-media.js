angular.module('ambrosia').service('seMedia',
['$http', '$q', 'Flash',
function ($http, $q, Flash)
{
  var self = this
  self.logName = 'seMedia'
  self.cache = {}

  self.getSearchFormatted = function (meta) {
    //These are just for checking so I dont have to recurse twice
    titles = []
    genres = []

    formattedMeta = []
    _.each(meta, function(dat){
      if (!_.contains(titles, dat.name) ) {
        titles.push(dat.name)
        formattedMeta.push({ value : dat.name, type : 'title' })
      }
      _.each(dat.genre, function(type){
        if (!_.contains(genres, type) ) {
          genres.push(type)
          formattedMeta.push({ value : type, type : 'genre' })
        }
      })
    })
    return formattedMeta
  }

  var drulz = ['tt0397306','tt1486217','tt1561755','tt2474952','tt2467372','tt1439629','tt4677934','tt0182576','tt6317068','tt0149460',
  'tt1865718','tt0472954','tt3718778','tt1266020','tt1780441','tt2861424','tt0098904','tt0055683','tt1178180','tt5691552',
  'tt0096697','tt1621748','tt4839610','tt8335206','tt8335332','tt0220880','tt1140100','tt0206512','tt0212671']
  var fard = ['tt0397306','tt1486217','tt0103359','tt1561755','tt2467372','tt1439629','tt0182576','tt3551096','tt0149460',
  'tt5905038','tt0294097','tt0197159','tt0472954','tt0057730','tt0118375','tt0839188','tt1780441','tt2861424','tt0437745',
  'tt0482424','tt0063950','tt0098904','tt0245612','tt0121955','tt3158246','tt0092455','tt1031283','tt0373732','tt0115226',
  'tt0096697','tt0112196','tt0417373','tt1621748','tt4839610','tt0120903','tt0402022','tt0278877','tt0213338',
  'tt0220880','tt8199790','tt0251439','tt2058221']

  self.getConstructedChannels = function (meta) {
    var channels = [
        { name : "All Colors", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type === 'tv' && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "The Cinema", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type === 'movie' && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Drulz Special", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){
                      return (file.type === 'tv' && 'imdbId' in file && _.contains(drulz, file.imdbId)) ||
                      (file.type === 'movie' && file.imdbRating >= 7 && _.contains(file.genre, 'Adventure' ) &&
                         (file.rated === "G" || file.rated === "PG" || file.rated === "PG-13"))
                    }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Brier Burger", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type === 'tv' && 'imdbId' in  file && _.contains(fard, file.imdbId) }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Casual Cartoons", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Animation') && !_.contains(file.genre, 'Horror')
                        && (file.rated === "TV-Y7" || file.rated === "TV-PG") && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Dane Cook", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Comedy') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Action Ninja", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Action') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Overly Dramatic", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Drama') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Barely Animated", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Animation') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "00Jones", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return _.contains(file.genre, 'Adventure') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        }
    ]
    return _.map(channels, function(channel) { return { name : channel.name, shows : channel.create(meta) } })
  }

  self.getMediaAnalytics = function (name) {
    return $http({
      url: '/cast/media/analytics',
      method: 'GET',
      params: {
        name: name,
      }
    }).then(function (response) {
      console.log(response)
      return response.data
    })
  }

  self.getEpisode = function (name, season, episode) {
    return $http({
      url: '/cast/media/episode',
      method: 'GET',
      params: {
        name: name,
        season: season,
        episode: episode,
      }
    }).then(function (response) {
      console.log(response)
      return response.data
    })
  }

  self.getMediaUpdate = function () {
    return $http({
      url: '/cast/update',
      method: 'GET'
    }).then(function (response) {
      console.log(response)
      Flash.create('success', 'Meta Updated')
      return response.data
    }, function(err){
      console.log('Error!')
      console.log(err)
      Flash.create('danger', err.data.err)
      return err
    })
  }

  self.getMediaStatic = function () {
    if ('getMediaStatic' in self.cache) {
      var deferred = $q.defer()
      deferred.resolve(self.cache.getMediaStatic)
      return deferred.promise
    } else {
      return $http({
        url: '/cast/media/static',
        method: 'GET'
      }).then(function (response) {
        console.log(response)
        self.cache.getMediaStatic = response.data
        return response.data
      })
    }
  }

  self.getMedia = function () {
    if ('getMedia' in self.cache) {
      var deferred = $q.defer()
      deferred.resolve(self.cache.getMedia)
      return deferred.promise
    } else {
        return $http({
          url: '/cast/media',
          method: 'GET'
        }).then(function (response) {
          console.log(response)
          self.cache.getMedia = response.data
          return _.map(response.data, function(meta) {
            if (meta.episodes.length == 0) {
                meta.type = 'movie'
            } else {
                meta.type = 'tv'
            }
            return meta
          })
        })
    }
  }

  self.updateMedia = function () {
    return $http({
      url: '/cast/update',
      method: 'GET',
    }).then(function (response) {
      console.log(response)
      return response.data
    })
  }

}])