angular.module('ambrosia').controller('MainCtrl',
['$scope', '$rootScope', '$q', '$state', 'seMedia',
 function ($scope, $rootScope, $q, $state, seMedia)
{
    console.log('MainCtrl')

    $rootScope.loading = true

    $scope.ctrl = {
        data : [],
        lastData : [],
        page : 0,
        limit : 50,
        contains : '',
        loading : false,
        onAir : false,
        fetching : false,
        contains : '',
        refresh : function () {
            this.loading = true
            this.page = 0
            this.data = []
            loadStuff()
        },
        navigate : function (id) {
            $state.go('series', { id: id })
        },
        loadMore : function() {
            if (!$scope.ctrl.fetching) {
                console.log('load more!!!')
                $scope.ctrl.fetching = true
                loadStuff()
            } else {
                console.log('still fetching')
            }
        }

    }

    function loadStuff() {
        seMedia.getAllMedia($scope.ctrl.page, $scope.ctrl.limit, $scope.ctrl.contains, $scope.ctrl.onAir).then(function(data){
            if ($scope.ctrl.lastData != data) {
              console.log(data)
              $scope.ctrl.lastData = data
              $scope.ctrl.data = _.flatten([$scope.ctrl.data, data])
              console.log($scope.ctrl.data)
              $scope.ctrl.page += 1
              $rootScope.loading = false
              $scope.ctrl.fetching = false
              $scope.ctrl.loading = false
            }
        })
    }

    loadStuff()

}])