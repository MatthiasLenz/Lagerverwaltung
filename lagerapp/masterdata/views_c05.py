# encoding=UTF-8
from masterdata.models import UserData, Supplier, Stock, StockData, Product, Nature, ProductSupplier, PurchaseDoc05, \
    PurchaseDoc, \
    ProductPacking, PurchaseDocData, DeliveryNote, DeliveryNoteData, Staff, PurchaseDocuments
from masterdata.serializers import UserSerializer, UserDataSerializer, SupplierSerializer, StockSerializer, \
    StockDataSerializer, ProductSerializer, \
    NatureSerializer, FastProductSerializer, ProductSupplierSerializer, PurchaseDocSerializer05, \
    MinPurchaseDocSerializer, \
    PurchaseDocDataSerializer, ProductPackingSerializer, DeliveryNoteSerializer, DeliveryNoteDataSerializer, \
    PurchaseDocumentsSerializer
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import viewsets, mixins, pagination, filters, generics, views
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django_filters import Filter


class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000


class ListFilter(Filter):
    def filter(self, qs, value):
        if not value:
            return qs

        self.lookup_type = 'in'
        values = value.split(',')
        return super(ListFilter, self).filter(qs, values)


class StatusFilter(filters.FilterSet):
    status = ListFilter(name='status')

    class Meta:
        model = PurchaseDoc05
        fields = ['status', 'supplierid']


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


from django.conf import settings


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Stock.objects.filter(id__in=[settings.DEFAULTSTOCK])
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
    queryset = PurchaseDoc05.objects.filter(module=5).filter(doctype=2).prefetch_related('pdata05')
    serializer_class = PurchaseDocSerializer05
    pagination_class = LargeResultsSetPagination  # temporary pagination, remove after testing

    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = StatusFilter
    filter_fields = ('status', 'supplierid')


class PurchaseDocDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDocData.objects.all()
    serializer_class = PurchaseDocDataSerializer
    pagination_class = LargeResultsSetPagination


class PurchaseDocSupplierViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDoc.objects.filter(module=5).filter(doctype=2)
    supplierids = [pd.supplierid for pd in queryset]
    # print(supplierids)
    queryset = Supplier.objects.filter(pk__in=supplierids)
    serializer_class = SupplierSerializer
    pagination_class = None


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


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = DeliveryNote.objects.filter(module=5).prefetch_related('data')
    serializer_class = DeliveryNoteSerializer
    pagination_class = LargeResultsSetPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('status',)


class DeliveryNoteDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = DeliveryNoteData.objects.all()
    serializer_class = DeliveryNoteDataSerializer
    pagination_class = LargeResultsSetPagination


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
    class Meta:
        model = StockData
        fields = ['prodid__nature', 'stockid']


class StockDataViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]+'
    # queryset = StockData.objects.filter(stockid = 0).filter(prodid__name1 = u'Schlaufenanker für Konsolgerüst')
    # queryset = StockData.objects.filter(stockid = 0)
    queryset = StockData.objects.filter(stockid="50")
    serializer_class = StockDataSerializer

    pagination_class = LargeResultsSetPagination

    filter_backends = (filters.DjangoFilterBackend, CustomSearchFilter, filters.OrderingFilter,)
    filter_class = StockDataFilter
    search_fields = ('id', 'prodid', 'stockid', 'prodid__resourcenatureid')


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

    pagination_class = LargeResultsSetPagination

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


class PurchaseDocumentsView(viewsets.ModelViewSet):
    queryset = PurchaseDocuments.objects.all()
    serializer_class = PurchaseDocumentsSerializer


from genshi.core import Markup


def format_py3o_context_value(value):
    return Markup(unicode(value).replace('\n', '<text:line-break/>').replace('&', '&amp;'))


from rest_framework.decorators import api_view, authentication_classes, permission_classes
from py3o.template import Template
import ftplib, random, json, os, subprocess
from django.utils.dateparse import parse_datetime


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def makepdf(request):
    """ Build a data dictionary and use py3o.template to render an odt file from an odt template.
        Use the libreoffice odt to pdf converter with a subprocess call.
        Upload the generated pdf document to a webserver via FTP.
        Return the url to the generated file."""
    with open('settings.json') as settings_file:
        settings = json.load(settings_file)
        ftpsettings = settings["ftp"]
        purchase = settings["purchase"]
    data = dict(request.data['doc'])
    dt = parse_datetime(data['docdate'])
    data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
    data.update(purchase)
    renderdoc(data, os.path.abspath("masterdata/bestellung.odt"))
    document_folder = data['folder'] + data['supplier']['id'] + '/'
    doctype = request.data['type']
    subprocess.call(os.path.abspath(
        'LibreOfficePortable/App/libreoffice/program/swriter.exe') + ' --headless --convert-to ' + doctype + ' ' +
                    os.path.abspath('masterdata/bestellung.odt') + ' --outdir ' + document_folder,
                    shell=True)
    docname = '%s-Bestellung-%s.%s' % (data['company'], data['docdate'].replace('.', '-'), doctype)
    try:
        os.remove(document_folder + docname)
    except WindowsError:
        pass
    os.rename(document_folder + 'bestellung.' + doctype, document_folder + docname)
    # with open(document_folder+"bestellung.pdf", 'rb') as f:
    #    url = ftpupload(ftpsettings, f, "bestellung.pdf")
    fileurl = 'http://%s/static/%s/%s' % (settings['server'], data['supplier']['id'], docname)
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=data['id'])
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=data['id'], pdf=fileurl)
    return Response('')


def renderdoc(data_input, outputfile):
    t = Template(os.path.abspath("masterdata/bestellung_template.odt"),
                 outputfile)
    t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo.png"))

    supplier = data_input['supplier']
    responsible = Staff.objects.get(id=data_input['responsible'])
    items = []
    total = '%.2f' % sum(item['amount'] for item in data_input['data'])
    for item in data_input['data']:
        if item['packing'] != '':
            item['packing'] = 'Verpackt als: %s' % item['packing']
        items.append(
            {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': '%.3f' % item['quantity'],
             'price': '%.2f' % item['price'], 'amount': '%.2f' % item['amount'], 'packing': item['packing']})
    recipient = {'address': format_py3o_context_value(
        '%s\n%s\n\n%s %s' % (supplier['namea'], supplier['address'], supplier['zipcode'], supplier['city']))}
    sender = {'address': data_input['adr_kurz'], 'info': 'info'}
    # company specific
    info = {'kostenstelle': data_input['kostenstelle'],
            'bez_kostenstelle': data_input['bez_kostenstelle'],
            'id': data_input['id'], 'date': data_input['docdate'],
            'bauleiter': '%s %s' % (responsible.firstname, responsible.lastname),
            'bauleitertel': responsible.mobile,
            'polier': '', 'lieferadresse': data_input['adr_lang'],
            'infotext': format_py3o_context_value(unicode(data_input['infotext']))}
    data = dict(items=items, recipient=recipient, sender=sender, info=info, total=total)
    t.render(data)


def ftpupload(ftpsettings, file, filename):
    ftp = ftplib.FTP(ftpsettings["server"], ftpsettings["user"], ftpsettings["password"])
    dirname = str(random.randint(10000000000, 99999999999))
    ftp.cwd(ftpsettings["folder"])
    ftp.mkd(dirname)
    ftp.cwd('%s/%s' % (ftpsettings["folder"], dirname))
    ftp.storbinary('STOR %s' % filename, file)
    return '%s/%s/%s' % (ftpsettings['uploads'], dirname, filename)
