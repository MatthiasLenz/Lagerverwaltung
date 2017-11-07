from datetime import date
from rest_framework import serializers
from django.db import models
from basemodels import UserData, Stock, StockData, Product, Nature, ProductSupplier, \
    ProductPacking, StockMovement, PurchaseDocuments, Company, Installation, Lagerausgang, InstallationLinks, \
    InstallationConsumption, InstallationCounterHistory, ProductType
from models import Supplier01, PurchaseDoc01

from django.contrib.auth.models import User, Group


class StaffSerializer(serializers.ModelSerializer):
    Meta = None

def getStaffSerializer(model):
    #Serializer generator
    fields = ('id', 'firstname', 'lastname', 'phone', 'mobile', 'mail', 'gender')
    return type(model.__name__+'Serializer', (StaffSerializer,), dict(Meta = type("Meta", (),
          {'fields' : fields, 'model': model})))

class ProjectSerializer(serializers.ModelSerializer):
    Meta = None

def getProjectSerializer(model, staffmodel):
    fields = ('id', 'description', 'customer', 'address', 'country', 'zipcode', 'city', 'manager', 'leader',
              'leaderid', 'managerid','status','start_project','end_project')
    return type(model.__name__ + 'Serializer', (ProjectSerializer,), dict(
            Meta=type("Meta", (),{'fields': fields, 'model': model}),
            manager=getStaffSerializer(staffmodel)(read_only=True, allow_null=True),
            leader=getStaffSerializer(staffmodel)(read_only=True, allow_null=True)
    ))

class SupplierSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    # Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(SupplierSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))
    Meta = None

def getSupplierSerializer(model):
    fields = ('url', 'id', 'namea', 'nameb', 'address', 'zipcode', 'city', 'country', 'phone', 'fax', 'vatnum', 'active',
            'numberorders', 'mainmail')
    return type(model.__name__ + 'Serializer', (SupplierSerializer,), dict(
            Meta=type("Meta", (),{'fields': fields, 'model': model})
    ))



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'groups')


class UserDataSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', allow_blank=True)
    email = serializers.CharField(source='user.email', allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', allow_blank=True)

    class Meta:
        model = UserData
        fields = ('user', 'username', 'email','first_name', 'last_name', 'companyid','hituserid')


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company

class StockSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Stock
        fields = ('url', 'id', 'name', 'stockkeeper', 'type', 'defaultlocationid')


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ('movementid', 'datecreation', 'datemodification', 'stockid', 'prodid', 'quantitydelta',
                  'moduleid', 'modulerecordtypeid', 'key1', 'userid', 'comment')

class NatureSerializer(serializers.HyperlinkedModelSerializer):
    """def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(NatureSerializer, self).__init__(*args, **kwargs)
        print(repr(self))"""

    class Meta:
        model = Nature
        fields = ('url', 'id', 'title', 'name')

class ProductTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductType
        fields = ('id', 'name')

class ProductSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    #Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(ProductSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))

    nature = serializers.SlugRelatedField(read_only=True, slug_field='name')
    supplier = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productsupplier-detail")
    packing = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productpacking-detail", lookup_field="pk")
    # defaultsupplier = serializers.SlugRelatedField(read_only=True, allow_null=True, slug_field='namea')
    defaultsupplier = getSupplierSerializer(Supplier01)(read_only=True, allow_null=True)
    producttype = ProductTypeSerializer(read_only=True, allow_null=True)
    #ToDo: getter for ProductSerializer
    class Meta:
        model = Product
        fields = (
            'url', 'id', 'name1', 'detailedname1', 'title', 'marked', 'unit1', 'grosspurchaseprice', 'netpurchaseprice',
            'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
            'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid', 'nature', 'supplier', 'packing',
            'producttype')


# Need to generate a fake request for our hyperlinked results
from django.test.client import RequestFactory

context = dict(request=RequestFactory().get('/'))


class StockDataSerializer(serializers.HyperlinkedModelSerializer):
    prodid = ProductSerializer(read_only=True, allow_null=True)
    class Meta:
        model = StockData
        fields = (
            'url', 'id', 'rowid', 'stockid', 'prodid', 'quantitymin', 'quantitymax', 'quantitycur', 'quantityavail',
            'location')

    def to_representation(self, obj):
        data = super(StockDataSerializer, self).to_representation(obj)
        product = ProductSerializer(Product.objects.filter(id=obj.prodid)[0], context=context).data['nature']
        data['nature'] = product
        # data['prodid'] = NatureSerializer(Nature.objects.filter(id=obj.prodid)[0], context=context).data
        return data

class ProductPackingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductPacking
        fields = ('url', 'rowid', 'packingid', 'prodid', 'name', 'quantity')

class ProductSupplierSerializer(serializers.HyperlinkedModelSerializer):
    supplierid = getSupplierSerializer(Supplier01)(read_only=True, allow_null=True)
    class Meta:
        model = ProductSupplier
        fields = ('url', 'prodid', 'supplierid', 'purchaseprice', 'comment', 'unit', 'id')

"""def getProductSupplierSerializer(supplier_model):
    fields = ('url', 'prodid', 'supplierid', 'purchaseprice', 'comment', 'unit', 'id')
    return type('ProductSupplierSerializer', (ProductSupplierSerializer,), dict(
        Meta=type("Meta", (), {
            'fields': fields,
            'model': ProductSupplier}),
        supplierid=getStaffSerializer(supplier_model)(read_only=True, allow_null=True)
    ))
"""

from collections import OrderedDict
from rest_framework.fields import SkipField
from rest_framework.compat import unicode_to_repr
class FastProductSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        """
        Object instance -> Dict of primitive datatypes.
        """
        # ret = OrderedDict()
        ret = {}
        fields = self._readable_fields

        for field in fields:
            try:
                attribute = field.get_attribute(instance)
            except SkipField:
                continue

            if attribute is None:
                # We skip `to_representation` for `None` values so that
                # fields do not have to explicitly deal with that case.
                ret[field.field_name] = None
            else:
                ret[field.field_name] = field.to_representation(attribute)

        return ret

    class Meta:
        model = Product
        fields = ('id', 'name1', 'detailedname1', 'title', 'marked', 'unit1', 'grosspurchaseprice', 'netpurchaseprice',
                  'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
                  'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid')


class DeliveryNoteDataSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    Meta = None

def getDeliveryNoteDataSerializer(model):
    fields = ('linetype', 'rowid', 'deliverynoteid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'projectid',
        'comment', 'dataid', 'packing', 'calclineexpression', 'quantityrejected', 'stockmovementid')
    return type(model.__name__+"Serializer", (DeliveryNoteDataSerializer,), dict(Meta=type("Meta",(),{'fields' : fields, 'model': model})))

class DeliveryNoteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    #data = DeliveryNoteDataSerializer(many=True, allow_null=True, required=False)
    Meta = None
    def create(self, validated_data):
        """ Creates a Deliverynote and corresponding Stockmovement"""
        data = validated_data.pop('data')  # 'data' needs to be removed first
        model = self.Meta.model
        datamodel = self.Meta.datamodel
        deliverynote = model.objects.create(**validated_data)
        # Wichtig: Im foreign key feld muss immer das Object selbst referenziert werden, nicht die ID des Objekts,
        # also 'prodid': <Product: N999> und nicht 'prodid': 'N999'
        # Die Feldbezeichnung purchasedocid ist in diesem Fall verwirrend: In purchasedoc umbenennen?
        for entry in data:
            data_data = dict(entry)
            datamodel.objects.create(deliverynoteid=deliverynote, **data_data)
            # add stockmovement
            datecreation = "%s-%s-%s" % (date.today().year, date.today().month, date.today().day)
            #stock = Stock.objects.get(id=deliverynote.stockid)
            #product = Product.objects.get(id=data_data["prodid"])
            #stockdata = StockData.objects.filter(stockid=0).filter(prodid__id=data_data["prodid"])
            #StockMovement.objects.create(datecreation=datecreation, datemodification=datecreation,
            #                             stockid=stock, prodid=product, quantitydelta=data_data["quantity"], moduleid=6,
            #                             modulerecordtypeid=6000, key1=deliverynote.id, userid=deliverynote.responsible)
        return deliverynote

def getDeliveryNoteSerializer(model, datamodel):
    fields = ('id', 'orderid','extdocno', 'subject', 'responsible', 'doctype', 'module', 'modulerefid', 'supplierid', 'status',
              'docdate', 'stockid', 'supplierinvoicenumber', 'data')
    return type(model.__name__+"Serializer", (DeliveryNoteSerializer,), dict(
        Meta=type("Meta",(),{'fields' : fields, 'model': model,'datamodel':datamodel}),
        data=getDeliveryNoteDataSerializer(datamodel)(many=True, allow_null=True, required=False)))

class PurchaseDocDataSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    Meta = None

def getPurchaseDocDataSerializer(model):
    fields = ('rowid', 'purchasedocid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'packing', 'comment', 'dataid', 'projectid', 'stockmovementid')
    return type(model.__name__+"Serializer", (PurchaseDocDataSerializer,), dict(Meta=type("Meta",(),{'fields' : fields, 'model': model})))

class PurchaseDocSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        fields = (
            'url', 'id','subject','responsible','leader','doctype', 'module','modulerefid', 'supplierid', 'status',
            'docdate', 'data', 'deliverynotes','stockid')

    def create(self, validated_data):
        data = validated_data.pop('data')  # 'data' needs to be removed first
        deliverynotes = validated_data.pop('deliverynotes')

        # reference model from Meta, so it is replaced in inherited serializers
        purchasedoc = self.Meta.model.objects.create(**validated_data)
        # Wichtig: Im foreign key feld muss immer das Object selbst referenziert werden, nicht die ID des Objekts,
        # also 'prodid': <Product: N999> und nicht 'prodid': 'N999'
        # Die Feldbezeichnung purchasedocid ist in diesem Fall verwirrend: In purchasedoc umbenennen?
        for entry in data:
            data_data = dict(entry)
            self.Meta.datamodel.objects.create(purchasedocid=purchasedoc, **data_data)
        return purchasedoc

    def update(self, instance, validated_data):
        # The standard implementation is fine, as long as we do not use it for nested writes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

def getPurchaseDocSerializer(model, datamodel, delno_model, delno_datamodel):
    fields = ('url','id','subject','remark','responsible','leader','doctype', 'module','modulerefid', 'supplierid', 'status',
            'docdate', 'data', 'deliverynotes','stockid')
    return type(model.__name__+"Serializer", (PurchaseDocSerializer,), dict(
        Meta=type("Meta",(),{'fields' : fields, 'model': model,'datamodel':datamodel}),
        data=getPurchaseDocDataSerializer(datamodel)(many=True, allow_null=True, required=False),
        deliverynotes=getDeliveryNoteSerializer(delno_model, delno_datamodel)(many=True, allow_null=True, required=False)))


class PurchaseDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseDocuments

class LagerausgangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lagerausgang

class MinPurchaseDocSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        model = PurchaseDoc01
        fields = ('url', 'id', 'responsible', 'doctype', 'module', 'status', 'docdate')


class InstallationLinksSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    class Meta:
        model = InstallationLinks
        fields = ('id','rowid','filename','name','date')

class InstallationConsumptionSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    class Meta:
        model = InstallationConsumption
        fields = ('id','rowid','date','quantity')

class InstallationCounterHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InstallationCounterHistory
        fields = ('id','datecounter','counter')

class InstallationSerializer(serializers.ModelSerializer):
    prodid = ProductSerializer(read_only=True, allow_null=True)
    links = InstallationLinksSerializer(many=True, allow_null=True, required=False)
    #links = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="installationlinks-detail",
     #                                             lookup_field="pk")
    class Meta:
        model = Installation
        fields = ('id','name1','name2','chassisnum','licenseplate','purchasevalue','availability','availabilitystatus',
                  'availabilitystatusold','rentperdayresourceid','title','titlegrade','prodid','links','gpstag',
                  'constructionyear','datepurchase')
