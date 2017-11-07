# encoding=UTF-8
import os
import subprocess
import sys
import traceback
from django.utils.dateparse import parse_datetime
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from models import Staff01, Project01
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
    fileurl = 'http://%s/static/Bestellung/%s' % (settings['server'], docname)
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=data['id'])
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=data['id'], pdf=fileurl)
    return Response('')

@api_view(['POST'])
def makepdf1(request):
    """ Build a data dictionary and use py3o.template server to render a document file from an ods template.
        Return the url of the generated file. Optional: Upload the generated pdf document to a webserver via FTP. """
    print("makepdf")

    with open('settings.json') as settings_file:
        settings = json.load(settings_file)
        ftpsettings = settings["ftp"]
        purchase = settings["purchase"]
        document_folder = settings["purchase"]["folder"]
        data = dict(request.data['doc'])
        dt = parse_datetime(data['docdate'])
        data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
        data.update(purchase)
        docname = '%s-Bestellung-%s.pdf' % (data['company'].replace(" ", "_"), data['id'])
        renderdoc(data, document_folder, docname, 'pdf')
        fileurl = 'http://%s/static/Bestellung/%s' % (settings['server'], docname)
        try:
            obj = PurchaseDocuments.objects.get(purchasedocid=data['id'])
            setattr(obj, 'pdf', fileurl)
            obj.save()
        except PurchaseDocuments.DoesNotExist:
            PurchaseDocuments.objects.create(purchasedocid=data['id'], pdf=fileurl)
        return Response(fileurl)

