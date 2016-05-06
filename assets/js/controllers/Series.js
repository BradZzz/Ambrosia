angular.module('ambrosia').controller('SeriesCtrl',
['$scope', '$rootScope', '$stateParams', '$state', 'seMedia',
function ($scope, $rootScope, $stateParams, $state, seMedia)
{

    $rootScope.loading = true
    $rootScope.loading = false

    $scope.ctrl = {
        id : $stateParams.id,
        series : {},
    }

    seMedia.getMediaEpisodes($stateParams.id).then(function(response){
      $scope.ctrl.series = response.Data
    })

}])