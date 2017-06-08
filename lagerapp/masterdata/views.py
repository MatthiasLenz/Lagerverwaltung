# encoding=UTF-8
import traceback
from basemodels import Stock, StockData, Product, Nature, ProductSupplier, ProductPacking, UserData, \
    PurchaseDocuments, StockMovement, Company, Installation, Lagerausgang, InstallationLinks
from models import Project01, Staff01
from serializers import UserSerializer, UserDataSerializer, StockSerializer, StockDataSerializer, getSupplierSerializer, \
    StockMovementSerializer, ProductSerializer, NatureSerializer, FastProductSerializer, ProductSupplierSerializer, \
    ProductPackingSerializer, PurchaseDocumentsSerializer, getStaffSerializer, getDeliveryNoteSerializer, \
    getDeliveryNoteDataSerializer, getPurchaseDocDataSerializer, getPurchaseDocSerializer, getProjectSerializer,CompanySerializer,\
    InstallationSerializer, LagerausgangSerializer, InstallationLinksSerializer
from rest_framework import viewsets, mixins, pagination, filters, generics

from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters import Filter, DateFilter, CharFilter
from django_filters.fields import Lookup
from django.core.exceptions import ObjectDoesNotExist

import json
import pyodbc
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import os
import errno
def prepare_folder(filename):
    if not os.path.exists(os.path.dirname(filename)):
        try:
            os.makedirs(os.path.dirname(filename))
        except OSError as exc:  # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

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
    return type("StatusFilter", (StatusFilter,), dict(Meta=type("Meta", (), {'fields': fields, 'model': model})))


class ResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

def get_pagination(page_size):
    return type("ResultsSetPagination", (ResultsSetPagination,), dict(page_size=page_size))

class StaffViewSet(viewsets.ModelViewSet):
    # queryset and serializer_class defined dynamically
    filter_backends = (filters.SearchFilter,)
    search_fields = ('id', 'firstname', 'lastname')


def getStaffViewSet(model):
    # Class Generator, returns a StaffViewSet class with dynamically defined queryset
    return type(model.__name__ + 'ViewSet', (StaffViewSet,), dict(queryset=model.objects.all(),
                                                                  serializer_class=getStaffSerializer(model)))


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    pagination_class = ResultsSetPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status',)


def getDeliveryNoteViewSet(model, datamodel):
    return type(model.__name__ + 'ViewSet', (DeliveryNoteViewSet,),
                dict(queryset=model.objects.filter(module=5).prefetch_related('data'),
                     serializer_class=getDeliveryNoteSerializer(model, datamodel)))


class DeliveryNoteDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = ResultsSetPagination


def getDeliveryNoteDataViewSet(model):
    return type(model.__name__ + 'ViewSet', (DeliveryNoteDataViewSet,), dict(queryset=model.objects.all(),
                                                                             serializer_class=getDeliveryNoteDataSerializer(
                                                                                 model)))


class StockDataFilter(filters.FilterSet):
    # in_price = django_filters.NumberFilter(name="price", lookup_type='gte')
    # max_price = django_filters.NumberFilter(name="price", lookup_type='lte')
    type = ListFilter(name='prodid__producttype')
    class Meta:
        model = StockData
        fields = ['prodid__nature', 'prodid__defaultsupplier', 'prodid__id', 'stockid', 'type']


class InstallationFilter(filters.FilterSet):
    id_prefix = Filter(name="id", lookup_type='startswith')
    class Meta:
        model = Installation
        fields = ('rentperdayresourceid','title','titlegrade','id_prefix')

class InstallationViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None
    serializer_class = InstallationSerializer
    #queryset = Installation.objects.filter(id__startswith=('15')).order_by('id')
    id_prefix = Filter(name="id", lookup_type='startswith')
    queryset = Installation.objects.order_by('id')
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter)
    filter_class = InstallationFilter
    search_fields = ('id', 'name1', 'name2',)

class InstallationLinksViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    lookup_value_regex = '[-A-Za-z0-9.]*'
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('id', 'filename')
    queryset = InstallationLinks.objects.all()
    serializer_class = InstallationLinksSerializer

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
    pagination_class = ResultsSetPagination


def getPurchaseDocDataViewSet(model):
    return type(model.__name__ + 'ViewSet', (PurchaseDocDataViewSet,), dict(queryset=model.objects.all(),
                                                                            serializer_class=getPurchaseDocDataSerializer(
                                                                                model)))