@api_view(['POST'])
def lagerausgangmakepdf(request, companyid):
    """ Build a data dictionary and use py3o.template server to render a document file from an ods template.
        Return the url of the generated file. Optional: Upload the generated pdf document to a webserver via FTP. 
        We use the same function for Lagerrueckgabe, by using a different template."""
    print("lagerausgangmakepdf")
    with open('settings.json') as settings_file:
        #ftpsettings = settings["ftp"]
        settings = json.load(settings_file)
        document_folder = settings["lagerausgang"]["folder"]
        lagerausgang = dict(request.data["doc"])
        dt = parse_datetime(lagerausgang['docdate'])
        lagerausgang['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
        doctype = request.data['type']
        customer = request.data['kunde']
        docname = "lagerbewegung_{}.{}".format(lagerausgang['id'], doctype)
        print(lagerausgang, document_folder, docname, companyid, doctype, customer)
        if lagerausgang['type'] == 'LAGERAUSGANG':
            template_path = os.path.abspath("masterdata/lagerausgang_template{0}.odt".format(companyid))
        elif lagerausgang['type'] == 'LAGERRUECKGABE':
            template_path = os.path.abspath("masterdata/lagerrueckgabe_template{0}.odt".format(companyid))
        else:
            print("Typ der Lagerbewegung ungültig.")
            return Response({'data': 'Error Invalid Type'}, status='500 Invalid Type')
        print(template_path)
        renderdoc1(lagerausgang, document_folder, docname, customer, doctype, template_path)
        fileurl = 'http://%s/static/Lagerausgang/%s' % (settings['server'], docname)
        print(fileurl)
        #create_purchase_document(data['id'], doctype, fileurl)
        return Response(fileurl)

def create_purchase_document(id, doctype, fileurl):
    try:
        obj = PurchaseDocuments.objects.get(purchasedocid=id)
        setattr(obj, doctype, fileurl)
        obj.save()
    except PurchaseDocuments.DoesNotExist:
        PurchaseDocuments.objects.create(purchasedocid=id, pdf=fileurl)

def renderdoc(data_input, folder, name, targetformat):
    #t = Template(os.path.abspath("masterdata/bestellung_template.odt"),
     #            outputfile)
    #t.set_image_path('staticimage.logo', os.path.abspath("masterdata/logo.png"))
    print("renderdoc")
    url = 'http://192.168.0.199:8765/form'
    template_path = os.path.abspath("masterdata/bestellung_template01.odt")
    print(template_path)
    with open(template_path, "rb") as template_file:
        print("open template")
        files = {'tmpl_file': template_file}
        supplier = data_input['supplier']
        try:
            responsible = Staff01.objects.get(id=data_input['responsible'])
            print(responsible.firstname)
        except Staff01.DoesNotExist:
            responsible = type('Staff', (object,), {'firstname':'','lastname':'', 'phone':''})
        try:
            stockinfo = Project01.objects.get(id=data_input['kostenstelle'])
            try:
                kontaktperson = stockinfo.leader
            except (Staff01.DoesNotExist, Project01.DoesNotExist) as e:
                print(traceback.format_exception(*sys.exc_info()))
                kontaktperson = type('Staff', (object,), {'firstname':'','lastname':'', 'mobile':''})
            try:
                lagerist = stockinfo.manager
            except (Staff01.DoesNotExist, Project01.DoesNotExist) as e:
                print(traceback.format_exception(*sys.exc_info()))
                lagerist = type('Staff', (object,), {'firstname':'','lastname':'', 'mobile':''})
        except Project01.DoesNotExist as e:
            print(traceback.format_exception(*sys.exc_info()))
            kontaktperson = type('Staff', (object,), {'firstname': '', 'lastname': '', 'mobile': ''})
            lagerist = type('Staff', (object,), {'firstname': '', 'lastname': '', 'mobile': ''})

        print("get staff")
        items = []
        total = '%.2f' % sum(item['amount'] for item in data_input['data'])
        for item in data_input['data']:
            if item['packing'] != '':
                item['packing'] = 'Verpackt als: %s' % item['packing']
            items.append(
                {'id': item['prodid'], 'name': item['name'], 'unit': item['unit'], 'quantity': '%.3f' % item['quantity'],
                 'price': '%.2f' % item['price'], 'amount': '%.2f' % item['amount'], 'packing': item['packing'],
                 'comment': item['comment']})
        print("loop data")

        recipient = {'name': supplier['namea'], 'street': supplier['address'], 'city': supplier['zipcode'] + ' ' + supplier['city'] }
        print()
        sender = {'address': data_input['adr_kurz'], 'info': 'info'}
        # company specific
        info = {'kostenstelle': data_input['kostenstelle'],
                'bez_kostenstelle': data_input['bez_kostenstelle'],
                'id': data_input['id'], 'date': data_input['docdate'],
                'bauleiter': '%s %s' % (lagerist.firstname, lagerist.lastname),
                'bauleitertel': "(Tel. %s)"%lagerist.mobile if lagerist.mobile else "",
                'polier': '%s %s' % (responsible.firstname, responsible.lastname),
                'poliertel': "(Tel. %s)"%responsible.phone if responsible.phone else "",
                'lieferadresse': data_input['adr_lang'],
                'infotext': format_py3o_context_value(unicode(data_input['infotext']))}
        data = dict(items=items, recipient=recipient, sender=sender, info=info, total=total)
        fields = {
            "targetformat": targetformat,
            "datadict": json.dumps(data, encoding='windows-1252'),
            "image_mapping": "{}",
            "ignore_undefined_variables": "on"
        }
        print(fields)
        print("post request")
        r = requests.post(url, data=fields, files=files)
        if r.status_code == 400:
            print(r.json())
            pass  # ToDo: Error Response
        else:
            if not os.path.exists(folder):
                os.makedirs(folder)
            chunk_size = 1024
            outname = "{}{}".format(folder, name)
            print(outname)
            i = 1
            with open(outname, 'wb+') as fd:
                for chunk in r.iter_content(chunk_size):
                    fd.write(chunk)

import requests
import json
def renderdoc1(data_input, folder, name, customer, targetformat, template_path):
    url = 'http://192.168.0.199:8765/form'
    with open(template_path, "rb") as template_file:
        files = {'tmpl_file': template_file}
        customer = companies[customer]
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
            "image_mapping": "{}"
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