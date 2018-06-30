angular.module('ambrosia').service('seSenderHelper',
['$rootScope', 'seSender', 'seMedia', '$q', function ($rootScope, seSender, seMedia, $q) {

    var self = this

    self.print = function (response) {
      console.log(self.logName + " response: ", response)
    }

    self.params = {
        loaded : false,
        paused : false,
        casting : false,
        seeking : false,
        sticky : false,
        newest : false,
        ordered : false,
        pulseSkip : false,
        ordDirection : 1,
        volume : 80,
        tvPicked : 0,

        pre : '',
        post : '',
        map : {},
        progress : 0,
        channel : 0,
        path : '',
        excludes : [],
        selected : null,
        allChannels : [{ name : "Channel 404", shows : ["tt0397306", "tt1486217", "tt1561755"]}],
    }

    self.selectMedia = function(shows){
      console.log("selectMedia", shows)
      console.log("self.params",self.params)

      var tv = []
      var movies = []

      for (var i = 0; i < shows.length; i++) {
        if (self.params.map[shows[i]].type === 'tv'){
          tv.push(i)
        } else {
          movies.push(i)
        }
      }

      if (tv.length > 1 && movies.length > 1) {
        console.log("Movies and TV")
        console.log("tv", tv.length)
        console.log("movies", movies.length)
        console.log("tvPicked",self.params.tvPicked)
        if (self.params.tvPicked < 5) {
          self.params.tvPicked += 1
          return tv[chance.integer({min: 0, max: tv.length - 1})]
        } else {
          self.params.tvPicked = 0
          return movies[chance.integer({min: 0, max: movies.length - 1})]
        }
      } else {
        console.log("Only one kind of media")
        return chance.integer({min: 0, max: shows.length - 1})
      }
    }

    self.load = function (excludes) {
       seSender.setup()
       var deferred = $q.defer()
       self.params.excludes = excludes
       if (self.params.loaded) {
            deferred.resolve(self.params.allChannels)
       } else {
           seMedia.getMedia().then(function(meta){
               _.each(meta, function (file){
                   if ('imdbId' in file && !('imdbId' in self.params.map)) {
                       self.params.map[file['imdbId']] = file
                   }
               })
               seMedia.getMediaStatic().then(function(data){
                   if (meta) {
                       self.params.allChannels = seMedia.getConstructedChannels(meta)
                   }
                   self.params.pre = data.pre
                   self.params.post = data.post
                   self.ctrl = {
                     init : function () {
                       console.log("loading...")
                       if (self.params.selected != null && self.params.path) {
                         $rootScope.$broadcast('mediaSelected', self.params.selected)
                         var curr = seSender.getCurrentMedia()
                         console.log(curr)
                         if (!curr) {
                            console.log("loading: ", self.params)
                            seSender.loadCustomMedia( (self.params.pre + self.params.path + self.params.post).replace(/"/g, "") )
                         }
                       } else {
                         this.loadMedia()
                       }
                     },
                     loadMedia : function (pick) {
                       var picked = this.pickMedia(pick)
                       self.params.progress = 0
                       self.params.path = picked
                       if (self.params.selected.type === 'tv') {
                         self.params.selected.pFormatted = this.episodeFormatted(self.params.path)
                       }
                       console.log('parts', self.params.pre, picked, self.params.post)

                       $rootScope.$broadcast('mediaSelected', self.params.selected)

                       seSender.loadCustomMedia( (self.params.pre + picked + self.params.post).replace(/"/g, "") )
                     },
                     pickMedia : function (pick) {
                       var channel = self.params.allChannels[self.params.channel]
                       console.log('channel', channel, self.params.channel)
                       var selected = self.params.selected
                       if (pick) {
                         selected = self.params.selected = self.params.map[pick]
                       } else {
                         if (!self.params.sticky || self.params.selected == null) {
                           var iSelection = self.selectMedia(channel.shows)
                           if ( self.params.selected !== null || checkExclude(channel, iSelection)) {
                             if (self.params.selected === null) {
                               self.params.selected = self.params.map[channel.shows[iSelection]]
                             }
                             var nSelection = _.indexOf(channel.shows, self.params.selected.imdbId)
                             trycount = 0
                             while ((nSelection === iSelection || checkExclude(channel, iSelection)) && trycount < 10) {
                               //Slowly try to select for movies if it looks like tv isnt working out
                               if (self.params.tvPicked > 0 && trycount < 5){
                                self.params.tvPicked -= 1
                               }
                               iSelection = self.selectMedia(channel.shows)
                               trycount += 1
                             }
                           }
                           selected = self.params.selected = self.params.map[channel.shows[iSelection]]
                         }
                       }
                       console.log('selected', selected)
                       if (selected.episodes.length == 0) {
                         return selected.path
                       } else {
                         if (self.params.newest) {
                           return selected.episodes[selected.episodes.length - 1]
                         } else if (self.params.ordered && self.params.path && _.contains(selected.episodes, self.params.path)) {
                           var thisIndex = selected.episodes.indexOf(self.params.path)
                           if (thisIndex + self.params.ordDirection > selected.episodes.length - 1) {
                             thisIndex = 0
                           } else if (thisIndex + self.params.ordDirection < 0) {
                             thisIndex = selected.episodes.length - 1
                           } else {
                             thisIndex += self.params.ordDirection
                           }
                           return selected.episodes[thisIndex]
                         } else {
                           return selected.episodes[chance.integer({min: 0, max: selected.episodes.length - 1})]
                         }
                       }
                     },
                     prevM : function () {
                       self.params.ordDirection = -1
                       if (self.params.progress > 10) {
                         self.params.progress = 0
                         this.seekHelper(0)
                       } else {
                         this.loadMedia()
                       }
                     },
                     nextM : function () {
                       self.params.ordDirection = 1
                       this.loadMedia()
                     },
                     seekM : function (progress) {
                       this.seekHelper(progress)
                     },
                     playM : function () {
                       if (self.params.paused) {
                         seSender.playMedia(false)
                       } else {
                         seSender.playMedia(true)
                       }
                       self.params.paused = !self.params.paused
                     },
                     navC : function (dir) {
                       self.params.tvPicked = 0;
                       self.params.sticky = false
                       if (dir + self.params.channel < 0) {
                         self.params.channel = self.params.allChannels.length - 1
                       } else if (dir + self.params.channel > self.params.allChannels.length - 1) {
                         self.params.channel = 0
                       } else {
                         self.params.channel = dir + self.params.channel
                       }
                       $rootScope.$broadcast('channelSelected', self.params.channel)
                       this.loadMedia()
                     },
                     rCast : function() {
                       seMedia.getMediaUpdate().then(function(data){
//
//                         var redirectTab = window.open("data:text/json," + encodeURIComponent(data),"_blank")
//                         redirectTab.location

                         //var myjson = JSON.stringify(json, null, 2);
//                         console.log(data);
//                         var x = window.open();
//                         x.document.open();
//                         x.document.write('<html><body><pre>' + data + '</pre></body></html>');
//                         x.document.close();
                         window.open('data:application/json,'
                            +JSON.stringify(data).replace(/([[{,])/g, "$1%0a"),
                            'jsonFrame',
                            'resizeable,top=100, left=100, height=200, width=300,status=1')

                         console.log(data)

                         if ('getMedia' in seMedia.cache) {
                           delete seMedia.cache['getMedia']
                         }
                         self.params.loaded = false
                         self.load()
                       })
                     },
                     setV : function(vol){
                       console.log('volume', vol)
                       self.params.volume = vol
                       seSender.setReceiverVolume(self.params.volume / 100, false)
                     },
                     episodeFormatted : function (path) {
                       var pFormatted = path.substring(path.substring(0, path.length -1).lastIndexOf('/') + 1, path.length -1 )
                       var season = pFormatted.substring(0, pFormatted.length - 2)
                       var episode = pFormatted.substring(pFormatted.length - 2, pFormatted.length)
                       seMedia.getMediaAnalytics(self.params.selected.name).then(function(result){
                         console.log(result)
                       })
                       seMedia.getEpisode(self.params.selected.name, season, episode).then(function(result){
                         console.log(result)
                         self.params.selected.epMeta = result
                       })
                       return "Season: " + season + " Episode: " + episode
                     },
                     seekHelper : function (progress) {
                       self.params.seeking = true
                       seSender.seekMedia(progress)
                     },
                     toggleCast : function(){
                       console.log('toggle', self.params.casting)
                       if (self.params.casting) {
                         seSender.stopApp()
                       } else {
                         seSender.launchApp()
                       }
                       self.params.casting = !self.params.casting
                     },
                     updateSender : function(){
                        console.log('pulse', self.params.pulseSkip)
                        seSender.setSkipPulse(self.params.pulseSkip)
                     }
                   }
                   self.params.loaded = true
                   deferred.resolve(self.params.allChannels)
               })
           })
       }
       return deferred.promise
    }

    function checkExclude (channel, selected) {
       /* return true if the exclude map contains the selection */
       return self.params.excludes.indexOf(self.params.map[channel.shows[selected]].imdbId) > -1
    }

}]);