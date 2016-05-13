# encoding=UTF-8
from models import Supplier01, PurchaseDoc01, PurchaseDocData01, DeliveryNote01, DeliveryNoteData01, Staff01, Project01
from serializers import SupplierSerializer, PurchaseDocSerializer01, MinPurchaseDocSerializer, \
    PurchaseDocDataSerializer01, DeliveryNoteSerializer, DeliveryNoteDataSerializer,DeliveryNoteDataSerializer, ProjectSerializer, StaffSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import viewsets, pagination, filters
from rest_framework.response import Response
import django_filters

class LargeResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ListFilter(django_filters.Filter):
    def filter(self, qs, value):
        if not value:
            return qs

        self.lookup_type = 'in'
        values = value.split(',')
        return super(ListFilter, self).filter(qs, values)


class StatusFilter(filters.FilterSet):
    status = ListFilter(name='status')
    min_date = django_filters.DateFilter(name="docdate", lookup_type='gte')
    class Meta:
        model = PurchaseDoc01
        fields = ['status', 'supplierid', 'modulerefid', 'min_date']


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

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project01.objects.filter(projectsimulated=0)
    serializer_class = ProjectSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('id','description','managerid','leaderid')

class SupplierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    lookup_value_regex = '[-A-Za-z0-9.]*'
    queryset = Supplier01.objects.all()
    serializer_class = SupplierSerializer

class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Staff01.objects.all()
    serializer_class = StaffSerializer

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


class PurchaseDocViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDoc01.objects.filter(module=5).filter(doctype=2).prefetch_related('data')
    serializer_class = PurchaseDocSerializer01
    pagination_class = None

    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = StatusFilter
    filter_fields = ('status', 'supplierid')


class InternalPurchaseDocViewSet(viewsets.ModelViewSet):
    # Error if result has more than 2000 rows
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDoc01.objects.filter(module=9).filter(doctype=3).prefetch_related('data')
    serializer_class = PurchaseDocSerializer01
    pagination_class = None

    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = StatusFilter

    filter_fields = ('status', 'supplierid', 'modulerefid', )

class PurchaseDocDataViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDocData01.objects.all()
    serializer_class = PurchaseDocDataSerializer01
    pagination_class = LargeResultsSetPagination


class PurchaseDocSupplierViewSet(viewsets.ModelViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = PurchaseDoc01.objects.filter(module=5).filter(doctype=2)
    supplierids = [pd.supplierid for pd in queryset]
    # print(supplierids)
    queryset = Supplier01.objects.filter(pk__in=supplierids)
    serializer_class = SupplierSerializer
    pagination_class = None


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = DeliveryNote01.objects.filter(module=5).prefetch_related('data')
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
    queryset = DeliveryNoteData01.objects.all()
    serializer_class = DeliveryNoteDataSerializer
    pagination_class = LargeResultsSetPagination


from views import PurchaseDocuments, format_py3o_context_value
import json
import os
import subprocess
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from py3o.template import Template


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
        document_folder = settings["document_folder"]
    data = dict(request.data['doc'])
    dt = parse_datetime(data['docdate'])
    data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
    data.update(purchase)
    renderdoc(data, os.path.abspath("masterdata/bestellung.odt"))
    document_folder = document_folder+"bestellungen/" + data['supplier']['id'] + '/'
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
    fileurl = 'http://%s/static/bestellungen/%s/%s' % (settings['server'], data['supplier']['id'], docname)
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=data['id'])
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=data['id'], pdf=fileurl)
    return Response('')

