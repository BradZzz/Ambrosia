angular.module('ambrosia').directive('seScroll', [ function () {
  return {
    restrict: 'E',
    scope: {
      callback: '&'
    },
    link: function(scope, element, attrs) {
        var raw = element[0]
        var visibleHeight = raw.scrollHeight
        var threshold = 1200
        element.bind('scroll', function () {
            var scrollableHeight = element.prop('scrollHeight');
            var hiddenContentHeight = scrollableHeight - visibleHeight
            if ((hiddenContentHeight - this.scrollTop) <= threshold) {
                scope.callback()
            }
        })
    }
  }
}])
