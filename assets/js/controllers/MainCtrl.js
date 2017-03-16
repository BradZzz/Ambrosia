angular.module('ambrosia').controller('MainCtrl',
['$scope', '$rootScope', '$q', 'seMedia', 'seSenderHelper', 'sePrincipal',
 function ($scope, $rootScope, $q, seMedia, seSenderHelper, sePrincipal)
{
    console.log('MainCtrl')

    $rootScope.loading = true

    $scope.user = {}

    $scope.params = {
        /* Shows to never play */
        excludes : [],

        /* for the ui */
        flipped : false,

        /* for the cast player */
        volSettings : [100,90,80,70,60,50,40,30,20,10,0],
        volume : 80,
        paused : false,
        casting : false,
        seeking : false,
        sticky : false,
        newest : false,
        ordered : false,
        ordDirection : 1,
        progress : 0,

        /* for the meta */
        path : '',
        selected : null,
        channel : 0,
        //allChannels : [$scope.sChannel],
        //map : {},
    }

    function load() {

        $rootScope.loading = false

        $scope.ctrl = {
          init : function () {
            seSenderHelper.ctrl.init()
          },
          loadMedia : function (pick) {
            seSenderHelper.ctrl.loadMedia(pick)
          },
          pickMedia : function (pick) {
            seSenderHelper.ctrl.pickMedia(pick)
          },
          prevM : function () {
            seSenderHelper.ctrl.prevM()
          },
          nextM : function () {
            seSenderHelper.ctrl.nextM()
          },
          seekM : function () {
            seSenderHelper.ctrl.seekHelper($scope.params.progress)
          },
          playM : function () {
            seSenderHelper.ctrl.playM()
            $scope.params.paused = seSenderHelper.params.paused
          },
          navC : function (dir) {
            seSenderHelper.ctrl.navC(dir)
          },
          rCast : function() {
            seSenderHelper.ctrl.rCast()
          },
          setV : function(vol){
            $scope.params.volume = vol
            seSenderHelper.ctrl.setV(vol)
          },
          episodeFormatted : function (path) {
            seSenderHelper.ctrl.episodeFormatted(path)
          },
          seekHelper : function (progress) {
            seSenderHelper.ctrl.seekHelper(progress)
          },
          toggleCast : function(){
            seSenderHelper.ctrl.toggleCast()
            $scope.params.casting = seSenderHelper.params.casting
          },
          updateParams : function() {
            seSenderHelper.params.sticky = $scope.params.sticky
            seSenderHelper.params.newest = $scope.params.newest
            seSenderHelper.params.ordered = $scope.params.ordered
          }
        }

        $scope.params.allChannels = seSenderHelper.params.allChannels
        $scope.params.map = seSenderHelper.params.map

        $scope.ctrl.init()
    }

    sePrincipal.identity().then( function(data){
        $scope.user = data
        if (!('exclude' in $scope.user)) {
            $scope.user.exclude = []
        }
        $scope.params.excludes = _.map($scope.user.exclude, function(ex){
            return ex.imdbId
        })
        seSenderHelper.load($scope.params.excludes).then(function(params){
            console.log('load')
            load()
        })
    })

    //Receivers
    $scope.$on('update', function (scope, media) {
      console.log('on-update')
    })
    $scope.$on('progress', function (scope, progress) {
      console.log('progress', progress, $scope.params.seeking)
      if ($scope.params.seeking) {
        if ($scope.params.progress === progress) {
            $scope.params.seeking = false
        }
      } else {
        $scope.safeApply(function () {
         $scope.params.progress = progress
        })
      }
      //scope.params.paused = true
    })
    $scope.$on('retry', function () {
      console.log('on-retry')
      $scope.params.ordDirection = 1
      $scope.ctrl.nextM()
    })
    $scope.$on('finish', function () {
       console.log('on-finish')
       $scope.params.ordDirection = 1
       $scope.ctrl.nextM()
    })
    $scope.$on('init', function () {
        console.log('init')
        if ('ctrl' in $scope && 'init' in $scope.ctrl) {
          console.log('init')
          $scope.ctrl.init()
        } else {
          console.log('no init')
        }
    })
    $scope.$on('mediaSelected', function (scope, selected) {
      console.log('mediaSelected', selected)
      $scope.params.selected = selected
    })
    $scope.$on('channelSelected', function (scope, selected) {
      console.log('channelSelected', selected)
      $scope.params.channel = selected
    })

}])