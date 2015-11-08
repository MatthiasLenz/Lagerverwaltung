#encoding=UTF-8
from django.db import models
"""Wichtig, wenn man in serializer related fields benutzen möchte, dann muss man dafür hier im model ein field anlegen. In der rest framework beschreibung wird das nicht gemacht,
   vielleicht macht es einen Unterschied, wenn man nicht managed = false einstellt.
"""
class Stock(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True) # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=40, blank=True) # Field name made lowercase.
    stockkeeper = models.CharField(db_column='Stockkeeper', max_length=15, blank=True) # Field name made lowercase.
    type = models.SmallIntegerField(db_column='Type', blank=True, null=True) # Field name made lowercase.
    defaultlocationid = models.CharField(db_column='defaultLocationID', max_length=15, blank=True) # Field name made lowercase.
    tstamp = models.TextField(db_column='TStamp') # Field name made lowercase. This field type is a guess.
    class Meta:
        managed = False
        db_table = 'Stock'
        app_label = 'hit'
        
class Nature(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True) # Field name made lowercase.
    title = models.NullBooleanField(db_column='Title') # Field name made lowercase.
    titlegrade = models.SmallIntegerField(db_column='TitleGrade', blank=True, null=True) # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=35, blank=True) # Field name made lowercase.
    remark = models.CharField(db_column='Remark', max_length=50, blank=True) # Field name made lowercase.
    class Meta:
        managed = False
        db_table = 'Nature'
        app_label = 'hit'
        
