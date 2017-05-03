# encoding=UTF-8
import os
import subprocess

from django.utils.dateparse import parse_datetime
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from models import Staff04
from views import PurchaseDocuments, format_py3o_context_value

companies = {'01': 'Solid SA', '04':'Sofico SA', '05': 'Solid Bau GmbH'}

def merge_data(request):
    data = dict(request.data["doc"])
    data['abholer'] = request.data['abholer']
    dt = parse_datetime(data['docdate'])
    data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
    return data

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
    docname = '%s-Bestellung-%s.%s' % (data['company'], data['id'], doctype)
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
def lagerausgangmakepdf(request, companyid):
    """ Build a data dictionary and use py3o.template server to render a document file from an ods template.
        Return the url of the generated file. Optional: Upload the generated pdf document to a webserver via FTP. """
    print("lagerausgangmakepdf")
    with open('settings.json') as settings_file:
        #ftpsettings = settings["ftp"]
        settings = json.load(settings_file)
        document_folder = settings["lagerausgang"]["folder"]

        data = dict(request.data["doc"])
        dt = parse_datetime(data['docdate'])
        data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)

        doctype = request.data['type']
        docname = "lagerausgang_{}.{}".format(data['id'], doctype)
        print(data, document_folder, docname, companyid, doctype)
        renderdoc1(data, document_folder, docname, companyid, doctype)
        fileurl = 'http://%s/static/Lagerausgang/%s' % (settings['server'], docname)
        #create_purchase_document(data['id'], doctype, fileurl)
        return Response(fileurl)

@api_view(['POST'])
def kleingeraetemakepdf(request, companyid):
    """ Build a data dictionary and use py3o.template server to render a document file from an ods template.
        Return the url of the generated file. Optional: Upload the generated pdf document to a webserver via FTP. """
    with open('settings.json') as settings_file:
        #ftpsettings = settings["ftp"]
        settings = json.load(settings_file)
        document_folder = settings["lagerausgang"]["folder"]
        data = merge_data(request)
        document_folder = document_folder + data['modulerefid'] + '/'
        doctype = request.data['type']
        docname = "lagerausgang_{}.{}".format(data['id'], doctype)
        renderdoc2(data, document_folder, docname, companyid, doctype)
        fileurl = 'http://%s/static/Lagerausgang/%s/%s' % (settings['server'], data['modulerefid'], docname)
        create_purchase_document(data['id'], doctype, fileurl)
        return Response(fileurl)

def create_purchase_document(id, doctype, fileurl):
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=id)
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=id, pdf=fileurl)

def renderdoc(data_input, outputfile):
    #t = Template(os.path.abspath("masterdata/bestellung_template.odt"),
     #            outputfile)
    #t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo.png"))

    supplier = data_input['supplier']
    try:
        responsible = Staff04.objects.get(id=data_input['responsible'])
    except Staff04.DoesNotExist:
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
    #t.render(data)

import requests
import json
def renderdoc1(data_input, folder, name, companyid, targetformat):
    print("renderdoc1 04")
    url = 'http://192.168.0.199:8765/form'
    customer = companies[companyid]
    template_path = os.path.abspath("masterdata/lagerausgang_template04.odt")
    with open(template_path, "rb") as template_file:
        files = {'tmpl_file': template_file}

        print("loop data1")
        items = []
        if data_input['purchasedoc1'] != 0:
            for item in data_input['purchasedoc1']['data']:
                packing = item['packing'] if item['packing'] else ''
                comment = item['comment'] if item['comment'] else ''
                items.append(
                    {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': ('%.3f' % item['quantity']).replace('.',','),
                     'price': '%.2f' % item['price'], 'packing': packing, 'comment': comment})

        items2 = []
        print("loop data2")
        if data_input['purchasedoc2']!=0:
            for item in data_input['purchasedoc2']['data']:
                packing = item['packing'] if item['packing'] else ''
                comment = item['comment'] if item['comment'] else ''
                items2.append(
                    {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': '%.3f' % item['quantity'],
                     'price': '%.2f' % item['price'], 'packing': packing, 'comment': comment})
            print("finish loop")
        # company specific
        print("create info dictionary")
        subject1 = data_input['purchasedoc1']['subject'] if data_input['purchasedocid1'] else ''
        modulerefid1 = data_input['purchasedoc1']['modulerefid'] if data_input['purchasedocid1'] else ''
        subject2 = data_input['purchasedoc2']['subject'] if data_input['purchasedocid2'] else ''
        modulerefid2 = data_input['purchasedoc2']['modulerefid'] if data_input['purchasedocid2'] else ''
        info = {'kostenstelle': modulerefid1, 'stock': data_input["stockid"],
                'bez_kostenstelle': subject1[:40]+(subject1[40:] and '...'), 'id':data_input['id'],
                'date':    data_input['docdate'], 'bauleiter':'%s'%(data_input['responsible']),
                'polier': '', 'customer': customer,
                'abholer': data_input['abholer'],
                'kolonne': modulerefid2 +' '+subject2[:40]+(subject2[40:] and '...'),
                'user':    data_input['responsible'],
                'items1':  "{0}, Einkaufsdokument Nr. {1}".format(data_input['projectid1'], data_input['purchasedocid1'])if data_input['purchasedocid1'] else '',
                'items2':  "{0}, Einkaufsdokument Nr. {1}".format(data_input['projectid2'], data_input['purchasedocid2'])if data_input['purchasedocid2'] else ''
                }
        print("finish info dictionary")
        data = dict(items=items, items2=items2, info=info, display1 = '1' if items else '0',
                display2 = '1' if items2 else '0')
        print("build fields")
        fields = {
            "targetformat": targetformat,
            "datadict": json.dumps(data, encoding='windows-1252'),
            "image_mapping": "{}",
        }
        print("post request")
        r = requests.post(url, data=fields, files=files)
        if r.status_code == 400:
            print(r.json())
            pass # ToDo: Error Response
        else:
            if not os.path.exists(folder):
                os.makedirs(folder)
            chunk_size = 1024
            outname = "{}{}".format(folder, name)
            i = 1
            with open(outname, 'wb+') as fd:

                for chunk in r.iter_content(chunk_size):
                    fd.write(chunk)

import requests
import json
def renderdoc2(data_input, folder, name, companyid, targetformat):
    url = 'http://192.168.0.199:8765/form'
    template_path = os.path.abspath("masterdata/kleingeraete_template{}.odt".format(companyid))
    with open(template_path, "rb") as template_file:
        files = {'tmpl_file': template_file}
        items = []
        for item in data_input['data']:
            comment = item['comment'] if item['comment'] else ''
            items.append(
                {'id': item['prodid'], 'name': item['comment'], 'price': ('%.2f' % item['price']).replace(".",",")})
        # company specific
        info = {'kostenstelle': data_input['modulerefid'],
                'kolonne': '1-7802-38',
                'user': 'Platzhalter',
                'bez_kostenstelle': data_input['subject'],
                'id':data_input['id'],
                'date': data_input['docdate'],
                'abholer': data_input['abholer']}
        data = dict(items=items, items2=[], info=info)
        fields = {
            "targetformat": targetformat,
            "datadict": json.dumps(data, encoding='windows-1252'),
            "image_mapping": "{}",
        }
        r = requests.post(url, data=fields, files=files)
        if r.status_code == 400:
            pass # ToDo: Error Response
        else:
            if not os.path.exists(folder):
                os.makedirs(folder)
            chunk_size = 1024
            outname = "{}{}".format(folder, name)
            i = 1
            with open(outname, 'wb+') as fd:

                for chunk in r.iter_content(chunk_size):
                    fd.write(chunk)