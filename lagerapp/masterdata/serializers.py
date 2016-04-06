from datetime import date
from rest_framework import serializers
from basemodels import UserData, Supplier, Stock, StockData, Product, Nature, ProductSupplier, \
    ProductPacking, StockMovement, PurchaseDocuments
from models import Supplier01, Supplier04, Supplier05, PurchaseDoc01, PurchaseDoc04, PurchaseDoc05, \
    PurchaseDocData01, PurchaseDocData04, PurchaseDocData05, DeliveryNoteData01, DeliveryNoteData04, DeliveryNoteData05, \
    DeliveryNote01, DeliveryNote04, DeliveryNote05, Staff01, Staff04, Staff05
# from baseserializers import SupplierSerializer
from django.contrib.auth.models import User


class SupplierSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    # Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(SupplierSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))
    class Meta:
        fields = (
            'url', 'id', 'namea', 'nameb', 'address', 'zipcode', 'city', 'country', 'phone', 'fax', 'vatnum', 'active',
            'numberorders')


class SupplierSerializer01(SupplierSerializer):
    class Meta(SupplierSerializer.Meta):
        model = Supplier01


class SupplierSerializer04(SupplierSerializer):
    class Meta(SupplierSerializer.Meta):
        model = Supplier04


class SupplierSerializer05(SupplierSerializer):
    class Meta(SupplierSerializer.Meta):
        model = Supplier05

class UserSerializer(serializers.ModelSerializer):
    userdata = serializers.SlugRelatedField(many=True, read_only=True, slug_field='prodid')
    class Meta:
        model = User
        fields = ('id', 'username', 'userdata')


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ('user', 'prodid')


class StockSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Stock
        fields = ('url', 'id', 'name', 'stockkeeper', 'type', 'defaultlocationid', 'tstamp')


class StockMovementSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = StockMovement
        fields = ('movementid', 'datecreation', 'datemodification', 'stockid', 'locationid', 'prodid', 'quantitydelta',
                  'moduleid', 'modulerecordtypeid', 'key1', 'userid', 'comment')

class NatureSerializer(serializers.HyperlinkedModelSerializer):
    """def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(NatureSerializer, self).__init__(*args, **kwargs)
        print(repr(self))"""

    class Meta:
        model = Nature
        fields = ('url', 'id', 'title', 'name')


class NatureSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Nature
        fields = ('id', 'title', 'name')

class ProductSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    #Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(ProductSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))

    nature = serializers.SlugRelatedField(read_only=True, slug_field='name')
    supplier = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productsupplier-detail")
    packing = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productpacking-detail")
    # defaultsupplier = serializers.SlugRelatedField(read_only=True, allow_null=True, slug_field='namea')
    defaultsupplier = SupplierSerializer01(read_only=True, allow_null=True)
    class Meta:
        model = Product
        fields = (
            'url', 'id', 'name1', 'detailedname1', 'title', 'marked', 'unit1', 'grosspurchaseprice', 'netpurchaseprice',
            'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
            'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid', 'nature', 'supplier', 'packing')


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
    supplierid = SupplierSerializer01(read_only=True, allow_null=True)
    class Meta:
        model = ProductSupplier
        fields = ('url', 'prodid', 'supplierid', 'purchaseprice', 'comment', 'unit', 'id')


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
    class Meta:
        fields = (
        'linetype', 'rowid', 'deliverynoteid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'projectid',
        'comment', 'dataid', 'packing', 'calclineexpression', 'quantityrejected', 'stockmovementid')


class DeliveryNoteDataSerializer01(DeliveryNoteDataSerializer):
    class Meta(DeliveryNoteDataSerializer.Meta):
        model = DeliveryNoteData01


class DeliveryNoteDataSerializer04(DeliveryNoteDataSerializer):
    class Meta(DeliveryNoteDataSerializer.Meta):
        model = DeliveryNoteData04


class DeliveryNoteDataSerializer05(DeliveryNoteDataSerializer):
    class Meta(DeliveryNoteDataSerializer.Meta):
        model = DeliveryNoteData05

class DeliveryNoteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        fields = ('id', 'orderid', 'extdocno', 'subject', 'responsible', 'doctype', 'module', 'supplierid', 'status',
                  'docdate', 'stockid', 'supplierinvoicenumber', 'data')

    def create(self, validated_data):
        data = validated_data.pop('data')  # 'data' needs to be removed first
        model = self.Meta.model
        datamodel = self.Meta.datamodel
        deliverynote = model.objects.create(**validated_data)
        print(deliverynote)
        print(type(deliverynote))
        # Wichtig: Im foreign key feld muss immer das Object selbst referenziert werden, nicht die ID des Objekts,
        # also 'prodid': <Product: N999> und nicht 'prodid': 'N999'
        # Die Feldbezeichnung purchasedocid ist in diesem Fall verwirrend: In purchasedoc umbenennen?
        for entry in data:
            data_data = dict(entry)
            datamodel.objects.create(deliverynoteid=deliverynote, **data_data)
            # add stockmovement
            datecreation = "%s-%s-%s" % (date.today().year, date.today().month, date.today().day)
            stock = Stock.objects.get(id=deliverynote.stockid)
            product = Product.objects.get(id=data_data["prodid"])
            StockMovement.objects.create(datecreation=datecreation, datemodification=datecreation,
                                         stockid=stock, prodid=product, quantitydelta=data_data["quantity"], moduleid=6,
                                         modulerecordtypeid=6000, key1=deliverynote.id, userid=deliverynote.responsible)
        return deliverynote


class DeliveryNoteSerializer01(DeliveryNoteSerializer):
    data = DeliveryNoteDataSerializer01(many=True, allow_null=True, required=False)

    class Meta(DeliveryNoteSerializer.Meta):
        model = DeliveryNote01
        datamodel = DeliveryNoteData01

class DeliveryNoteSerializer04(DeliveryNoteSerializer):
    data = DeliveryNoteDataSerializer04(many=True, allow_null=True, required=False)

    class Meta(DeliveryNoteSerializer.Meta):
        model = DeliveryNote04
        datamodel = DeliveryNoteData04


class DeliveryNoteSerializer05(DeliveryNoteSerializer):
    data = DeliveryNoteDataSerializer05(many=True, allow_null=True, required=False)

    class Meta(DeliveryNoteSerializer.Meta):
        model = DeliveryNote05
        datamodel = DeliveryNoteData05

class PurchaseDocDataSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    class Meta:
        fields = (
        'rowid', 'purchasedocid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'packing', 'comment')


class PurchaseDocDataSerializer01(PurchaseDocDataSerializer):
    class Meta(PurchaseDocDataSerializer.Meta):
        model = PurchaseDocData01


class PurchaseDocDataSerializer04(PurchaseDocDataSerializer):
    class Meta(PurchaseDocDataSerializer.Meta):
        model = PurchaseDocData04


class PurchaseDocDataSerializer05(PurchaseDocDataSerializer):
    class Meta(PurchaseDocDataSerializer.Meta):
        model = PurchaseDocData05

class PurchaseDocSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        fields = (
            'url', 'id', 'responsible', 'doctype', 'module', 'supplierid', 'status', 'docdate', 'data', 'deliverynotes')

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


class PurchaseDocSerializer01(PurchaseDocSerializer):
    data = PurchaseDocDataSerializer01(many=True, allow_null=True, required=False)
    deliverynotes = DeliveryNoteSerializer01(many=True, allow_null=True, required=False)

    class Meta(PurchaseDocSerializer.Meta):
        model = PurchaseDoc01
        datamodel = PurchaseDocData01


class PurchaseDocSerializer04(PurchaseDocSerializer):
    data = PurchaseDocDataSerializer04(many=True, allow_null=True, required=False)
    deliverynotes = DeliveryNoteSerializer04(many=True, allow_null=True, required=False)
    class Meta(PurchaseDocSerializer.Meta):
        model = PurchaseDoc04
        datamodel = PurchaseDocData04


class PurchaseDocSerializer05(PurchaseDocSerializer):
    data = PurchaseDocDataSerializer05(many=True, allow_null=True, required=False)
    deliverynotes = DeliveryNoteSerializer05(many=True, allow_null=True, required=False)

    class Meta(PurchaseDocSerializer.Meta):
        model = PurchaseDoc05
        datamodel = PurchaseDocData05

class PurchaseDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseDocuments

class MinPurchaseDocSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        model = PurchaseDoc01
        fields = ('url', 'id', 'responsible', 'doctype', 'module', 'status', 'docdate')


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff01
        fields = ('id', 'firstname', 'lastname', 'phone', 'mobile', 'mail', 'gender')

