angular.module('ambrosia').service('seAuthorization',
['$rootScope', '$state', 'sePrincipal',
function ($rootScope, $state, sePrincipal)
{
  return {
    authorize: function() {
      return sePrincipal.identity()
        .then(function(data) {
          var isAuthenticated = sePrincipal.isAuthenticated()
          console.log(data)
          console.log($rootScope.toState.data)
          if ('data' in $rootScope.toState && 'role' in $rootScope.toState.data && !sePrincipal.isInRole($rootScope.toState.data.role)) {
            console.log('bad')
            if (isAuthenticated) {
              console.log('bad2')
              $state.go('home') // user is signed in but not authorized for desired state
            } else {
              console.log('bad3')
              // user is not authenticated. stow the state they wanted before you
              // send them to the signin state, so you can return them when you're done
              $rootScope.returnToState = $rootScope.toState
              $rootScope.returnToStateParams = $rootScope.toStateParams
              // now, send them to the signin state so they can log in
              $state.go('home')
            }
          }
        })
    }
  }
}])