@api_view(['POST'])
def lagerausgangmakepdf(request):
    """ Build a data dictionary and use py3o.template to render an odt file from an odt template.
        Use the libreoffice odt to pdf converter with a subprocess call.
        Upload the generated pdf document to a webserver via FTP.
        Return the url to the generated file."""
    with open('settings.json') as settings_file:
        settings = json.load(settings_file)
        ftpsettings = settings["ftp"]
        lagerausgang = settings["lagerausgang"]
        document_folder = settings["document_folder"]
    data = dict(request.data['doc'])
    data.update(lagerausgang)
    dt = parse_datetime(data['docdate'])
    data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)

    renderdoc1(data, os.path.abspath("masterdata/lagerausgang.odt"))
    document_folder = document_folder +"lagerausgang/" + data['modulerefid'] + '/'
    doctype = request.data['type']
    subprocess.call(os.path.abspath(
        'LibreOfficePortable/App/libreoffice/program/swriter.exe') + ' --headless --convert-to ' + doctype + ' ' +
                    os.path.abspath('masterdata/lagerausgang.odt') + ' --outdir ' + document_folder,
                    shell=True)
    docname = 'Lagerausgang-%s.%s' % (data['id'], doctype)
    try:
        os.remove(document_folder + docname)
    except WindowsError:
        pass
    os.rename(document_folder + 'lagerausgang.' + doctype, document_folder + docname)
    # with open(document_folder+"bestellung.pdf", 'rb') as f:
    #    url = ftpupload(ftpsettings, f, "bestellung.pdf")
    fileurl = 'http://%s/static/lagerausgang/%s/%s' % (settings['server'], data['modulerefid'], docname)
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=data['id'])
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=data['id'], pdf=fileurl)
    return Response(fileurl)

def renderdoc(data_input, outputfile):
    t = Template(os.path.abspath("masterdata/bestellung_template.odt"),
                 outputfile)
    t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo.png"))

    supplier = data_input['supplier']
    try:
        responsible = Staff01.objects.get(id=data_input['responsible'])
    except Staff01.DoesNotExist:
        responsible = {'firstname':'','lastname':'', 'mobile':''}
    items = []
    total = '%.2f' % sum(item['amount'] for item in data_input['data'])
    for item in data_input['data']:
        if item['packing'] != '':
            item['packing'] = 'Verpackt als: %s' % item['packing']
        items.append(
            {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': '%.3f' % item['quantity'],
             'price': '%.2f' % item['price'], 'amount': '%.2f' % item['amount'], 'packing': item['packing'],
             'comment': item['comment']})
    recipient = {'address': format_py3o_context_value(
        '%s\n%s\n\n%s %s' % (supplier['namea'], supplier['address'], supplier['zipcode'], supplier['city']))}
    sender = {'address': data_input['adr_kurz'], 'info': 'info'}
    # company specific
    info = {'kostenstelle': data_input['kostenstelle'],
            'bez_kostenstelle': data_input['bez_kostenstelle'],
            'id': data_input['id'], 'date': data_input['docdate'],
            'bauleiter': '%s %s' % (responsible['firstname'], responsible['lastname']),
            'bauleitertel': responsible['mobile'],
            'polier': '', 'lieferadresse': data_input['adr_lang'],
            'infotext': format_py3o_context_value(unicode(data_input['infotext']))}
    data = dict(items=items, recipient=recipient, sender=sender, info=info, total=total)
    t.render(data)



def renderdoc1(data_input, outputfile):
    t = Template(os.path.abspath("masterdata/lagerausgang_template.odt"),
                 outputfile)
    t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo.png"))

    #responsible = Staff01.objects.get(id=data_input['responsible'])
    items = []
    #total = '%.2f' % sum(item['amount'] for item in data_input['data'])
    for item in data_input['data']:
        items.append(
            {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': '%.3f' % item['quantity'],
             'price': '%.2f' % item['price']})
    # company specific
    info = {'kostenstelle': data_input['modulerefid'], 'stock': data_input["stockid"],
            'bez_kostenstelle': data_input['subject'], 'id':data_input['id'],
            'date': data_input['docdate'], 'recipient':'%s'%(data_input['responsible'])}
    data = dict(items=items, info=info)
    t.render(data)
