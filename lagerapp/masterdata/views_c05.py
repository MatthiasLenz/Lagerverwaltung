# encoding=UTF-8
from models import Supplier05, PurchaseDoc05, Staff05, Project05
from serializers import SupplierSerializer,  MinPurchaseDocSerializer, ProjectSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import viewsets, pagination, filters
from rest_framework.response import Response

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
    t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo_solidbau.png"))

    supplier = data_input['supplier']
    responsible = Staff05.objects.get(id=data_input['responsible'])
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
            'bauleiter': '%s %s' % (responsible.firstname, responsible.lastname),
            'bauleitertel': responsible.mobile,
            'polier': '', 'lieferadresse': data_input['adr_lang'],
            'infotext': format_py3o_context_value(unicode(data_input['infotext']))}
    data = dict(items=items, recipient=recipient, sender=sender, info=info, total=total)
    t.render(data)