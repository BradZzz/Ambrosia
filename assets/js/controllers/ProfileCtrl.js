angular.module('ambrosia').controller('ProfileCtrl',
['$scope', '$http', '$rootScope', '$state', '$timeout', 'seUser', 'seTheme', 'Upload',
function ($scope, $http, $rootScope, $state, $timeout, seUser, seTheme, Upload)
{

    $rootScope.loading = true
    $rootScope.loading = false

    $scope.ctrl = {
        active : false,
        user : seUser.getUser(),
        imageUploaded : function(filePath) {
            $scope.ctrl.user.photo = filePath + '?' + new Date().getTime()
            $scope.ctrl.saveClicked($scope.ctrl.user)
        },
        saveClicked : function(user) {
          seUser.update(user, function(resp){
            $scope.ctrl.user = seUser.getUser()
            $scope.ctrl.active = false;
            console.log($scope.ctrl.user)
          })
        },
        incBackground : function (offset) {
          if (this.user.background + offset > this.backgrounds.length - 1 ) {
            this.user.background = 0
          } else if (this.user.background + offset < 0 ) {
            this.user.background = this.backgrounds.length - 1
          } else {
            this.user.background += offset
          }
        },
        backgrounds : seTheme.backgrounds,
        states : ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
            'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH',
            'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
    }

    //This runs once when the user refreshes the browser
    seUser.recover(function(data){
        console.log('finished',data)
        $rootScope.safeApply(function () {
          $scope.ctrl.user = seUser.getUser()
        })
    })

}])
