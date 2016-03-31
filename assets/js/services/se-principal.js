angular.module('ambrosia').service('sePrincipal',
['$q', '$http', '$rootScope', 'Flash',
function ($q, $http, $rootScope, Flash)
{
  var _identity = undefined, _authenticated = false

  var storageIndex = "hopShares.identity"

  return {
    isIdentityResolved: function() {
      return angular.isDefined(_identity);
    },
    isAuthenticated: function() {
      console.log(_identity)
      return _authenticated;
    },
    isInRole: function(role) {

      if (!_authenticated || !_identity.role) {
        return false
      }
      return _identity.role >= role
    },
    isInAnyRole: function(role) {
      if (!_authenticated || !_identity.role) {
        return false
      }
      return true
    },
    authenticate: function(identity) {
      _identity = identity
      _authenticated = identity != null

      if (identity) {
        localStorage.setItem(storageIndex, angular.toJson(identity))
      } else {
        localStorage.removeItem(storageIndex)
      }
    },
    identity: function(force) {
      var deferred = $q.defer()
      if (force === true) {
        _identity = undefined
      }
      //Check if the identity is in the service
      if (angular.isDefined(_identity) && _identity != null) {
        console.log('isDefined')
        console.log(_identity)
        deferred.resolve(_identity)
      //Check to see if the identity is in the local storage
      } else if (storageIndex in localStorage) {
        console.log('storageIndex')
        console.log(_identity)
        _identity = angular.fromJson(localStorage.getItem(storageIndex))
        self.authenticate(_identity)
        deferred.resolve(_identity)
      //Check to see if the identity is in the server session
      } else {
        $http({
          url: '/recover',
          method: 'GET',
        }).then(function (res) {
          var data = res.data.user
          _identity = data
          _authenticated = true
          console.log('http')
          console.log(_identity)
          deferred.resolve(_identity)
        }, function(err){
          _identity = null
          _authenticated = false
          deferred.resolve(_identity)
        })
      }
      return deferred.promise
    }
  }

}])
