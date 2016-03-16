#encoding=UTF-8
from masterdata.basemodels import Stock, StockData, Product, Nature, ProductSupplier, ProductPacking, UserData, \
    PurchaseDocuments, StockMovement
from masterdata.serializers import UserSerializer, UserDataSerializer, StockSerializer, StockDataSerializer, \
    StockMovementSerializer, ProductSerializer, \
    NatureSerializer, FastProductSerializer, ProductSupplierSerializer, ProductPackingSerializer, \
    PurchaseDocumentsSerializer
from rest_framework import viewsets, mixins, pagination, filters, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

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


from django_filters import Filter

class ListFilter(Filter):
    def filter(self, qs, value):
        if not value:
            return qs

        self.lookup_type = 'in'
        values = value.split(',')
        return super(ListFilter, self).filter(qs, values)


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

from django.conf import settings

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Stock.objects.filter(id__in=['0', '40', '50'])
    serializer_class = StockSerializer


class StockMovementViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

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


class StockDataFilter(filters.FilterSet):
    # in_price = django_filters.NumberFilter(name="price", lookup_type='gte')
    # max_price = django_filters.NumberFilter(name="price", lookup_type='lte')
    class Meta:
        model = StockData
        fields = ['prodid__nature', 'stockid']

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

    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_class = StockDataFilter
    search_fields = ('prodid__id', 'prodid__name1')
        
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
    filter_fields = ('resourcenatureid', 'resourcenatureid__name')
    #Suche in zu resourcenatureid gehörendem Namen, über das Related Field resourcenatureid__name
    search_fields = ('id','name1','resourcenatureid__name')


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


class PurchaseDocumentsView(viewsets.ModelViewSet):
    queryset = PurchaseDocuments.objects.all()
    serializer_class = PurchaseDocumentsSerializer

from genshi.core import Markup
def format_py3o_context_value(value):
    return Markup(unicode(value).replace('\n', '<text:line-break/>').replace('&', '&amp;'))


import ftplib
import random

def ftpupload(ftpsettings, file, filename):
    ftp = ftplib.FTP(ftpsettings["server"], ftpsettings["user"], ftpsettings["password"])
    dirname = str(random.randint(10000000000, 99999999999))
    ftp.cwd(ftpsettings["folder"])
    ftp.mkd(dirname)
    ftp.cwd('%s/%s' % (ftpsettings["folder"], dirname))
    ftp.storbinary('STOR %s' % filename, file)
    return '%s/%s/%s' % (ftpsettings['uploads'], dirname, filename)
