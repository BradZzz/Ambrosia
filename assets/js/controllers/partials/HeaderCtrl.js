angular.module('ambrosia').controller('HeaderCtrl',
<<<<<<< HEAD
['$scope', '$state', '$rootScope', '$timeout', '$mdSidenav', '$log', 'seMedia', 'seTheme', 'sePrincipal', 'seAuthorization',
function ($scope, $state, $rootScope, $timeout, $mdSidenav, $log, seMedia, seTheme, sePrincipal, seAuthorization)
=======
['$scope', '$state', '$rootScope', '$timeout', '$mdSidenav', '$log', '$q', 'seQuotes', 'seTheme', 'sePrincipal', 'seAuthorization', 'seLedger',
function ($scope, $state, $rootScope, $timeout, $mdSidenav, $log, $q, seQuotes, seTheme, sePrincipal, seAuthorization, seLedger)
>>>>>>> 8191297f97b907b19ed73d19550884c7c59c56bf
{
  $scope.loginRegister = {
    isLoggingIn : true,
    loggedIn : sePrincipal.isAuthenticated(),
    logForm : { username : '', password : '', active : false },
    test : {},
    register : function () {
        console.log(this)
        if (this.isLoggingIn) {
            this.isLoggingIn = false
        } else {
            console.log(arguments)
            sePrincipal.register.apply(this, arguments).then($scope.loginRegister.refresh())
        }
    },
    login : function () {
        console.log(this)
        if (!this.isLoggingIn) {
            this.isLoggingIn = true
        } else {
            console.log(arguments)
            sePrincipal.login.apply(this, arguments).then($scope.loginRegister.refresh())
        }
    },
    loginSpecial : function () {
        sePrincipal.login.apply(this, arguments).then( function(data) {
            console.log(data)
            $state.go('home')
        }, function (err) {
            console.log(err)
        })
    },
    logout : function () {
        $scope.loginRegister.refresh()
        sePrincipal.logout()
        $state.go('login')
    },
    refresh : function () {
        $rootScope.safeApply(function () {
            sePrincipal.identity().then(function(data){
              console.log(data)
              $scope.loginRegister.test = data
            })
            //$scope.loginRegister.test = sePrincipal.identity()
            $scope.loginRegister.loggedIn = sePrincipal.isAuthenticated()
            console.log('User:', $scope.loginRegister.test)
        })
    },
  }

  $scope.ctrl = {
    simulateQuery : false,
    isDisabled : false,
    querySearch : function (query) {
        var self = this
        console.log("query", query)
        if (query) {
            var deferred = $q.defer()
            seQuotes.getSearchCompany(query.toLowerCase()).then(function(results){
                deferred.resolve( _.map(results, function(result){ return {
                      display : result.name + " (" + result.symbol + ")",
                      value : result.symbol.toLowerCase()
                  }
                }))
            })
            return deferred.promise
        } else {
            return []
        }
    },
    selectedItemChange : function (item) {
        if (item && 'value' in item && 'type' in item) {
          console.log(item)
          $state.go('media', { value: item.display, type: item.type })
        }
    },
    searchTextChange : function (text) {
      console.log('Text changed to ' + text);
    },
    newState : function (state) {
      alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    },
    nav : [
        { icon : 'ion-android-home', text : 'Home', click : function(){$state.go('home')} },
        { icon : 'ion-folder', text : 'Profile', click : function(){$state.go('profile')} },
        { icon : 'ion-ios-pulse-strong', text : 'Analytics', click : function(){$state.go('analytics')} },
        { icon : 'ion-ios-gear', text : 'Settings', click : function(){$state.go('settings')} },
        { icon : 'ion-android-exit', text : 'Logout', click : function(){ $scope.loginRegister.logout() } },
    ],
    incBackground : function (offset) {
        if ($scope.loginRegister.test.background + offset > this.backgrounds.length - 1 ) {
            $scope.loginRegister.test.background = 0
        } else if ($scope.loginRegister.test.background + offset < 0 ) {
            $scope.loginRegister.test.background = this.backgrounds.length - 1
        } else {
            $scope.loginRegister.test.background += offset
        }
    },
    backgrounds : seTheme.backgrounds,
  }

  $scope.loginRegister.refresh()

  $scope.$on('update', function () {
    console.log('update!')
    $scope.loginRegister.refresh()
  })

<<<<<<< HEAD
  //This runs once when the user refreshes the browser
  //seUser.recover(function(data){
  //    $scope.loginRegister.refresh()
  //})

  seMedia.getMedia().then(function(response){
      console.log('test list response: ', response)
      $scope.ctrl.states = _.map( seMedia.getSearchFormatted(response) , function (meta) {
=======
  /*seQuotes.getPendingList().then(function(response){
      $scope.ctrl.states = _.map( response , function (tick) {
>>>>>>> 8191297f97b907b19ed73d19550884c7c59c56bf
         return {
           value: meta.value.toLowerCase(),
           display: meta.value,
           type: meta.type
         }
      })
<<<<<<< HEAD
  })
=======
  })*/
>>>>>>> 8191297f97b907b19ed73d19550884c7c59c56bf

  $scope.toggleRight = buildToggler('left')

  $scope.isOpenRight = function(){
    return $mdSidenav('left').isOpen()
  }
  function debounce(func, wait, context) {
    var timer;
    return function debounced() {
      var context = $scope,
          args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer)
      timer = $timeout(function() {
        timer = undefined
        func.apply(context, args)
      }, wait || 10)
    }
  }
  function buildDelayedToggler(navID) {
    return debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done")
        })
    }, 200)
  }
  function buildToggler(navID) {
    return function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done")
        })
    }
  }
}]).controller('LeftCtrl',
['$scope', '$timeout', '$mdSidenav', '$log',
function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close left is done")
        })
    }
}])