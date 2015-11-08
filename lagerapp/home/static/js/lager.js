var app = angular.module('app', ['restangular','ngResource']);
var stocknames=new Array();                                
app.controller('ListCtrl', ['$http', '$scope', '$resource',function($http, $scope, $resource) {
  $scope.ordering = "id";
  $scope.page = 1;
  $scope.perPage = 10;
  $scope.query = '';
  var stockdata = $resource(
    '/api/stockdata/',
    /*{per_page:10,q:"repo:angular/angular.js"},*/
	{per_page:10,q:""},
    {query: {method:'GET', isArray:false}});
  $scope.updateList = function(){
    /*var query = $scope.query+" in:title repo:angular/angular.js";*/
	var query = $scope.query;
    stockdata.query({
      ordering:$scope.ordering,
      page:$scope.page,
      page_size:$scope.perPage,
      search:query
    }, function(data){
      $scope.items = data.results;
      $scope.lastPage = Math.ceil(data.count/$scope.perPage);
	  //nicht for...in benutzen um über array  zu iterieren !!!
	  /*$scope.items.forEach(function (item, index, array) {
		if  (!(item.stockid in stocknames)){
			console.log(stocknames);
			$http.get(item.stockid).success(function(data){
				stocknames[item.stockid]=data.name;	
			});
		}
	  });*/
	});
  };
  $scope.$watchCollection('[page,ordering,perPage]',function(){
    $scope.updateList();
  });
  $scope.nextPage = function(){
    if ($scope.lastPage !== $scope.page){
      $scope.page++;
    }
  };
  $scope.previousPage = function(){
    if ($scope.page !== 1){
      $scope.page--;
    }
  };
  $scope.setOrder = function(field){
    if ($scope.ordering == field){
      $scope.ordering= '-'+$scope.ordering;
	 $scope.sortorder = 'desc';
    }
    else {
	 $scope.ordering=field;  
	 $scope.sortorder = 'asc';
    }
  };
  $scope.sortDirection = function(field){
    if ($scope.ordering.charAt(0)=='-'){
      return 'sort-caret asc';
    } else return 'sort-caret desc';
  };

 }]);