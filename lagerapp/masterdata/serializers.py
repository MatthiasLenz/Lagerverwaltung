from rest_framework import serializers
from masterdata.models import Stock, StockData, Product, Nature
#from django.contrib.auth.models import User


class StockSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Stock
        fields = ('id', 'name', 'stockkeeper', 'type', 'defaultlocationid', 'tstamp')

class StockDataSerializer(serializers.HyperlinkedModelSerializer):
    #prodid = serializers.CharField(read_only=True,max_length=100)
    class Meta:
        model = StockData
        fields = ('url', 'id','rowid','stockid','prodid','quantitymin', 'quantitymax', 'quantitycur', 'quantityavail','location')

class NatureSerializer(serializers.HyperlinkedModelSerializer):
    """def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(NatureSerializer, self).__init__(*args, **kwargs)
        print(repr(self))"""
    class Meta:
        model = Nature
        fields = ('url', 'id', 'title','name')


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    """def __init__(self, *args, **kwargs):
        #Only used for debugging. Extend init to print repr of Serializer instance.
        super(ProductSerializer, self).__init__(*args, **kwargs)
        print(repr(self))"""

    nature = serializers.SlugRelatedField(read_only=True, slug_field='name')
    class Meta:
        model = Product
        fields = ('url','id', 'name1','detailedname1','title','marked','unit1','grosspurchaseprice','netpurchaseprice', 'stockcur', 'stockavail','salesmargin','salesprice','taxcodeinvoice',
                  'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid', 'nature')


class FastProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name1', 'detailedname1', 'title', 'marked', 'unit1', 'grosspurchaseprice', 'netpurchaseprice',
                  'stockcur', 'stockavail', 'salesmargin', 'salesprice', 'taxcodeinvoice',
                  'taxcodecreditnote', 'shopprice', 'defaultsupplier', 'resourcenatureid')
