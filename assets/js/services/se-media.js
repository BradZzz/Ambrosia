angular.module('ambrosia').service('seMedia',
['$http', '$q', 'Flash',
function ($http, $q, Flash)
{
  var self = this
  self.logName = 'seMedia'
  self.cache = {}
  self.cache.getMediaEpisodes = {}

  self.getAllMedia = function (page, limit, contains, onair) {
    var params = {
      page : page,
      limit : limit,
      contains : contains ? contains : '',
      onair : onair,
    }
    console.log(params)
    return $http({
      url: '/media/all',
      method: 'GET',
      params: params
    }).then(function (response) {
      return _.sortBy(response.data, function(dat){
        return -(dat.rating ? 1 : 0)
      })
    })
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
          console.log(response)
          self.cache.getMediaEpisodes[id] = response.data/*_.filter(response.data, function (data) { return 'meta' in data })*/
          return self.cache.getMediaEpisodes[id]
        })
      }
  }

}])