class InternalPurchaseDocViewSet(viewsets.ModelViewSet):
    # Error if result has more than 2000 rows
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status', 'supplierid', 'modulerefid',)


def getInternalPurchaseDocViewSet(model, datamodel, deliverynote_model, deliverynote_datamodel):
    return type('Internal' + model.__name__ + 'ViewSet', (InternalPurchaseDocViewSet,), dict(
        queryset=model.objects.filter(module=9).filter(doctype=3).prefetch_related('data'),
        serializer_class=getPurchaseDocSerializer(model, datamodel, deliverynote_model, deliverynote_datamodel),
        filter_class=getStatusFilter(model)
    ))


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    filter_backends = (filters.SearchFilter, filters.OrderingFilter, filters.DjangoFilterBackend,)
    pagination_class = get_pagination(30)
    filter_fields = ('id',)
    search_fields = ('id', 'description', 'managerid', 'leaderid')


def getProjectViewSet(model, staffmodel):
    return type(model.__name__ + 'ViewSet', (ProjectViewSet,), dict(
        queryset=model.objects.filter(projectsimulated=0, status__in=[0,1,2]).order_by('-start_project'),
        serializer_class=getProjectSerializer(model, staffmodel)
    ))


class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'


def getSupplierViewSet(model):
    return type(model.__name__ + 'ViewSet', (SupplierViewSet,), dict(
        queryset=model.objects.all(),
        serializer_class=getSupplierSerializer(model)
    ))


class PurchaseDocSupplierViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = None


