#encoding=UTF-8
from basemodels import Stock, StockData, Product, Nature, ProductSupplier, ProductPacking, UserData, \
    PurchaseDocuments, StockMovement
from serializers import UserSerializer, UserDataSerializer, StockSerializer, StockDataSerializer, getSupplierSerializer,\
    StockMovementSerializer, ProductSerializer, NatureSerializer, FastProductSerializer, ProductSupplierSerializer, \
    ProductPackingSerializer, PurchaseDocumentsSerializer, getStaffSerializer, getDeliveryNoteSerializer, \
    getDeliveryNoteDataSerializer, getPurchaseDocDataSerializer, getPurchaseDocSerializer, getProjectSerializer
from rest_framework import viewsets, mixins, pagination, filters, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters import Filter, DateFilter
from django_filters.fields import Lookup

class ListFilter1(Filter):
    def filter(self, qs, value):
        if not value:
            return qs
        self.lookup_type = 'in'
        values = value.split(',')
        return super(ListFilter1, self).filter(qs, values)

class ListFilter(Filter):
    def filter(self, qs, value):
        value_list = value.split(u',')
        return super(ListFilter, self).filter(qs, Lookup(value_list, 'in'))

class StatusFilter(filters.FilterSet):
    status = ListFilter(name='status')
    min_date = DateFilter(name="docdate", lookup_type='gte')
    Meta = None

def getStatusFilter(model):
    fields = ['status', 'supplierid', 'modulerefid', 'min_date']
    return type("StatusFilter", (StatusFilter,), dict(Meta=type("Meta",(),{'fields' : fields, 'model': model})))

class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000


class StaffViewSet(viewsets.ModelViewSet):
    #queryset and serializer_class defined dynamically
    pass

def getStaffViewSet(model):
    #Class Generator, returns a StaffViewSet class with dynamically defined queryset
    return type(model.__name__+'ViewSet', (StaffViewSet,), dict(queryset = model.objects.all(),
                                                                serializer_class = getStaffSerializer(model)))

class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    pagination_class = LargeResultsSetPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status',)

def getDeliveryNoteViewSet(model, datamodel):
    return type(model.__name__ + 'ViewSet', (DeliveryNoteViewSet,), dict(queryset=model.objects.filter(module=5).prefetch_related('data'),
                                                                  serializer_class=getDeliveryNoteSerializer(model, datamodel)))

class DeliveryNoteDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = LargeResultsSetPagination

def getDeliveryNoteDataViewSet(model):
    return type(model.__name__ + 'ViewSet', (DeliveryNoteDataViewSet,), dict(queryset=model.objects.all(),
        serializer_class=getDeliveryNoteDataSerializer(model)))


class PurchaseDocViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status', 'supplierid')

def getPurchaseDocViewSet(model, datamodel, deliverynote_model, deliverynote_datamodel):
    return type(model.__name__ + 'ViewSet', (PurchaseDocViewSet,), dict(
            queryset=model.objects.filter(module=5).filter(doctype=2).prefetch_related('data'),
            serializer_class=getPurchaseDocSerializer(model, datamodel, deliverynote_model, deliverynote_datamodel),
            filter_class=getStatusFilter(model)))

class PurchaseDocDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = LargeResultsSetPagination

def getPurchaseDocDataViewSet(model):
    return type(model.__name__ + 'ViewSet', (PurchaseDocDataViewSet,), dict(queryset=model.objects.all(),
        serializer_class=getPurchaseDocDataSerializer(model)))

class InternalPurchaseDocViewSet(viewsets.ModelViewSet):
    # Error if result has more than 2000 rows
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status', 'supplierid', 'modulerefid', )

def getInternalPurchaseDocViewSet(model, datamodel, deliverynote_model, deliverynote_datamodel):
    return type('Internal'+model.__name__+'ViewSet', (InternalPurchaseDocViewSet,), dict(
            queryset=model.objects.filter(module=9).filter(doctype=3).prefetch_related('data'),
            serializer_class=getPurchaseDocSerializer(model, datamodel, deliverynote_model, deliverynote_datamodel),
            filter_class=getStatusFilter(model)
    ))

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    filter_backends = (filters.SearchFilter,)
    search_fields = ('id','description','managerid','leaderid')