class Product(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True) # Field name made lowercase.
    name1 = models.CharField(db_column='Name1', max_length=60, blank=True) # Field name made lowercase.
    marked = models.NullBooleanField(db_column='Marked') # Field name made lowercase.
    unit1 = models.CharField(db_column='Unit1', max_length=5, blank=True) # Field name made lowercase.
    detailedname1 = models.TextField(db_column='DetailedName1', blank=True) # Field name made lowercase.
    title = models.NullBooleanField(db_column='Title') # Field name made lowercase.
    titlegrade = models.SmallIntegerField(db_column='TitleGrade', blank=True, null=True) # Field name made lowercase.
    datecreation = models.DateTimeField(db_column='DateCreation', blank=True, null=True) # Field name made lowercase.
    datemodification = models.DateTimeField(db_column='DateModification', blank=True, null=True) # Field name made lowercase.
    dateprice = models.DateTimeField(db_column='DatePrice', blank=True, null=True) # Field name made lowercase.
    purchasecurrency = models.CharField(db_column='PurchaseCurrency', max_length=3, blank=True) # Field name made lowercase.
    purchasetype = models.SmallIntegerField(db_column='PurchaseType', blank=True, null=True) # Field name made lowercase.
    grosspurchaseprice = models.FloatField(db_column='GrossPurchasePrice', blank=True, null=True) # Field name made lowercase.
    grosspurchasediscount = models.FloatField(db_column='GrossPurchaseDiscount', blank=True, null=True) # Field name made lowercase.
    netpurchaseprice = models.FloatField(db_column='NetPurchasePrice', blank=True, null=True) # Field name made lowercase.
    stockkeepingmargin = models.FloatField(db_column='StockkeepingMargin', blank=True, null=True) # Field name made lowercase.
    shippingcosts = models.FloatField(db_column='ShippingCosts', blank=True, null=True) # Field name made lowercase.
    handling = models.FloatField(db_column='Handling', blank=True, null=True) # Field name made lowercase.
    netcalculationprice = models.FloatField(db_column='NetCalculationPrice', blank=True, null=True) # Field name made lowercase.
    customstariffid = models.CharField(db_column='CustomsTariffID', max_length=15, blank=True) # Field name made lowercase.
    rupercu = models.FloatField(db_column='RUPerCU', blank=True, null=True) # Field name made lowercase.
    producttype = models.CharField(db_column='ProductType', max_length=3, blank=True) # Field name made lowercase.
    stockkeeper = models.CharField(db_column='Stockkeeper', max_length=15, blank=True) # Field name made lowercase.
    buyer = models.CharField(db_column='Buyer', max_length=15, blank=True) # Field name made lowercase.
    stockplace = models.CharField(db_column='StockPlace', max_length=15, blank=True) # Field name made lowercase.
    stockmin = models.FloatField(db_column='StockMin', blank=True, null=True) # Field name made lowercase.
    stockmax = models.FloatField(db_column='StockMax', blank=True, null=True) # Field name made lowercase.
    stockcur = models.FloatField(db_column='StockCur', blank=True, null=True) # Field name made lowercase.
    stockavail = models.FloatField(db_column='StockAvail', blank=True, null=True) # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True) # Field name made lowercase.
    volume = models.FloatField(db_column='Volume', blank=True, null=True) # Field name made lowercase.
    barcode = models.CharField(db_column='BarCode', max_length=20, blank=True) # Field name made lowercase.
    salesmargin = models.FloatField(db_column='SalesMargin', blank=True, null=True) # Field name made lowercase.
    salesprice = models.FloatField(db_column='SalesPrice', blank=True, null=True) # Field name made lowercase.
    salespricepredefined = models.NullBooleanField(db_column='SalesPricePredefined') # Field name made lowercase.
    discounttype = models.SmallIntegerField(db_column='DiscountType', blank=True, null=True) # Field name made lowercase.
    discountrate1 = models.FloatField(db_column='DiscountRate1', blank=True, null=True) # Field name made lowercase.
    discountquantity2 = models.FloatField(db_column='DiscountQuantity2', blank=True, null=True) # Field name made lowercase.
    discountrate2 = models.FloatField(db_column='DiscountRate2', blank=True, null=True) # Field name made lowercase.
    discountquantity3 = models.FloatField(db_column='DiscountQuantity3', blank=True, null=True) # Field name made lowercase.
    discountrate3 = models.FloatField(db_column='DiscountRate3', blank=True, null=True) # Field name made lowercase.
    discountquantity4 = models.FloatField(db_column='DiscountQuantity4', blank=True, null=True) # Field name made lowercase.
    discountrate4 = models.FloatField(db_column='DiscountRate4', blank=True, null=True) # Field name made lowercase.
    discountquantity5 = models.FloatField(db_column='DiscountQuantity5', blank=True, null=True) # Field name made lowercase.
    discountrate5 = models.FloatField(db_column='DiscountRate5', blank=True, null=True) # Field name made lowercase.
    usespecialsalesprice = models.NullBooleanField(db_column='UseSpecialSalesPrice') # Field name made lowercase.
    specialsalesprice = models.FloatField(db_column='SpecialSalesPrice', blank=True, null=True) # Field name made lowercase.
    usespecialsalesdiscount = models.NullBooleanField(db_column='UseSpecialSalesDiscount') # Field name made lowercase.
    specialsalesdiscount = models.FloatField(db_column='SpecialSalesDiscount', blank=True, null=True) # Field name made lowercase.
    #memo = models.TextField(db_column='Memo', blank=True) # Field name made lowercase.
    taxcodeinvoice = models.CharField(db_column='TaxCodeInvoice', max_length=6, blank=True) # Field name made lowercase.
    projectquickselect = models.NullBooleanField(db_column='ProjectQuickSelect') # Field name made lowercase.
    taxcodecreditnote = models.CharField(db_column='TaxCodeCreditNote', max_length=6, blank=True) # Field name made lowercase.
    shopprice = models.FloatField(db_column='ShopPrice', blank=True, null=True) # Field name made lowercase.
    additionalcharges = models.FloatField(db_column='AdditionalCharges', blank=True, null=True) # Field name made lowercase.
    expirationdate = models.DateTimeField(db_column='ExpirationDate', blank=True, null=True) # Field name made lowercase.
    defaultsupplier = models.CharField(db_column='DefaultSupplier', max_length=15, blank=True) # Field name made lowercase.
    salespriceforquot = models.NullBooleanField(db_column='SalesPriceForQuot') # Field name made lowercase.
    #resourcenatureid = models.CharField(db_column='ResourceNatureID', max_length=15, blank=True) # Field name made lowercase.
    resourcenatureid =  models.ForeignKey(Nature, db_column='ResourceNatureID', blank=True, null=True) # Field name made lowercase.
    macropriceimportcomponents = models.NullBooleanField(db_column='MacroPriceImportComponents') # Field name made lowercase.
    keywords = models.CharField(db_column='Keywords', max_length=255, blank=True) # Field name made lowercase.
    piecesstockmode = models.NullBooleanField(db_column='PiecesStockMode') # Field name made lowercase.
    piecesstocktype = models.SmallIntegerField(db_column='PiecesStockType', blank=True, null=True) # Field name made lowercase.
    piecesstockfactor = models.FloatField(db_column='PiecesStockFactor', blank=True, null=True) # Field name made lowercase.
    takefromstock = models.NullBooleanField(db_column='TakeFromStock') # Field name made lowercase.
    salespriceforproj = models.NullBooleanField(db_column='SalesPriceForProj') # Field name made lowercase.
    salespricetype = models.SmallIntegerField(db_column='SalesPriceType', blank=True, null=True) # Field name made lowercase.
    manufacturerid = models.CharField(db_column='ManufacturerID', max_length=25, blank=True) # Field name made lowercase.
    manufacturerdescription = models.CharField(db_column='ManufacturerDescription', max_length=60, blank=True) # Field name made lowercase.
    salesmarginmin = models.FloatField(db_column='SalesMarginMin', blank=True, null=True) # Field name made lowercase.
    residualvalue = models.FloatField(db_column='ResidualValue', blank=True, null=True) # Field name made lowercase.
    rentalresourceid = models.CharField(db_column='RentalResourceID', max_length=15, blank=True) # Field name made lowercase.
    residualvalueexternal = models.FloatField(db_column='ResidualValueExternal', blank=True, null=True) # Field name made lowercase.
    active = models.NullBooleanField(db_column='Active') # Field name made lowercase.
    manufacturer = models.CharField(db_column='Manufacturer', max_length=25, blank=True) # Field name made lowercase.
    #wenn man im serializer ein feld hinzufügt, dann muss das auch hier im Model vorhanden sein, man kann ein Feld aus der Datenbank dazu ein zweites mal verwenden.
    nature =  models.ForeignKey(Nature, db_column='ResourceNatureID', blank=True, null=True) # Field name made lowercase.
    class Meta:
        managed = False
        db_table = 'Product'
        app_label = 'hit'