def getPurchaseDocSupplierViewSet(purchasedoc, supplier):
    queryset = purchasedoc.objects.filter(module=5).filter(doctype=2)
    supplierids = []
    for pd in queryset:
        try:
            supplierids.append(pd.supplierid)
        except ObjectDoesNotExist:
            pass
    queryset = supplier.objects.filter(pk__in=supplierids)  # this fails, if supplierid is not found, ToDo: failsafe
    return type(supplier.__name__ + 'PurchaseDocSupplierViewSet', (PurchaseDocSupplierViewSet,), dict(
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
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('key1','modulerecordtypeid','prodid','stockid','userid')
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
    lookup_value_regex = '[-A-Za-z0-9.]*'
    queryset = ProductSupplier.objects.all()
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('prodid','supplierid')
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

    lookup_value_regex = '[-A-Za-z0-9.]*'  # hatte hier statt * ein +, wodurch ein aufruf von nature-detail mit leerem resourcenatureid nicht möglich war

    # We only want Nature entries which have related products. Obtain a list of IDs with a raw query and filter against this list.
    nature_ids = Nature.objects.raw(
        'select distinct n.ID as [id] from nature n left join product p on n.id = p.resourcenatureid where p.id is not Null or n.title = 1')
    queryset = Nature.objects.filter(pk__in=[nature.id for nature in nature_ids])
    serializer_class = NatureSerializer
    pagination_class = None


class StockDataFilter(filters.FilterSet):
    # in_price = django_filters.NumberFilter(name="price", lookup_type='gte')
    # max_price = django_filters.NumberFilter(name="price", lookup_type='lte')
    type = ListFilter(name='prodid__producttype')
    class Meta:
        model = StockData
        fields = ['prodid__nature', 'prodid__defaultsupplier', 'prodid__id', 'stockid', 'type']


class StockDataViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    lookup_value_regex = '[-A-Za-z0-9.]+'
    # queryset = StockData.objects.filter(stockid = 0).filter(prodid__name1 = u'Schlaufenanker für Konsolgerüst')
    # queryset = StockData.objects.filter(stockid = 0)
    queryset = StockData.objects.all()
    serializer_class = StockDataSerializer

    pagination_class = ResultsSetPagination
    # Todo: sort by nested fields
    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_class = StockDataFilter
    search_fields = ('^prodid__id', 'prodid__name1', 'prodid__defaultsupplier__id', 'prodid__nature__name')


class ProductViewSet(mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    equivalent to ReadOnlyModelViewSet, but inherit from mixins instead.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'  # custom, because we are using dots in our product ids

    queryset = Product.objects.prefetch_related('nature').prefetch_related('defaultsupplier')
    serializer_class = ProductSerializer

    pagination_class = ResultsSetPagination

    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_fields = ('resourcenatureid', 'resourcenatureid__name')
    # Suche in zu resourcenatureid gehörendem Namen, über das Related Field resourcenatureid__name
    search_fields = ('id', 'name1', 'resourcenatureid__name')


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
    pagination_class = None

class LagerausgangFilter(filters.FilterSet):
    min_date = DateFilter(name="docdate", lookup_type='gte')
    max_date = DateFilter(name="docdate", lookup_type='lte')
    class Meta:
        fields = ['stockid', 'projectid1', 'projectid2', 'purchasedocid1', 'purchasedocid2', 'responsible', 'abholer', 'min_date', 'max_date']
        model = Lagerausgang

class LagerausgangView(viewsets.ModelViewSet):
    filter_backends = (filters.DjangoFilterBackend,filters.OrderingFilter,)
    filter_class = LagerausgangFilter
    queryset = Lagerausgang.objects.all()
    serializer_class = LagerausgangSerializer
    pagination_class = None



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


def to_named_rows(rows, description):
    return [{c[0]: row[index] for index, c in enumerate(description)} for row in rows]

import base64
@api_view(['POST',])
def sendpdf(request):
    if request.method == 'POST':
        with open('settings.json') as settings_file:
            settings = json.load(settings_file)
            data = request.data
            machine = data["id"]
            document_folder = settings["maschinen"]["folder"] + machine + "/"
            filename = data["filename"]
            pdf = data["data"]
            pdf = pdf[pdf.index("base64,")+7:]
            fullfilename = document_folder+filename
            prepare_folder(fullfilename)
            with open(fullfilename, "wb") as out:
                out.write(base64.decodestring(pdf))
                fileurl = 'http://%s/static/Maschinen/%s/%s' % (settings['server'], machine, filename)
                return Response(fileurl)

@api_view(['GET',])
def get_stock_natures(request, company):
    dbserver = settings.DBSERVER
    dbpassword = settings.DBPASSWORD
    if request.method == 'GET':
        cn = pyodbc.connect(
            r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_masterdata;UID=hitoffice;PWD=%s' % (
            dbserver, company, dbpassword))
        cursor = cn.cursor()
        cursor.execute("(select n.ID, n.Name, n.title from nature n where Title=1\
                        union\
                        select Distinct n.ID, n.Name, n.title from nature n inner join hit_01_masterdata..product p on p.resourcenatureid = n.id\
                       inner join stockdata s on s.prodid = p.id) order by ID")
        results = cursor.fetchall()
        # convert strings to UTF-8
        results = [[elem.decode('latin-1').encode('UTF-8') if type(elem) == str else elem for elem in row] for row in results]
        columns = cursor.description
        results = to_named_rows(results, columns)
        cursor.close()
        return Response({'data': results})

class Delivery:
    In, Out = 1,2

@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def get_project_data(request, id, company, format=None):
    dbserver = settings.DBSERVER
    dbpassword = settings.DBPASSWORD
    def max_consumedproductid(connection):
        # helper function
        cursor = connection.cursor()
        cursor.execute("SELECT MAX(ID) FROM ConsumedProduct")
        result = cursor.fetchall()[0][0]
        if result:
            id = str(int(result) + 1)
            return '0' * (5 - len(id)) + id
        else:
            return "00001"


    def max_consumedproductdatarowid(connection):
        # helper function
        cursor = connection.cursor()
        cursor.execute("SELECT MAX(ROWID) FROM ConsumedProductData")
        result = cursor.fetchall()[0][0]
        if result:
            return result + 1
        else:
            return 1


    if request.method == 'GET':
        data = request.data
        # project_id = request.GET.get('projectid') # api/getpr?projectid=...
        cn = pyodbc.connect(
            r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_pro_%s;UID=hitoffice;PWD=%s' % (
            dbserver, company, id.replace('-', '_'), dbpassword))
        cursor = cn.cursor()

        cursor.execute("Select * from ConsumedProductData")
        results = cursor.fetchall()
        # convert strings to UTF-8
        results = [[elem.decode('latin-1').encode('UTF-8') if type(elem) == str else elem for elem in row] for row in
                   results]
        columns = cursor.description
        results = to_named_rows(results, columns)
        cursor.close()
        return Response({'data': results})

    elif request.method == 'POST':
        print(id)
        try:
            print("try create consumedproduct")
            data = request.data
            docdate = data['docdate']
            articles = data['data']
            purchaseref = data['id'] if 'id' in data else data['orderid']
            supplierid = data['supplierid']
            print("try connect")
            cn = pyodbc.connect(
                r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_pro_%s;UID=hitoffice;PWD=%s' % (
                dbserver, company, id.replace('-', '_').lower(), dbpassword))
            print("success")
            print("try maxid")
            consumedproductid = max_consumedproductid(cn)
            print("success")
            print("try maxrowid")
            datarowid = max_consumedproductdatarowid(cn)
            print("success")
            print(consumedproductid, datarowid)
            cursor = cn.cursor()

            cn_purchase = pyodbc.connect(
                r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_purchase;UID=hitoffice;PWD=%s' % (
                    dbserver, company, dbpassword))
            cursor_purchase = cn_purchase.cursor()

            cursor.execute("INSERT INTO ConsumedProduct (ID, DocumentDate, Comment) VALUES (?, ?, ?)",
                           consumedproductid, docdate[0:10], '')
            cn.commit()

            delivery = Delivery.In if 'deliverytype' in data and data['deliverytype'] == 'eingang' else Delivery.Out

            multiplier = -1 if (delivery==Delivery.Out) and id in ('1-7800', '4-7800', '5-7800') else 1
            #workaround for lagereingang / deliverynote
            for article in articles:
                if delivery==Delivery.In:
                    multiplier = 1
                    command = "Update DeliveryNoteData set DataID={0} where RowID={1}".format(datarowid,article["rowid"])
                else:
                    command = "Update PurchaseDocData set DataID={0} where RowID={1}".format(datarowid,article["rowid"])
                print(command)
                cursor_purchase.execute(command)
                cursor.execute("INSERT INTO ConsumedProductData (ID, RowID, ProdID, Name, Unit, Quantity, Price, Amount, Comment,\
                               SupplierID, PurchaseRef) Values \
                               (?,?,?,?,?,?,?,?,?,?,?)", consumedproductid, datarowid,
                               article['prodid'], article['name'],
                               article['unit'], multiplier * article['quantity'], article['price'],
                               multiplier * round(article['price'] * article['quantity'], 2),
                               article['comment'] if 'comment' in article else '', supplierid, purchaseref)
                datarowid += 1
            cn.commit()
            cn_purchase.commit()
            cn.close()
        except Exception, e:
            print(e.message)
            print(traceback.format_exc())
            return Response({'data': 'Error'}, status='500 Internal Server Error')
        return Response('OK')

    elif request.method == 'DELETE':
        try:
            data = request.data
            purchaseref = data['id']
            articles = data['data']
            #dataids = []
            #for article in articles:
            #    if "dataid" in article:
            #        dataids.append(article["dataid"])
            cn = pyodbc.connect(
                r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_pro_%s;UID=hitoffice;PWD=%s' % (
                dbserver, company, id.replace('-', '_'), dbpassword))
            cursor = cn.cursor()
            cursor.execute("DELETE FROM ConsumedProductData WHERE PurchaseRef=?", purchaseref)
            #for dataid in dataids:
            #    print("DELETE FROM ConsumedProductData WHERE RowID="+str(dataid))
            #    cursor.execute("DELETE FROM ConsumedProductData WHERE RowID=?",dataid)  # consumedproductdata rowid entspricht purchasedocdata dataid
            cn.commit()
            cn.close()
        except Exception, e:
            print(e.message)
            print(traceback.format_exc())
            return Response({'data': 'Error'}, status='500 INTERNAL_SERVER_ERROR')
        return Response('OK')




