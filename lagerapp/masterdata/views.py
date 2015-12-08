#encoding=UTF-8
from masterdata.models import UserData, Supplier, Stock, StockData, Product, Nature, ProductSupplier, PurchaseDoc, \
    ProductPacking, PurchaseDocData, DeliveryNote, DeliveryNoteData
from masterdata.serializers import UserSerializer, UserDataSerializer, SupplierSerializer, StockSerializer, \
    StockDataSerializer, ProductSerializer, \
    NatureSerializer, FastProductSerializer, ProductSupplierSerializer, PurchaseDocSerializer, MinPurchaseDocSerializer, \
    PurchaseDocDataSerializer, ProductPackingSerializer, DeliveryNoteSerializer, DeliveryNoteDataSerializer
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import viewsets, mixins, pagination, filters, generics, views
from rest_framework.response import Response
from django.contrib.auth.models import User


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDataList(generics.ListAPIView, generics.UpdateAPIView, generics.CreateAPIView):
    queryset = UserData.objects.all()
    serializer_class = UserDataSerializer


class UserDataDetail(generics.RetrieveAPIView, generics.UpdateAPIView, ):
    queryset = UserData.objects.all()
    serializer_class = UserDataSerializer

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


class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class ProductPackingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'
    queryset = ProductPacking.objects.all()
    serializer_class = ProductPackingSerializer


class ProductSupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = ProductSupplier.objects.all()
    serializer_class = ProductSupplierSerializer


from rest_framework import status


class MinPurchaseDocViewSet(viewsets.GenericViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    queryset = PurchaseDoc.objects.filter(module=5).filter(doctype=2).prefetch_related('data')
    serializer_class = MinPurchaseDocSerializer
    pagination_class = LargeResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(repr(serializer.is_valid(raise_exception=True)))
        serializer.is_valid(raise_exception=True)
        print("test1")
        self.perform_create(serializer)
        print("test2")
        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class PurchaseDocViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDoc.objects.filter(module=5).filter(doctype=2).prefetch_related('data')
    serializer_class = PurchaseDocSerializer
    pagination_class = None
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status',)

class PurchaseDocDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDocData.objects.all()
    serializer_class = PurchaseDocDataSerializer
    pagination_class = LargeResultsSetPagination


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = DeliveryNote.objects.filter(module=5).prefetch_related('data')
    serializer_class = DeliveryNoteSerializer
    pagination_class = LargeResultsSetPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status',)


class DeliveryNoteDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = DeliveryNoteData.objects.all()
    serializer_class = DeliveryNoteDataSerializer
    pagination_class = LargeResultsSetPagination

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

    queryset = Product.objects.prefetch_related('nature').prefetch_related('defaultsupplier')
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
        queryset = Product.objects.only('id', 'name1', 'detailedname1', 'title', 'marked', 'unit1',
                                        'grosspurchaseprice', 'netpurchaseprice',
                                        'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
                                        'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid')
        serializer = FastProductSerializer(queryset, many=True)
        return Response(serializer.data)

