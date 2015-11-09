var artikelApp = angular.module('artikelApp', ['ui.router','ngResource']);     

artikelApp.config(["$locationProvider", function($locationProvider) {
  //disable this, if the app is being used by html5 incompatible browsers.
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}]);

artikelApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/artikel");
  //
  // Now set up the states
  $stateProvider
    .state('artikel', {
      url: '/artikel',
      templateUrl: 'static/html/articlelist.html'
    })
    .state('bestellmodul', {
      url: '/bestellmodul',
      templateUrl: 'static/html/bestellmodul.html',
    })
    .state('lagereingang', {
      url: '/lagereingang',
      templateUrl: 'static/html/lagereingang.html',
    })
    .state('lagerausgang', {
      url: '/lagerausgang',
      templateUrl: 'static/html/lagerausgang.html',
    })    
	.state('lagerverwaltung', {
      url: '/lagerverwaltung',
      templateUrl: 'static/html/lagerverwaltung.html',
    })
	.state('verrechnungen', {
      url: '/verrechnungen',
      templateUrl: 'static/html/verrechnungen.html',
    });
});

artikelApp.factory("Nature", function ($resource) {
	return $resource(
	  "/api/nature/:id", {id: "@id" },{"reviews": {'method': 'GET', 'params': {'reviews_only': "true"}, isArray: true}}
    );
}); 
/*    How to transform a query to a paginated resource, so that it returns the results directly
artikelApp.factory("Product", 
	function ($resource) {
		return $resource("/api/product/:id", {},{
		   //override .query 
		   query: {
                method: 'GET',
                url: 'api/product/',
                isArray: true,
                transformResponse: function(data, headers) {
                    return angular.fromJson(data).results;
                },
            }, 
		});
	}
); */

artikelApp.controller('ArtikelCtrl', function($scope,$resource,Nature) {  
  $scope.title = 'Artikel Stammdaten';
  $scope.tabs = [	{title: 'Artikel Stammdaten', url: 'artikel'}, 
				{title: 'Bestellmodul', url: 'bestellmodul'}, 
				{title: 'Lagereingang', url: 'lagereingang'}, 
				{title: 'Lagerausgang', url: 'lagerausgang'}, 
				{title: 'Lagerverwaltung', url: 'lagerverwaltung'},
				{title: 'Verrechnungen', url: 'verrechnungen'}];    
  $scope.currentTab = 'artikel';
  $scope.onClickTab = function (tab) { 
		$scope.currentTab = tab.url; 
		$scope.title = tab.title; 
	}
  $scope.isActiveTab = function(tabUrl) { return tabUrl == $scope.currentTab; }
  window.scope=$scope;
  $scope.ordering= "id";
  $scope.page = 1;
  $scope.perPage = 20;
  $scope.query = '';
  $scope.resourcenatureid = null;
  var product = $resource(
    '/api/product/:id',
	{per_page:20,q:""},
    {query: {method:'GET', isArray:false}}
  );
  var nature = Nature.query({}, function() {
	  $scope.resourcenatureids = [{"id":"", "name":"- Bitte auswählen -", "title":""}];
	  var titleDescr = "";
	  nature.forEach(function (item, index, array) {
		if (item.title){
			titleDescr=item.name;
		}
		else{
			$scope.resourcenatureids.push({"id":item.id, "name":item.name, "title":titleDescr});
		}
	  });
  });
  $scope.test1 = Nature.get({'id': '90230000'});
   
  $scope.updateList = function(resetPage){
    /*var query = $scope.query+" in:title repo:angular/angular.js";*/
    var query = $scope.query;
    $scope.page = resetPage ? 1 : $scope.page;
    product.query({
		ordering:$scope.ordering,
		page:$scope.page,
		page_size:$scope.perPage,
		search:query,
		resourcenatureid:  $scope.resourcenatureid
    }, function(data){
      $scope.items = data.results;
      $scope.lastPage = Math.ceil(data.count/$scope.perPage);
    });
  };
  $scope.$watchCollection('[page,ordering,perPage]',function(){
    $scope.updateList(false );
  });
  $scope.$watchCollection('[query,resourcenatureid]',function(){
    //search and filter operations change the resulting size
    $scope.updateList(true);
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
  $scope.setPage = function(num){
      if (num <=$scope.lastPage && num>0){
		$scope.page=num;
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
  $scope.getOrder = function(){
	if ($scope.ordering.charAt(0)=='-'){
		return $scope.ordering.substr(1, $scope.ordering.length);
	}
	else return $scope.ordering;
  };
  $scope.sortDirection = function(field){
    if ($scope.ordering.charAt(0)=='-'){
      return 'sort-caret desc';
    } else return 'sort-caret asc';
  };  
  

 });