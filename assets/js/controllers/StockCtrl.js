angular.module('ambrosia').controller('StockCtrl',
['$scope', '$rootScope', '$state', '$stateParams', '$location', '$window', 'seQuotes',
function ($scope, $rootScope, $state, $stateParams, $location, $window, seQuotes)
{

    $rootScope.loading = true

    $scope.ctrl = {
        period : 'd',
        ask : 0,
        invested : 0,
        cost : 0,
        invest : function (amount) {
            var timesy = this.actions.plus ? 1 : -1
            this.invested += timesy * amount
            if (this.invested < 0) {
                this.invested = 0
            }

            this.cost = (this.ask * this.invested).toFixed(2)

            if ( this.invested > 0 ) {
              this.company.stockUserDetails.invested.value = 1 + this.company.stockUserDetails.invested.cache
            } else {
              this.company.stockUserDetails.invested.value = this.company.stockUserDetails.invested.cache
            }

            this.company.stockUserDetails.adj.cache = this.company.stockUserDetails.adj.calc(
                this.company.stockUserDetails.transaction.cache , this.company.stockUserDetails.invested.value
            )

            this.company.stockUserDetails.adj.value = '$' + this.company.stockUserDetails.adj.cache

            return
        },
        actions : {
            plus: true,
            commentEx : false,
            commentIcon : function (expanded) {
                return expanded ? 'ion-chevron-down' : 'ion-chevron-up'
            },
            commentUserBase : 'assets/img/test/',
            commentUsers : [
                'test_other_01.png',
                'test_other_02.png',
                'test_other_03.png',
                'test_other_04.png',
                'test_other_05.png',
                'test_other_06.png',
                'test_other_07.png',
                'test_other_08.png',
                'test_other_09.png',
                'test_other_10.png',
            ],
        },
        company : {},
        data : [],
    }

    if ('ticker' in $stateParams) {

        $scope.ctrl.tickerAbbrv = $stateParams.ticker

        seQuotes.getCompany($scope.ctrl.tickerAbbrv).then(function(company){
           $scope.ctrl.ask = company.ask
           $scope.ctrl.company = {
            name : company.name,
            abbr : company.symbol,
            stockDetails : [
                { key : 'Ask', value : company.ask },
                { key : 'Day Low', value : company.daysLow },
                { key : 'Day High', value : company.daysHigh }
            ],
           }
           seQuotes.getTestList().then(function(list){
              console.log('finished')
              console.log(list)
              console.log(_.find(list, function(tick){ return tick.ticker == $scope.ctrl.tickerAbbrv }))
              var companyList = _.find(list, function(tick){ return tick.ticker == $scope.ctrl.tickerAbbrv })
              console.log(companyList)
              $scope.ctrl.company.comments = _.map(companyList.comments,
                function(comment){ return {
                    photo: $scope.ctrl.actions.commentUserBase + $scope.ctrl.actions.commentUsers[chance.integer({ min: 0, max: companyList.comments.length - 1 })],
                    user: comment.user,
                    text: comment.text,
                }
              })
              var invested = companyList.invested
              var transaction = companyList.buyFee
              var calc = function (transaction, invested) {
                console.log("calc", transaction, invested, (parseFloat(transaction) / parseFloat(invested)).toFixed(2))
                return (parseFloat(transaction) / parseFloat(invested)).toFixed(2)
              }
              var adj = calc(transaction, invested)
              $scope.ctrl.company.stockUserDetails = {
                invested : { desc: 'The number of users investing in this stock', key : 'Users Invested:', value : invested, cache : invested },
                transaction : { desc: 'The cost to normally purchase this stock', key : 'Transaction Price:', value : "$" + transaction, cache : transaction },
                adj : { desc: 'The cost that you pay to purchase this stock', key : 'Adj. Transaction Price:', value : "$" + adj, cache : adj, calc : calc },
              }
              checkLoaded()
           })
        })

        seQuotes.getOne($scope.ctrl.tickerAbbrv, $scope.ctrl.period).then(function(response){
            $scope.ctrl.data = response
            console.log(seQuotes.convertHighcharts($scope.ctrl.data))

            $('#container').highcharts('StockChart', {
                exporting: { enabled: false },
                chart: { type: 'columnrange', backgroundColor: null },
                rangeSelector: { selected: 2 },
                yAxis: { labels : { enabled : false }},
                title: { text: '' },
                tooltip: { valuePrefix: '$' },
                series: [{ name: 'Prices', data: seQuotes.convertHighcharts($scope.ctrl.data) }]
            });
            checkLoaded()
        })
    }

    function checkLoaded() {
        console.log("Checking loaded")
        if ('stockUserDetails' in $scope.ctrl.company && 'data' in $scope.ctrl && $scope.ctrl.data.length > 0 && Object.keys($scope.ctrl.company.stockUserDetails).length > 0) {
            $rootScope.loading = false
        }
    }
}])