@api_view(['POST', 'DELETE'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def rental(request, id, company, format=None):
    #enter rental without model (reason: legacy model is inconvenient)
    #projectid, installationid, date,
    dbserver = settings.DBSERVER
    dbpassword = settings.DBPASSWORD

    if request.method == 'POST':
        print("try create rentalsdata")
        cn = pyodbc.connect(
            r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_service;UID=hitoffice;PWD=%s' % (
                dbserver, company, dbpassword))
        data = request.data
        print(type(data['installationname']))
        print(data['installationname'])
        installationname = data['installationname']
        cursor = cn.cursor()
        query = u"Insert into rentalsdata (RowID, ID, RowType, Date, InstallationID, Quantity, Name, Discount, Comment, Unit, ProdID)\
            Values ((select max(rowid)+1 from rentalsdata), (select TOP 1 ID from Rentals where projectid='{0}'), 0, '{1}',\
             '{2}', 1, '{3}', 1, '', '', '')".format(id, data['date'], data['installationid'], installationname)
        cursor.execute(query)
        cursor.commit()
        cursor.close()
        return Response('OK')
    if request.method == 'DELETE':
        print("try delete rentalsdata")
        data = request.data
        print(data)
        #cn = pyodbc.connect(
        #    r'DRIVER={ODBC Driver 11 for SQL Server};SERVER=%s\\HITOFFICE,1433;DATABASE=hit_%s_service;UID=hitoffice;PWD=%s' % (
        #        dbserver, company, dbpassword))

@api_view(['GET', ])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def whoami(request):
    userid = request.user.id
    userdata = UserDataSerializer(UserData.objects.get(user_id=userid)).data
    userdata.pop('user')  # not needed
    return Response(userdata, content_type='json')


@api_view(['GET', ])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def companylogo(request):
    userid = request.user.id
    userdata = UserDataSerializer(UserData.objects.get(user_id=userid)).data
    logourl = userdata['companyid'] + ".png"
    return Response({'logourl': logourl}, content_type='json')


@api_view(['GET', ])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def getconfig(request):
    userid = request.user.id
    groups = request.user.groups.values_list('name',flat=True)
    userdata = UserDataSerializer(UserData.objects.get(user_id=userid)).data
    userdata['groups'] = str(groups)
    companyid = userdata['companyid']
    logourl = companyid + ".png"
    company = CompanySerializer(Company.objects.get(id=companyid)).data
    return Response({'userdata':userdata,'logourl': logourl, 'company': company, 'stockbyid': settings.STOCKBYID}, content_type='json')

@api_view(['POST', ])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticatedOrReadOnly,))
def sendmail(request):
    userid = request.user.id
    userdata = UserDataSerializer(UserData.objects.get(user_id=userid)).data
    companyname = CompanySerializer(Company.objects.get(id=userdata['companyid'])).data['namea']
    sender = userdata['email']
    sendername = "{} {}".format(userdata['first_name'],userdata['last_name'])
    purchasedocid = request.data['purchasedoc']['id']
    recipient = request.data['purchasedoc']['supplier']['mainmail']
    suppliername = request.data['purchasedoc']['supplier']['namea']
    purchasedoc = PurchaseDocumentsSerializer(PurchaseDocuments.objects.get(purchasedocid=purchasedocid)).data
    url = purchasedoc['pdf']
    filepath = settings.DOCFOLDER + 'bestellungen/' + url.rsplit('/',2)[-2] +'/'+ url.rsplit('/',1)[-1]
    return send(sender, recipient, filepath, 'Bestellung %s'%suppliername, 'Bestellung %s'%companyname, sendername)


