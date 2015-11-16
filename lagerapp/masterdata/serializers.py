from rest_framework import serializers
from masterdata.models import Supplier, Stock, StockData, Product, Nature, ProductSupplier, ProductPacking, PurchaseDoc

# from django.contrib.auth.models import User
class SupplierSerializer(serializers.HyperlinkedModelSerializer):
    def __init__(self, *args, **kwargs):
        # Only used for debugging. Extend init to print repr of Serializer instance.
        super(SupplierSerializer, self).__init__(*args, **kwargs)
        print(repr(self))

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
    def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(ProductSerializer, self).__init__(*args, **kwargs)
        print(repr(self))

    nature = serializers.SlugRelatedField(read_only=True, slug_field='name')
    supplier = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productsupplier-detail")
    packing = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name="productpacking-detail")
    # defaultsupplier = serializers.SlugRelatedField(read_only=True, allow_null=True, slug_field='namea')
    defaultsupplier = serializers.HyperlinkedRelatedField(read_only=True, allow_null=True, view_name="supplier-detail")
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


class PurchaseDocSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PurchaseDoc
        fields = ('url', 'id', 'responsible', 'doctype', 'module', 'supplierid', 'status', 'docdate')
