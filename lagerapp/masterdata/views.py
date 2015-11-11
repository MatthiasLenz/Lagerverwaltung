#encoding=UTF-8
from masterdata.models import Stock, StockData, Product, Nature
from masterdata.serializers import StockSerializer, StockDataSerializer, ProductSerializer, NatureSerializer, \
    FastProductSerializer
from rest_framework import viewsets, mixins
from rest_framework import pagination
from rest_framework import filters
from rest_framework.response import Response

class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
class CustomSearchFilter(filters.SearchFilter):
    """Possible duplicate items, when filtering by many-to-many fields, but no problems with text fields"""
    def filter_queryset(self, request, queryset, view):
        search_fields = getattr(view, 'search_fields', None)
        search_terms = self.get_search_terms(request)

        if not search_fields or not search_terms:
            return queryset

        orm_lookups = [
            self.construct_search(filters.six.text_type(search_field))
            for search_field in search_fields
        ]

        base = queryset
        for search_term in search_terms:
            queries = [
                filters.models.Q(**{orm_lookup: search_term})
                for orm_lookup in orm_lookups
            ]
            queryset = queryset.filter(reduce(filters.operator.or_, queries))

        return queryset
        
class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
class NatureViewSet(mixins.RetrieveModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*' # hatte hier statt * ein +, wodurch ein aufruf von nature-detail mit leerem resourcenatureid nicht möglich war

    #We only want Nature entries which have related products. Obtain a list of IDs with a raw query and filter against this list.
    nature_ids = Nature.objects.raw('select distinct n.ID as [id] from nature n left join product p on n.id = p.resourcenatureid where p.id is not Null or n.title = 1')
    queryset = Nature.objects.filter(pk__in = [nature.id for nature in nature_ids])
    serializer_class = NatureSerializer
    pagination_class = None
    
class StockDataViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]+' 
    #queryset = StockData.objects.filter(stockid = 0).filter(prodid__name1 = u'Schlaufenanker für Konsolgerüst')
    #queryset = StockData.objects.filter(stockid = 0)
    queryset = StockData.objects.all()
    serializer_class = StockDataSerializer
        
    pagination_class = LargeResultsSetPagination
    
    filter_backends = (CustomSearchFilter, filters.OrderingFilter,)
    search_fields = ('id','prodid','stockid')
        
class ProductViewSet(mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet): 
    """
    This viewset automatically provides `list` and `detail` actions.
    equivalent to ReadOnlyModelViewSet, but inherit from mixins instead.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*' #custom, because we are using dots in our product ids 

    queryset = Product.objects.all().prefetch_related('nature')
    print(queryset.query)
    serializer_class = ProductSerializer

    pagination_class = LargeResultsSetPagination
    
    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_fields = ('resourcenatureid',)
    #Suche in zu resourcenatureid gehörendem Namen, über das Related Field resourcenatureid__name
    search_fields = ('id','name1','resourcenatureid__name')
    #ToDo: ordering_fields = ()


from rest_framework.views import APIView


class CompleteProductView(APIView):
    """
    This view provides the list action
    """

    def get(self, request, *args, **kwargs):
        queryset = Product.objects.all()
        serializer = FastProductSerializer(queryset, many=True)
        return Response(serializer.data)