from smtplib import SMTP,SMTPSenderRefused
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email import Encoders
from datetime import date
import sys
def send(sender, recipient, filepath, sendersubject, recipientsubject, sendername):
    msg = MIMEMultipart()

    msg['From'] = sender
    # Create the body of the message (a plain-text and an HTML version).
    text = "Sehr geehrte Damen und Herren,\n\nbitte entnehmen Sie dem Anhang unsere aktuelle Bestellung.\n\nMit freundlichen Grüßen\n{}".format(sendername)
    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(text, _charset="ANSI")
    # Attach parts into message container.
    # According to RFC 2046, the last part of a multipart message, in this case
    # the HTML message, is best and preferred.
    msg.attach(part1)
    path = filepath
    attachFile = MIMEBase('application', 'pdf')
    attachFile.set_payload(file(path, "rb").read())
    Encoders.encode_base64(attachFile)
    attachFile.add_header('Content-Disposition', 'attachment',
                          filename="Bestellung.pdf")
    msg.attach(attachFile)

    smtp = SMTP("smtp.site.lu", 26)
    smtp.set_debuglevel(0)
    try:
            #Send copy to sender
            msg['Subject'] = "%s %02d.%02d.%04d" % (sendersubject, date.today().day, date.today().month, date.today().year)
            msg['To'] = sender
            #smtp.sendmail( "notexisting@solid.lu", "notexisting@solid.lu", msg.as_string())
            #Send message to recipient
            msg['Subject'] = "%s %02d.%02d.%04d" % (recipientsubject, date.today().day, date.today().month, date.today().year)
            msg['To'] = recipient
            print(smtp.sendmail( sender, "a@b.de", msg.as_string()))#

    except:
        print(sys.exc_info()[0])
        return Response({'data': 'Error'}, status='HTTP_500_INTERNAL_SERVER_ERROR')
    else:
        return Response(filepath)
    finally:
        smtp.quit()