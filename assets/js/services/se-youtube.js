angular.module('ambrosia').service('seMedia',
['$http', '$q', 'Flash',
function ($http, $q, Flash)
{
  var self = this
  self.logName = 'seMedia'
  self.cache = {}

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
}])