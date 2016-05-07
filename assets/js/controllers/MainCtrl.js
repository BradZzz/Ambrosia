angular.module('ambrosia').controller('MainCtrl',
['$scope', '$rootScope', '$q', 'seMedia', 'seSender',
 function ($scope, $rootScope, $q, seMedia, seSender)
{
    console.log('MainCtrl')

    $rootScope.loading = true

    seSender.setup()

    $scope.sChannel = {
        name : "Loading Channels...",
        shows : ["tt0397306", "tt1486217", "tt1561755"]
    }

    $scope.params = {
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
        allChannels : [$scope.sChannel],
        map : {},
    }

    function load() {
        seMedia.getMedia().then(function(meta){
            _.each(meta, function (file){
                if ('imdbId' in file && !('imdbId' in $scope.params.map)) {
                    $scope.params.map[file['imdbId']] = file
                }
            })
            console.log('formatted', $scope.params.map)
            seMedia.getMediaStatic().then(function(data){
                if (meta) {
                    $scope.params.allChannels = seMedia.getConstructedChannels(meta)
                }
                console.log('channels', $scope.params.allChannels)
                $scope.params.pre = data.pre
                $scope.params.post = data.post
                $scope.ctrl = {
                  init : function () {
                    $rootScope.loading = false
                    this.loadMedia()
                  },
                  loadMedia : function (pick) {
                    var picked = this.pickMedia(pick)
                    $scope.params.progress = 0
                    $scope.params.path = picked
                    if ($scope.params.selected.type === 'tv') {
                        $scope.params.selected.pFormatted = this.episodeFormatted($scope.params.path)
                    }
                    console.log('parts', $scope.params.pre, picked, $scope.params.post)
                    seSender.loadCustomMedia( ($scope.params.pre + picked + $scope.params.post).replace(/"/g, "") )
                  },
                  loadTestYoutube : function () {
                    //"http://www.youtube.com/embed/GlIzuTQGgzs"
                    //<iframe width="854" height="480" src="https://www.youtube.com/embed/5RwhEHzuulA" frameborder="0" allowfullscreen></iframe>
                    seSender.loadCustomMedia("http://www.youtube.com/embed/GlIzuTQGgzs")
                  },
                  pickMedia : function (pick) {
                    var channel = $scope.params.allChannels[$scope.params.channel]

                    console.log('channel', channel, $scope.params.channel)

                    var selected = $scope.params.selected

                    if (pick) {
                        selected = $scope.params.selected = $scope.params.map[pick]
                    } else {
                        if (!$scope.params.sticky || $scope.params.selected == null) {
                            var iSelection = chance.integer({min: 0, max: channel.shows.length - 1})
                            if ( $scope.params.selected !== null ) {
                                var nSelection = _.indexOf(channel.shows, $scope.params.selected.imdbId)
                                while (nSelection === iSelection) {
                                    iSelection = chance.integer({min: 0, max: channel.shows.length - 1})
                                }
                            }
                            selected = $scope.params.selected = $scope.params.map[channel.shows[iSelection]]
                        }
                    }

                    console.log('selected', selected)

                    if (selected.episodes.length == 0) {
                        return selected.path
                    } else {
                        if ($scope.params.newest) {
                          return selected.episodes[selected.episodes.length - 1]
                        } else if ($scope.params.ordered && $scope.params.path && _.contains(selected.episodes, $scope.params.path)) {
                          var thisIndex = selected.episodes.indexOf($scope.params.path)
                          if (thisIndex + $scope.params.ordDirection > selected.episodes.length - 1) {
                            thisIndex = 0
                          } else if (thisIndex + $scope.params.ordDirection < 0) {
                            thisIndex = selected.episodes.length - 1
                          } else {
                            thisIndex += $scope.params.ordDirection
                          }
                          return selected.episodes[thisIndex]
                        } else {
                          return selected.episodes[chance.integer({min: 0, max: selected.episodes.length - 1})]
                        }
                    }
                  },
                  prevM : function () {
                    console.log('prev')
                    $scope.params.ordDirection = -1
                    if ($scope.params.progress > 10) {
                        $scope.params.progress = 0
                        this.seekHelper(0)
                    } else {
                        this.loadMedia()
                    }

                  },
                  nextM : function () {
                    console.log('next')
                    $scope.params.ordDirection = 1
                    this.loadMedia()
                  },
                  seekM : function () {
                    console.log('seek')
                    this.seekHelper($scope.params.progress)
                  },
                  playM : function () {
                    if ($scope.params.paused) {
                      seSender.playMedia(false)
                    } else {
                      seSender.playMedia(true)
                    }
                    $scope.params.paused = !$scope.params.paused
                  },
                  navC : function (dir) {
                    $scope.params.sticky = false
                    if (dir + $scope.params.channel < 0) {
                        $scope.params.channel = $scope.params.allChannels.length - 1
                    } else if (dir + $scope.params.channel > $scope.params.allChannels.length - 1) {
                        $scope.params.channel = 0
                    } else {
                        $scope.params.channel = dir + $scope.params.channel
                    }
                    this.loadMedia()
                  },
                  rCast : function() {
                    seMedia.getMediaUpdate().then(function(data){
                        if ('getMedia' in seMedia.cache) {
                          delete seMedia.cache['getMedia']
                        }
                        load()
                    })
                  },
                  setV : function(vol){
                    console.log('volume', vol)
                    $scope.params.volume = vol
                    seSender.setReceiverVolume($scope.params.volume / 100, false)
                  },
                  episodeFormatted : function (path) {
                    var pFormatted = path.substring(path.substring(0, path.length -1).lastIndexOf('/') + 1, path.length -1 )
                    var season = pFormatted.substring(0, pFormatted.length - 2)
                    var episode = pFormatted.substring(pFormatted.length - 2, pFormatted.length)

                    console.log('episodeFormatted', pFormatted, season, episode)

                    seMedia.getEpisode($scope.params.selected.name, season, episode).then(function(result){
                        $scope.params.selected.epMeta = result
                    })
                    return "Season: " + season + " Episode: " + episode
                  },
                  seekHelper : function (progress) {
                    $scope.params.seeking = true
                    seSender.seekMedia(progress)
                  },
                  toggleCast : function(){
                    console.log('toggle', $scope.params.casting)
                    if ($scope.params.casting) {
                      seSender.stopApp()
                    } else {
                      seSender.launchApp()
                    }
                    $scope.params.casting = !$scope.params.casting
                  }
                }
                $scope.ctrl.init()
            })
        })
    }

    load()

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
      $scope.ctrl.loadMedia()
    })
    $scope.$on('finish', function () {
       console.log('on-finish')
       $scope.params.ordDirection = 1
       $scope.ctrl.loadMedia()
    })
    $scope.$on('init', function () {
        console.log('init')
        $scope.ctrl.init()
    })

}])