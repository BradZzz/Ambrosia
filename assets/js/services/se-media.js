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
        { name : "Dane Cook", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Comedy') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Action Ninja", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Action') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Overly Dramatic", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Drama') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Barely Animated", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Animation') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "00Jones", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Adventure') && 'imdbId' in file }),
                    function(file){ return file.imdbId }
                )
            }
        },
        { name : "Casual Cartoons", create :
            function (meta) {
                return _.map(
                    _.filter(meta, function(file){ return file.type !== 'movie' && _.contains(file.genre, 'Animation') && !_.contains(file.genre, 'Horror')
                        && (file.rated === "TV-Y7" || file.rated === "TV-PG") && 'imdbId' in file }),
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