def getProjectViewSet(model, staffmodel):
    return type(model.__name__+'ViewSet', (ProjectViewSet,), dict(
        queryset=model.objects.filter(projectsimulated=0),
        serializer_class=getProjectSerializer(model, staffmodel)
    ))

class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'

def getSupplierViewSet(model):
    return type(model.__name__+'ViewSet', (SupplierViewSet,), dict(
        queryset=model.objects.all(),
        serializer_class=getSupplierSerializer(model)
    ))

class PurchaseDocSupplierViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None

def getPurchaseDocSupplierViewSet(purchasedoc, supplier):
    queryset = purchasedoc.objects.filter(module=5).filter(doctype=2)
    supplierids = [pd.supplierid for pd in queryset]
    queryset = supplier.objects.filter(pk__in=supplierids) #this fails, if supplierid is not found, ToDo: failsafe
    return type(supplier.__name__+'PurchaseDocSupplierViewSet', (PurchaseDocSupplierViewSet,), dict(
        queryset=queryset,
        serializer_class=getSupplierSerializer(supplier)
    ))

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
        fields = ['prodid__nature', 'prodid__defaultsupplier', 'stockid']

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
    # Todo: sort by nested fields
    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_class = StockDataFilter
    search_fields = ('prodid__id', 'prodid__name1', 'prodid__defaultsupplier__id')
        
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

"""
from rest_framework import status

class MinPurchaseDocViewSet(viewsets.GenericViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    queryset = PurchaseDoc01.objects.filter(module=5).filter(doctype=2).prefetch_related('data')
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
"""

class PurchaseDocumentsView(viewsets.ModelViewSet):
    queryset = PurchaseDocuments.objects.all().order_by('-purchasedocid')
    serializer_class = PurchaseDocumentsSerializer
    pagination_class = LargeResultsSetPagination

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

import pyodbc
from rest_framework.decorators import api_view
from django.http import JsonResponse
def to_named_rows(rows, description):
    return [{c[0]: row[index]  for index, c in enumerate(description)} for row in rows]

@api_view(['GET','POST'])
def get_project_data(request):

    def max_consumedproductid(connection):
        cursor = connection.cursor()
        cursor.execute("SELECT MAX(ID) FROM ConsumedProduct")
        id = str(int(cursor.fetchall()[0][0]) + 1)
        return '0' * (5 - len(id)) + id

    def max_consumedproductdatarowid(connection):
        cursor = connection.cursor()
        cursor.execute("SELECT MAX(ROWID) FROM ConsumedProductData")
        return cursor.fetchall()[0][0] + 1

    if request.method == 'GET':
        data = request.data
        project_id = request.GET.get('projectid')
        cn = pyodbc.connect(
            r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=95-NOTEBOOK-EK\\HITOFFICE,1433;DATABASE=hit_01_pro_%s;UID=hitoffice;PWD=Hf#379' % project_id.replace('-','_'))
        cursor=cn.cursor()
        cursor.execute("Select * from ConsumedProductData")
        results = cursor.fetchall()
        #convert strings to UTF-8
        results = [[elem.decode('latin-1').encode('UTF-8') if type(elem)==str else elem for elem in row] for row in results]
        columns = cursor.description
        results = to_named_rows(results, columns)
        return JsonResponse({'data':results})

    elif request.method =='POST':
        data = request.data
        project_id = data['projectid']
        docdate = data['docdate']
        articles = data['articles']
        cn = pyodbc.connect(
            r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=95-NOTEBOOK-EK\\HITOFFICE,1433;DATABASE=hit_01_pro_%s;UID=hitoffice;PWD=Hf#379' % project_id)
        consumedproductid = max_consumedproductid(cn)
        datarowid = max_consumedproductdatarowid(cn)
        print(consumedproductid, datarowid)
        cursor = cn.cursor()
        cursor.execute("INSERT INTO ConsumedProduct (ID, DocumentDate, Comment) VALUES (?, ?, ?)", consumedproductid, docdate, 'test')
        cn.commit()
        for a in articles:
            cursor.execute("INSERT INTO ConsumedProductData (ID, RowID, ProdID, Name, Unit, Quantity, Price, Amount, Comment,\
                           ProductType, Margin, GrossPrice, GrossAmount, SupplierID, PurchaseRef) Values \
                           (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", a['prodid'], a['name1'])
        return Response('')
    elif request.method == 'DELETE':
        pass
