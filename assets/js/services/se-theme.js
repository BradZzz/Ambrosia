angular.module('ambrosia').service('seTheme',
['$http',
function ($http)
{
  var self = this
  self.logName = 'seTheme'

  self.backgrounds = ['assets/img/backgrounds/wall_1.png','assets/img/backgrounds/wall_2.png',
      'assets/img/backgrounds/wall_3.png','assets/img/backgrounds/wall_4.png','assets/img/backgrounds/wall_5.png',
      'assets/img/backgrounds/wall_6.png','assets/img/backgrounds/wall_7.png','assets/img/backgrounds/wall_8.png',
      'assets/img/backgrounds/wall_9.png','assets/img/backgrounds/wall_10.png','assets/img/backgrounds/wall_11.png',
      'assets/img/backgrounds/wall_12.png','assets/img/backgrounds/wall_13.png','assets/img/backgrounds/wall_14.png',
      'assets/img/backgrounds/wall_15.png','assets/img/backgrounds/wall_16.png','assets/img/backgrounds/wall_17.png',
      'assets/img/backgrounds/wall_18.png']

  self.print = function (response) {
    console.log(self.logName + " response: ", response)
  }

}]);