class StockData(models.Model):
    id = models.IntegerField(db_column='RowID')
    rowid = models.IntegerField(db_column='RowID', primary_key=True) # Field name made lowercase.
    stockid = models.ForeignKey(Stock, db_column='StockID', blank=True, null=True) # Field name made lowercase.
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True) # Field name made lowercase.
    quantitymin = models.FloatField(db_column='QuantityMin', blank=True, null=True) # Field name made lowercase.
    quantitymax = models.FloatField(db_column='QuantityMax', blank=True, null=True) # Field name made lowercase.
    quantitycur = models.FloatField(db_column='QuantityCur', blank=True, null=True) # Field name made lowercase.
    quantityavail = models.FloatField(db_column='QuantityAvail', blank=True, null=True) # Field name made lowercase.
    consumption01 = models.FloatField(db_column='Consumption01', blank=True, null=True) # Field name made lowercase.
    consumption02 = models.FloatField(db_column='Consumption02', blank=True, null=True) # Field name made lowercase.
    consumption03 = models.FloatField(db_column='Consumption03', blank=True, null=True) # Field name made lowercase.
    consumption04 = models.FloatField(db_column='Consumption04', blank=True, null=True) # Field name made lowercase.
    consumption05 = models.FloatField(db_column='Consumption05', blank=True, null=True) # Field name made lowercase.
    consumption06 = models.FloatField(db_column='Consumption06', blank=True, null=True) # Field name made lowercase.
    consumption07 = models.FloatField(db_column='Consumption07', blank=True, null=True) # Field name made lowercase.
    consumption08 = models.FloatField(db_column='Consumption08', blank=True, null=True) # Field name made lowercase.
    consumption09 = models.FloatField(db_column='Consumption09', blank=True, null=True) # Field name made lowercase.
    consumption10 = models.FloatField(db_column='Consumption10', blank=True, null=True) # Field name made lowercase.
    consumption11 = models.FloatField(db_column='Consumption11', blank=True, null=True) # Field name made lowercase.
    consumption12 = models.FloatField(db_column='Consumption12', blank=True, null=True) # Field name made lowercase.
    location = models.CharField(db_column='Location', max_length=15, blank=True) # Field name made lowercase.
    #tstamp = models.TextField(db_column='TStamp') # Field name made lowercase. This field type is a guess.
    class Meta:
        managed = False
        db_table = 'StockData'
        app_label = 'hit'
        
