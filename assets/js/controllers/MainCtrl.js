angular.module('ambrosia').controller('MainCtrl',
['$scope', '$rootScope', '$q', '$state', 'seMedia',
 function ($scope, $rootScope, $q, $state, seMedia)
{
    console.log('MainCtrl')

    $rootScope.loading = true

    $scope.ctrl = {
        data : [],
        fData : [],
        loading : false,
        onAir : false,
        contains : '',
        refresh : function () {
            this.loading = true
            console.log("Loading: " + $scope.ctrl.loading)
            this.filterItems()
            this.loading = false
            console.log("Loading: " + $scope.ctrl.loading)
        },
        filterItems : function () {
            this.fData = _.filter(this.data, function(item){
                var truthy = true
                if ($scope.ctrl.onAir) {
                    truthy = truthy && item.meta[0].Status[0] === "Continuing"
                }
                if ($scope.ctrl.contains) {
                    truthy = truthy && item.name.indexOf($scope.ctrl.contains) > -1
                }
                return truthy
            })
        },
        navigate : function (id) {
            $state.go('series', { id: id })
        }

    }

    seMedia.getAllMedia().then(function(data){
        console.log(data)
        $scope.ctrl.data = $scope.ctrl.fData = data
        $rootScope.loading = false
    })

}])