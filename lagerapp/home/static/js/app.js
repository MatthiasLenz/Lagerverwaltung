(function() {
  var app = angular.module('Lager', ['restangular']);
  
  /*app.controller('LagerController', ['$scope', 'Restangular', function($scope,  Restangular){
    Restangular.setBaseUrl('/api/');
	var Lager = this;
    Lager.products = [];
	var Product = Restangular.all('product');
	var allProducts = Product.getList();
	Lager.products = allProducts;
  }]);*/
  
  app.controller('LagerController', ['$http', function($http){
	var Lager = this;
    Lager.products = [];
    $http.get('/api/product/').success(function(data){
		Lager.products=data.results;
		
    });
	
  }]);
})();