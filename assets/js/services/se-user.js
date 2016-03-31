angular.module('ambrosia').service('seUser',
['$http', '$rootScope', 'Flash',
function ($http, $rootScope, Flash)
{
  var self = this
  self.logName = 'seUser'

  self.unknown_user = {
      photo : 'assets/img/test/test_logged_out.png',
      name : 'Logged Out',
      email : '',
      gender : '',
      address1 : '',
      address2 : '',
      city : '',
      state : '',
      zip : 00000,
      background : 7,
  }

  /*self.user = {
      photo : 'assets/img/test/test_user.png',
      name : 'Geoff Test',
      email : 'geoffrey.test@gmail.com',
      gender : 'M',
      address1 : '1201 Awesome Ave',
      address2 : '#108',
      city : 'Beverly Hills',
      state : 'CA',
      zip : 90210,
      background : 7,
  }*/

  self.register = function (username, password, type, callback) {

       console.log('logging in...')

       $http({
         url: '/register',
         method: "POST",
         data: {
           email : username,
           pass : password,
           type : type,
         },
         headers: {
           'Content-Type': 'application/json'
         }
       }).then(function(res) {
         console.log('Success!')
         console.log(res)
         self.loggedIn = true
         self.user = res.data.user
         callback(res)
       }, function(err){
         console.log('Error!')
         console.log(err)
         self.loggedIn = false
         Flash.create('danger', err.data.err)
         callback(err)
       })
    }

  self.login = function (username, password, type, callback) {
     $http({
       url: '/login',
       method: "POST",
       params: {
           username : username,
           password : password,
           type : type,
       },
       headers: {
         'Content-Type': 'application/json'
       }
     }).then(function(res) {
       console.log('Success!')
       console.log(res)
       self.loggedIn = true
       self.user = res.data.user
       callback(res)
     }, function(err){
       console.log('Error!')
       console.log(err)
       self.loggedIn = false
       Flash.create('danger', err.data.err)
       callback(err)
     })
  }

  self.logout = function (callback) {
    $http({
      url: '/logout',
      method: 'GET',
    }).then(function (res) {
      console.log(res)
      self.loggedIn = false
      callback(res)
    })
  }

  self.recover = function (callback) {
    $http({
      url: '/recover',
      method: 'GET',
    }).then(function (res) {
      console.log('Success!')
      console.log(res)
      self.loggedIn = true
      self.user = res.data.user
      callback(res)
    }, function(err){
      console.log('Error!')
      console.log(err)
      self.loggedIn = false
      callback(err)
    })
  }

  self.update = function (user, callback) {
       console.log('updating')

       $http({
         url: '/updateUser',
         method: "POST",
         params: {
             user : user
         },
         headers: {
           'Content-Type': 'application/json'
         }
       }).then(function(res) {
         console.log('Success!')
         console.log(res)
         Flash.create('success', 'User Updated')
         self.loggedIn = true
         self.user = res.data.user
         $rootScope.$broadcast('update')
         callback(res)
       }, function(err){
         console.log('Error!')
         console.log(err)
         Flash.create('danger', err.data.err)
         callback(err)
       })
  }

  self.loggedIn = false

  self.getUser = function(){
    if (self.loggedIn) {
        return self.user
    } else {
        return self.unknown_user
    }
  }

  self.print = function (response) {
    console.log(self.logName + " response: ", response)
  }

}]);
