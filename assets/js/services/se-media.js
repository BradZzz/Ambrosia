angular.module('ambrosia').service('seMedia',
['$http', '$q', 'Flash',
function ($http, $q, Flash)
{
  var self = this
  self.logName = 'seMedia'
  self.cache = {}
  self.cache.getMediaEpisodes = {}

  self.getAllMedia = function () {
    if ('getAllMedia' in self.cache) {
      var deferred = $q.defer()
      deferred.resolve(self.cache.getAllMedia)
      return deferred.promise
    } else {
      return $http({
        url: '/media/all',
        method: 'GET',
        params: {
            page : 0,
            limit : 50,
        }
      }).then(function (response) {
        self.cache.getAllMedia = _.sortBy(response.data, 'name')
        return self.cache.getAllMedia
      })
    }
  }

  self.getMediaEpisodes = function (id) {
      if (id in self.cache.getMediaEpisodes) {
        var deferred = $q.defer()
        deferred.resolve(self.cache.getMediaEpisodes[id])
        return deferred.promise
      } else {
        return $http({
          url: '/media/meta',
          method: 'GET',
          params: {
            id : id,
          }
        }).then(function (response) {
          self.cache.getMediaEpisodes[id] = _.filter(response.data, function (data) { return 'meta' in data })
          return self.cache.getMediaEpisodes[id]
        })
      }
  }

}])