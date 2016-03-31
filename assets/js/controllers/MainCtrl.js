angular.module('ambrosia').controller('MainCtrl',
['$scope', '$rootScope', '$q', 'seQuotes', 'seStatic',
 function ($scope, $rootScope, $q, seQuotes, seStatic)
{
    console.log('MainCtrl')

    $rootScope.loading = true

    $scope.ctrl = {
        size : 25,
        list : {},
        links : ['share', 'save', 'hide', 'report']
    }

    if (seStatic.main.length > 0) {
        $scope.ctrl.list = seStatic.main
        $rootScope.loading = false
    } else {
        seQuotes.getTestList().then(function(list){
           console.log('finished')
           var newList = []
           list = _.map(list, function(pick){ return pick })

           while (newList.length < $scope.ctrl.size) {
                var index = chance.integer({min: 0, max: list.length - 1})
                console.log(list[index].ticker)
                if ((list[index].ticker).indexOf('^') === -1) {
                    newList.push(list[index])
                    list.splice(index, 1)
                }
           }

           /* Here we need to query each of these stocks for its info */
           list = _.sortBy( newList , function(pick){ return -pick.invested })

           var promises = []
           _.each(list, function(stock){
             promises.push(seQuotes.getCompany(stock.ticker).then(function(result){
                var deferred = $q.defer()
                console.log(result)
                /*{"symbol":"AAPL","ask":105.69,"averageDailyVolume":46389800,"bid":105.65,"askRealtime":null,"bidRealtime":null,
                "bookValue":23.13,"changeAndPercentChange":-0.0046,"change":-0.46,"commission":null,"changeRealtime":null,
                "afterHoursChangeRealtime":null,"dividendPerShare":2.08,"lastTradeDate":"2016-03-24T07:00:00.000Z",
                "tradeDate":null,"earningsPerShare":9.4,"epsEstimateCurrentYear":9.07,"epsEstimateNextYear":10.02,
                "epsEstimateNextQuarter":1.78,"daysLow":104.89,"holdingsGainPercent":null,"annualizedGain":null,
                "holdingsGain":null,"holdingsGainPercentRealtime":null,"holdingsGainRealtime":null,"daysHigh":106.25,
                "moreInfo":null,"orderBookRealtime":null,"52WeekLow":92,"marketCapitalization":"585.90B","marketCapRealtime":null,
                "ebitda":"82.79B","changeFrom52WeekLow":13.67,"percentChangeFrom52WeekLow":0.14859999999999998,"52WeekHigh":134.54,
                "lastTradeRealtimeWithTime":null,"changePercentRealtime":null,"changeFrom52WeekHigh":-28.87,"percebtChangeFrom52WeekHigh":-0.2146,
                "lastTradeWithTime":"4:00pm - <b>105.67</b>","lastTradePriceOnly":105.67,"highLimit":null,"lowLimit":null,
                "daysRange":"104.89 - 106.25","daysRangeRealtime":null,"50DayMovingAverage":99.72,"200DayMovingAverage":107.91,
                "changeFrom200DayMovingAverage":-2.24,"percentChangeFrom200DayMovingAverage":-0.0208,"changeFrom50DayMovingAverage":5.95,
                "percentChangeFrom50DayMovingAverage":0.059699999999999996,"name":"Apple Inc.","notes":null,"open":105.59,
                "previousClose":106.13,"pricePaid":null,"changeInPercent":-0.0043,"pricePerSales":2.5,"pricePerBook":4.59,
                "exDividendDate":"2/4/2016","peRatio":11.25,"dividendPayDate":"2/11/2016","peRatioRealtime":null,"pegRatio":1,
                "pricePerEpsEstimateCurrentYear":11.65,"pricePerEpsEstimateNextYear":10.55,"sharesOwned":null,"shortRatio":"1.14",
                "lastTradeTime":"4:00pm","tickerTrend":null,"1YrTargetPrice":134.08,"volume":26132955,"holdingsValue":null,
                "holdingsValueRealtime":null,"52WeekRange":"92.00 - 134.54","daysValueChange":null,"daysValueChangeRealtime":null,
                "stockExchange":"NMS","dividendYield":1.95}*/
                var newStock = stock
                newStock.info = result
                if (newStock.info.change === null) {
                    newStock.info.change = 0
                }
                deferred.resolve(newStock)
                return deferred.promise
             }))
           })

           $q.all(promises).then(
             function(results){
               console.log("Finished!")
               console.log(results)
               seStatic.main = results
               $scope.ctrl.list = seStatic.main
               $rootScope.loading = false
             },function(err){
               console.log(err)
           })
        })
    }

}])
