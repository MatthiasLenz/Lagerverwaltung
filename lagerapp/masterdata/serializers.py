from rest_framework import serializers
from masterdata.models import UserData, Supplier, Stock, StockData, Product, Nature, ProductSupplier, ProductPacking, \
    PurchaseDoc, PurchaseDocData, DeliveryNote, DeliveryNoteData, Staff, PurchaseDocuments
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    userdata = serializers.SlugRelatedField(many=True, read_only=True, slug_field='prodid')
    class Meta:
        model = User
        fields = ('id', 'username', 'userdata')


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ('user', 'prodid')

class SupplierSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    # Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(SupplierSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))

    class Meta:
        model = Supplier
        fields = (
        'url', 'id', 'namea', 'nameb', 'address', 'zipcode', 'city', 'country', 'phone', 'fax', 'vatnum', 'active',
        'numberorders', 'bookinid')


class StockSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Stock
        fields = ('url', 'id', 'name', 'stockkeeper', 'type', 'defaultlocationid', 'tstamp')


class StockDataSerializer(serializers.HyperlinkedModelSerializer):
    # prodid = serializers.CharField(read_only=True,max_length=100)
    class Meta:
        model = StockData
        fields = (
            'url', 'id', 'rowid', 'stockid', 'prodid', 'quantitymin', 'quantitymax', 'quantitycur', 'quantityavail',
            'location')


class NatureSerializer(serializers.HyperlinkedModelSerializer):
    """def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(NatureSerializer, self).__init__(*args, **kwargs)
        print(repr(self))"""

    class Meta:
        model = Nature
        fields = ('url', 'id', 'title', 'name')


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    # def __init__(self, *args, **kwargs):
    #    #Only used for debugging. Extend init to print repr of Serializer instance.
    #    super(ProductSerializer, self).__init__(*args, **kwargs)
    #    print(repr(self))

    nature = serializers.SlugRelatedField(read_only=True, slug_field='name')
    supplier = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productsupplier-detail")
    packing = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productpacking-detail")
    # defaultsupplier = serializers.SlugRelatedField(read_only=True, allow_null=True, slug_field='namea')
    defaultsupplier = SupplierSerializer(read_only=True, allow_null=True)
    class Meta:
        model = Product
        fields = (
            'url', 'id', 'name1', 'detailedname1', 'title', 'marked', 'unit1', 'grosspurchaseprice', 'netpurchaseprice',
            'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
            'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid', 'nature', 'supplier', 'packing')


class ProductPackingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductPacking
        fields = ('url', 'rowid', 'packingid', 'prodid', 'name', 'quantity')

class ProductSupplierSerializer(serializers.HyperlinkedModelSerializer):
    supplierid = SupplierSerializer(read_only=True, allow_null=True)
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
        model = DeliveryNoteData
        fields = (
        'linetype', 'rowid', 'deliverynoteid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'projectid',
        'comment', 'dataid', 'packing', 'calclineexpression', 'quantityrejected', 'stockmovementid')

class DeliveryNoteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    data = DeliveryNoteDataSerializer(many=True, allow_null=True, required=False)
    class Meta:
        model = DeliveryNote
        fields = ('id', 'orderid', 'extdocno', 'subject', 'responsible', 'doctype', 'module', 'supplierid', 'status',
                  'docdate', 'stockid', 'supplierinvoicenumber', 'data')

    def create(self, validated_data):
        data = validated_data.pop('data')  # 'data' needs to be removed first
        deliverynote = DeliveryNote.objects.create(**validated_data)
        # Wichtig: Im foreign key feld muss immer das Object selbst referenziert werden, nicht die ID des Objekts,
        # also 'prodid': <Product: N999> und nicht 'prodid': 'N999'
        # Die Feldbezeichnung purchasedocid ist in diesem Fall verwirrend: In purchasedoc umbenennen?
        for entry in data:
            data_data = dict(entry)
            DeliveryNoteData.objects.create(deliverynoteid=deliverynote, **data_data)

        return deliverynote

class PurchaseDocDataSerializer(serializers.ModelSerializer):
    rowid = serializers.IntegerField(allow_null=True)
    class Meta:
        model = PurchaseDocData
        fields = ('rowid', 'purchasedocid', 'prodid', 'name', 'unit', 'quantity', 'price', 'amount', 'packing')


class PurchaseDocSerializer(serializers.ModelSerializer):
    # supplier = SupplierSerializer(read_only=True, allow_null=True)
    data = PurchaseDocDataSerializer(many=True, allow_null=True, required=False)
    deliverynotes = DeliveryNoteSerializer(many=True, allow_null=True, required=False)
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        model = PurchaseDoc
        fields = (
            'url', 'id', 'responsible', 'doctype', 'module', 'supplierid', 'status', 'docdate', 'data', 'deliverynotes')

    def create(self, validated_data):
        data = validated_data.pop('data')  # 'data' needs to be removed first
        deilverynotes = validated_data.pop('deliverynotes')
        purchasedoc = PurchaseDoc.objects.create(**validated_data)
        # Wichtig: Im foreign key feld muss immer das Object selbst referenziert werden, nicht die ID des Objekts,
        # also 'prodid': <Product: N999> und nicht 'prodid': 'N999'
        # Die Feldbezeichnung purchasedocid ist in diesem Fall verwirrend: In purchasedoc umbenennen?
        for entry in data:
            data_data = dict(entry)
            PurchaseDocData.objects.create(purchasedocid=purchasedoc, **data_data)

        return purchasedoc

    def update(self, instance, validated_data):
        # The standard implementation is fine, as long as we do not use it for nested writes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PurchaseDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseDocuments

class MinPurchaseDocSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, max_length=15, allow_blank=True)
    class Meta:
        model = PurchaseDoc
        fields = ('url', 'id', 'responsible', 'doctype', 'module', 'status', 'docdate')


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ('id', 'firstname', 'lastname', 'phone', 'mobile', 'mail', 'gender')

