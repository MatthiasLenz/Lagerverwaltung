var artikelApp = angular.module('artikelApp', ['ngResource']);          
artikelApp.factory("Nature", function ($resource) {
	return $resource(
	  "/api/nature/:id", {id: "@id" },{"reviews": {'method': 'GET', 'params': {'reviews_only': "true"}, isArray: true}}
    );
}); 
artikelApp.factory("Product", 
	function ($resource) {
		return $resource("/api/product/:id", {},{
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
); 
artikelApp.controller('ArtikelCtrl', function($scope,$resource,Nature,Product) {  
      
  window.scope=$scope;
  $scope.ordering= "id";
  $scope.page = 1;
  $scope.perPage = 20;
  $scope.query = '';
  $scope.resourcenatureid = null;
  $scope.productCount = 0; 
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
    var products = Product.query({
		ordering:$scope.ordering,
		page:$scope.page,
		page_size:$scope.perPage,
		search:query,
		resourcenatureid:  $scope.resourcenatureid
	}, function(data, responseHeaders) {$scope.test1=responseHeaders()});
    $scope.items = products;
    $scope.lastPage = Math.ceil(100/$scope.perPage);

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