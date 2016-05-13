angular.module('ambrosia').controller('SeriesCtrl',
['$scope', '$rootScope', '$stateParams', '$state', 'seMedia',
function ($scope, $rootScope, $stateParams, $state, seMedia)
{

    $rootScope.loading = true
    $rootScope.loading = false

    $scope.images = []

    $scope.ctrl = {
        id : $stateParams.id,
        series : {},
        images : {},
        episodes : {},
        parseStringArray : function (actorString) {
            console.log(actorString)
            var actorArr = actorString.split("|")
            actorArr.shift()
            actorArr.pop()
            return actorArr
        }
    }

    seMedia.getMediaEpisodes($stateParams.id).then(function(response){
      $scope.ctrl.series = response.Data

      console.log("Series", $scope.ctrl.series.Series[0])
      console.log("Episodes", $scope.ctrl.series.Episode)

      var series = $scope.ctrl.series.Series[0]
      if (series.banner[0]) {
        $scope.ctrl.images.banner = "http://thetvdb.com/banners/" + series.banner[0]
      }
      if (series.poster[0]) {
        $scope.ctrl.images.poster = "http://thetvdb.com/banners/" + series.poster[0]
      }
      if (series.fanart[0]) {
        $scope.ctrl.images.fanart = "http://thetvdb.com/banners/" + series.fanart[0]
      }
      console.log($scope.ctrl.series.Episode)
      _.each($scope.ctrl.series.Episode, function(episode){
        console.log(episode)
        if (!(episode.SeasonNumber[0] in $scope.ctrl.episodes)) {
            $scope.ctrl.episodes[episode.SeasonNumber[0]] = {}
        }
        if (episode.EpisodeNumber[0]) {
            $scope.ctrl.episodes[episode.SeasonNumber[0]][episode.EpisodeNumber[0]] = episode
        }
      })
    })

}])