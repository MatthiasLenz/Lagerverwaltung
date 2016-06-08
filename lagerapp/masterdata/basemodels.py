# encoding=UTF-8
from django.db import models

"""
    Wichtig, wenn man in serializer related fields benutzen möchte, dann muss man dafür hier im model ein field anlegen. In der rest framework beschreibung wird das nicht gemacht,
    vielleicht macht es einen Unterschied, wenn man nicht managed = false einstellt.
"""
class ProjectBase(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)
    description = models.CharField(db_column='Description', max_length=255, blank=True)
    customer = models.CharField(db_column='Customer', max_length=15, blank=True)
    address = models.CharField(db_column='Address', max_length=255, blank=True)
    zipcode = models.CharField(db_column='ZipCode', max_length=8, blank=True)
    country = models.CharField(db_column='Country', max_length=3, blank=True)
    city = models.CharField(db_column='City', max_length=30, blank=True)
    projectsimulated = models.NullBooleanField(db_column='ProjectSimulated', default=0)
    class Meta:
        abstract = True
        managed = False


class SupplierBase(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)
    namea = models.CharField(db_column='NameA', max_length=30, blank=True)
    nameb = models.CharField(db_column='NameB', max_length=30, blank=True)
    address = models.CharField(db_column='Address', max_length=255, blank=True)
    zipcode = models.CharField(db_column='ZipCode', max_length=8, blank=True)
    city = models.CharField(db_column='City', max_length=30, blank=True)
    country = models.CharField(db_column='NameB', max_length=3, blank=True)
    phone = models.CharField(db_column='MainPhone', max_length=25, blank=True)
    fax = models.CharField(db_column='MainFax', max_length=25, blank=True)
    vatnum = models.CharField(db_column='VATNumber', max_length=20, blank=True)
    active = models.NullBooleanField(db_column='Active')
    numberorders = models.SmallIntegerField(db_column='NumberOrders', blank=True, null=True)
    mainmail = models.CharField(db_column='MainMail', max_length=50, blank=True)

    def __unicode__(self):
        return self.id

    class Meta:
        abstract = True
        managed = False


class Supplier(SupplierBase):
    class Meta(SupplierBase.Meta):
        db_table = 'Supplier'
        app_label = 'hit_01_bookkeeping'


class DeliveryNoteBase(models.Model):
    id = models.CharField(db_column='ID', primary_key=True, max_length=15)
    extdocno = models.CharField(db_column='ExtDocNo', max_length=15, blank=True)
    subject = models.CharField(db_column='Subject', default='', max_length=255, blank=True)
    remark = models.CharField(db_column='Remark', default='', max_length=50)
    responsible = models.CharField(db_column='Responsible', max_length=15, blank=True)
    doctype = models.SmallIntegerField(db_column='DocType', default=0)
    module = models.SmallIntegerField(db_column='Module', blank=True, null=True)
    modulerefid = models.CharField(db_column='ModuleRefID', max_length=15, blank=True)
    deliveryaddress = models.CharField(db_column='DeliveryAddress', max_length=255, blank=True)
    status = models.SmallIntegerField(db_column='Status', blank=True, null=True)
    docdate = models.DateTimeField(db_column='DocDate', blank=True, null=True)
    stockid = models.CharField(db_column='StockID', max_length=15, blank=True)
    supplierinvoicenumber = models.CharField(db_column='SupplierInvoiceNumber', max_length=20, blank=True)
    datecreation = models.DateTimeField(db_column="DateCreation", auto_now_add=True, blank=True)
    datemodification = models.DateTimeField(db_column="DateModification", auto_now_add=True, blank=True)
    subject = models.CharField(db_column='Subject', default='', max_length=255, blank=True)
    memo = models.TextField(db_column='Memo', blank=True)
    marked = models.NullBooleanField(db_column='Marked', default=0)
    problem = models.NullBooleanField(db_column='Problem', default=0)
    country = models.CharField(db_column='Country', max_length=3, blank=True)
    zipcode = models.CharField(db_column='ZipCode', max_length=3, blank=True)
    city = models.CharField(db_column='City', max_length=30, blank=True)
    concerns = models.CharField(db_column='Concerns', max_length=60, blank=True)
    contactonsiteid = models.CharField(db_column='ContactOnSiteID', blank=True, max_length=15)
    suppliercontact = models.CharField(db_column='SupplierContact', blank=True, max_length=40)
    suppliercontactid = models.CharField(db_column='SupplierContactID', blank=True, max_length=15)
    vehicleidentification = models.CharField(db_column='VehicleIdentification', blank=True, max_length=30)
    titletextcmplnt = models.TextField(db_column='TitleTextCmplnt',
                                       default='Wir berechnen Ihnen Bauleistungen zu o.g. Baustelle wie folgt:')
    endtextcmplnt = models.TextField(db_column='EndTextCmplnt', blank=True)
    longitude = models.FloatField(db_column='Longitude', default=0)
    latitude = models.FloatField(db_column='Latitude', default=0)
    internalinvoicejournal = models.CharField(db_column='InternalInvoiceJournal', blank=True)
    internalinvoicenumber = models.IntegerField(db_column='InternalInvoiceNumber', default=0)
    language = models.CharField(db_column='Language', default='DEU')

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(int(self.__class__.objects.all().order_by('-id')[0].id) + 1)
        super(DeliveryNoteBase, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.id

    class Meta:
        abstract = True
        managed = False


class DeliveryNoteDataBase(models.Model):
    class Meta:
        abstract = True
        managed = False

    linetype = models.SmallIntegerField(db_column='LineType', blank=True, null=True, default=0)
    rowid = models.IntegerField(db_column='RowID', primary_key=True)
    # purchasedocdataid = models.ForeignField(db_column='PurchaseDocDataID', blank=True, null=True)
    prodid = models.CharField(db_column='ProdID', max_length=15)
    name = models.CharField(db_column='Name', max_length=255, blank=True, null=True)
    unit = models.CharField(db_column='Unit', max_length=5, blank=True, null=True)
    quantity = models.FloatField(db_column='Quantity', blank=True, null=True)
    price = models.FloatField(db_column='Price', blank=True, null=True)
    amount = models.FloatField(db_column='Amount', blank=True, null=True)
    projectid = models.CharField(db_column='ProjectID', max_length=15, blank=True)
    comment = models.CharField(db_column='Comment', max_length=255, blank=True)
    dataid = models.IntegerField(db_column='DataID', blank=True)
    packing = models.CharField(db_column='Packing', max_length=255, blank=True)
    calclineexpression = models.CharField(db_column='CalcLineExpression', max_length=60, blank=True)
    quantityrejected = models.FloatField(db_column='QuantityRejected', blank=True)
    stockmovementid = models.IntegerField(db_column='StockMovementID', blank=True)

    def save(self, *args, **kwargs):
        if not self.rowid:
            self.rowid = self.__class__.objects.all().order_by('-rowid')[0].rowid + 1
        super(DeliveryNoteDataBase, self).save(*args, **kwargs)

    def __unicode__(self):
        return str(self.rowid)


class StaffBase(models.Model):
    id = models.TextField(db_column='ID', primary_key=True)
    firstname = models.TextField(db_column='FirstName', blank=True, null=True)
    lastname = models.TextField(db_column='LastName', blank=True, null=True)
    phone = models.TextField(db_column='Phone', blank=True, null=True)
    mobile = models.TextField(db_column='Mobile', blank=True, null=True)
    mail = models.TextField(db_column='Mail', blank=True, null=True)
    gender = models.NullBooleanField(db_column='Gender')

    class Meta:
        abstract = True
        managed = False


class Nature(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)  # Field name made lowercase.
    title = models.NullBooleanField(db_column='Title')  # Field name made lowercase.
    titlegrade = models.SmallIntegerField(db_column='TitleGrade', blank=True, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=35, blank=True)  # Field name made lowercase.
    remark = models.CharField(db_column='Remark', max_length=50, blank=True)  # Field name made lowercase.

    def __unicode__(self):
        return self.id

    class Meta:
        managed = False
        db_table = 'Nature'
        app_label = 'hit_01_masterdata'


class Product(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)  # Field name made lowercase.
    name1 = models.CharField(db_column='Name1', max_length=60, blank=True)  # Field name made lowercase.
    marked = models.NullBooleanField(db_column='Marked')  # Field name made lowercase.
    unit1 = models.CharField(db_column='Unit1', max_length=5, blank=True)  # Field name made lowercase.
    detailedname1 = models.TextField(db_column='DetailedName1', blank=True)  # Field name made lowercase.
    title = models.NullBooleanField(db_column='Title')  # Field name made lowercase.
    titlegrade = models.SmallIntegerField(db_column='TitleGrade', blank=True, null=True)  # Field name made lowercase.
    datecreation = models.DateTimeField(db_column='DateCreation', blank=True, null=True)  # Field name made lowercase.
    datemodification = models.DateTimeField(db_column='DateModification', blank=True,
                                            null=True)  # Field name made lowercase.
    dateprice = models.DateTimeField(db_column='DatePrice', blank=True, null=True)  # Field name made lowercase.
    purchasecurrency = models.CharField(db_column='PurchaseCurrency', max_length=3,
                                        blank=True)  # Field name made lowercase.
    purchasetype = models.SmallIntegerField(db_column='PurchaseType', blank=True,
                                            null=True)  # Field name made lowercase.
    grosspurchaseprice = models.FloatField(db_column='GrossPurchasePrice', blank=True,
                                           null=True)  # Field name made lowercase.
    grosspurchasediscount = models.FloatField(db_column='GrossPurchaseDiscount', blank=True,
                                              null=True)  # Field name made lowercase.
    netpurchaseprice = models.FloatField(db_column='NetPurchasePrice', blank=True,
                                         null=True)  # Field name made lowercase.
    stockkeepingmargin = models.FloatField(db_column='StockkeepingMargin', blank=True,
                                           null=True)  # Field name made lowercase.
    shippingcosts = models.FloatField(db_column='ShippingCosts', blank=True, null=True)  # Field name made lowercase.
    handling = models.FloatField(db_column='Handling', blank=True, null=True)  # Field name made lowercase.
    netcalculationprice = models.FloatField(db_column='NetCalculationPrice', blank=True,
                                            null=True)  # Field name made lowercase.
    customstariffid = models.CharField(db_column='CustomsTariffID', max_length=15,
                                       blank=True)  # Field name made lowercase.
    rupercu = models.FloatField(db_column='RUPerCU', blank=True, null=True)  # Field name made lowercase.
    producttype = models.CharField(db_column='ProductType', max_length=3, blank=True)  # Field name made lowercase.
    stockkeeper = models.CharField(db_column='Stockkeeper', max_length=15, blank=True)  # Field name made lowercase.
    buyer = models.CharField(db_column='Buyer', max_length=15, blank=True)  # Field name made lowercase.
    stockplace = models.CharField(db_column='StockPlace', max_length=15, blank=True)  # Field name made lowercase.
    stockmin = models.FloatField(db_column='StockMin', blank=True, null=True)  # Field name made lowercase.
    stockmax = models.FloatField(db_column='StockMax', blank=True, null=True)  # Field name made lowercase.
    stockcur = models.FloatField(db_column='StockCur', blank=True, null=True)  # Field name made lowercase.
    stockavail = models.FloatField(db_column='StockAvail', blank=True, null=True)  # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True)  # Field name made lowercase.
    volume = models.FloatField(db_column='Volume', blank=True, null=True)  # Field name made lowercase.
    barcode = models.CharField(db_column='BarCode', max_length=20, blank=True)  # Field name made lowercase.
    salesmargin = models.FloatField(db_column='SalesMargin', blank=True, null=True)  # Field name made lowercase.
    salesprice = models.FloatField(db_column='SalesPrice', blank=True, null=True)  # Field name made lowercase.
    salespricepredefined = models.NullBooleanField(db_column='SalesPricePredefined')  # Field name made lowercase.
    discounttype = models.SmallIntegerField(db_column='DiscountType', blank=True,
                                            null=True)  # Field name made lowercase.
    discountrate1 = models.FloatField(db_column='DiscountRate1', blank=True, null=True)  # Field name made lowercase.
    discountquantity2 = models.FloatField(db_column='DiscountQuantity2', blank=True,
                                          null=True)  # Field name made lowercase.
    discountrate2 = models.FloatField(db_column='DiscountRate2', blank=True, null=True)  # Field name made lowercase.
    discountquantity3 = models.FloatField(db_column='DiscountQuantity3', blank=True,
                                          null=True)  # Field name made lowercase.
    discountrate3 = models.FloatField(db_column='DiscountRate3', blank=True, null=True)  # Field name made lowercase.
    discountquantity4 = models.FloatField(db_column='DiscountQuantity4', blank=True,
                                          null=True)  # Field name made lowercase.
    discountrate4 = models.FloatField(db_column='DiscountRate4', blank=True, null=True)  # Field name made lowercase.
    discountquantity5 = models.FloatField(db_column='DiscountQuantity5', blank=True,
                                          null=True)  # Field name made lowercase.
    discountrate5 = models.FloatField(db_column='DiscountRate5', blank=True, null=True)  # Field name made lowercase.
    usespecialsalesprice = models.NullBooleanField(db_column='UseSpecialSalesPrice')  # Field name made lowercase.
    specialsalesprice = models.FloatField(db_column='SpecialSalesPrice', blank=True,
                                          null=True)  # Field name made lowercase.
    usespecialsalesdiscount = models.NullBooleanField(db_column='UseSpecialSalesDiscount')  # Field name made lowercase.
    specialsalesdiscount = models.FloatField(db_column='SpecialSalesDiscount', blank=True,
                                             null=True)  # Field name made lowercase.
    # memo = models.TextField(db_column='Memo', blank=True) # Field name made lowercase.
    taxcodeinvoice = models.CharField(db_column='TaxCodeInvoice', max_length=6,
                                      blank=True)  # Field name made lowercase.
    projectquickselect = models.NullBooleanField(db_column='ProjectQuickSelect')  # Field name made lowercase.
    taxcodecreditnote = models.CharField(db_column='TaxCodeCreditNote', max_length=6,
                                         blank=True)  # Field name made lowercase.
    shopprice = models.FloatField(db_column='ShopPrice', blank=True, null=True)  # Field name made lowercase.
    additionalcharges = models.FloatField(db_column='AdditionalCharges', blank=True,
                                          null=True)  # Field name made lowercase.
    expirationdate = models.DateTimeField(db_column='ExpirationDate', blank=True,
                                          null=True)  # Field name made lowercase.
    salespriceforquot = models.NullBooleanField(db_column='SalesPriceForQuot')  # Field name made lowercase.
    # resourcenatureid = models.CharField(db_column='ResourceNatureID', max_length=15, blank=True) # Field name made lowercase.
    resourcenatureid = models.ForeignKey(Nature, db_column='ResourceNatureID', blank=True, null=True,
                                         related_name='products')  # Field name made lowercase.
    macropriceimportcomponents = models.NullBooleanField(
        db_column='MacroPriceImportComponents')  # Field name made lowercase.
    keywords = models.CharField(db_column='Keywords', max_length=255, blank=True)  # Field name made lowercase.
    piecesstockmode = models.NullBooleanField(db_column='PiecesStockMode')  # Field name made lowercase.
    piecesstocktype = models.SmallIntegerField(db_column='PiecesStockType', blank=True,
                                               null=True)  # Field name made lowercase.
    piecesstockfactor = models.FloatField(db_column='PiecesStockFactor', blank=True,
                                          null=True)  # Field name made lowercase.
    takefromstock = models.NullBooleanField(db_column='TakeFromStock')  # Field name made lowercase.
    salespriceforproj = models.NullBooleanField(db_column='SalesPriceForProj')  # Field name made lowercase.
    salespricetype = models.SmallIntegerField(db_column='SalesPriceType', blank=True,
                                              null=True)  # Field name made lowercase.
    manufacturerid = models.CharField(db_column='ManufacturerID', max_length=25,
                                      blank=True)  # Field name made lowercase.
    manufacturerdescription = models.CharField(db_column='ManufacturerDescription', max_length=60,
                                               blank=True)  # Field name made lowercase.
    salesmarginmin = models.FloatField(db_column='SalesMarginMin', blank=True, null=True)  # Field name made lowercase.
    residualvalue = models.FloatField(db_column='ResidualValue', blank=True, null=True)  # Field name made lowercase.
    rentalresourceid = models.CharField(db_column='RentalResourceID', max_length=15,
                                        blank=True)  # Field name made lowercase.
    residualvalueexternal = models.FloatField(db_column='ResidualValueExternal', blank=True,
                                              null=True)  # Field name made lowercase.
    active = models.NullBooleanField(db_column='Active')  # Field name made lowercase.
    manufacturer = models.CharField(db_column='Manufacturer', max_length=25, blank=True)  # Field name made lowercase.
    # wenn man im serializer ein feld hinzufügt, dann muss das auch hier im Model vorhanden sein, man kann ein Feld aus der Datenbank dazu ein zweites mal verwenden.
    nature = models.ForeignKey(Nature, db_column='ResourceNatureID', blank=True,
                               null=True)  # Field name made lowercase.
    defaultsupplier = models.ForeignKey(Supplier, db_column='DefaultSupplier', blank=True, null=True)

    def __unicode__(self):
        return self.id

    class Meta:
        managed = False
        db_table = 'Product'
        app_label = 'hit_01_masterdata'


class Stock(models.Model):
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=40, blank=True)  # Field name made lowercase.
    stockkeeper = models.CharField(db_column='Stockkeeper', max_length=15, blank=True)  # Field name made lowercase.
    type = models.SmallIntegerField(db_column='Type', blank=True, null=True)  # Field name made lowercase.
    defaultlocationid = models.CharField(db_column='defaultLocationID', max_length=15,
                                         blank=True)  # Field name made lowercase.
    tstamp = models.TextField(db_column='TStamp')  # Field name made lowercase. This field type is a guess.

    def __unicode__(self):
        return self.id

    class Meta:
        managed = False
        db_table = 'Stock'
        app_label = 'hit_01_masterdata'


class StockData(models.Model):
    id = models.IntegerField(db_column='RowID')
    rowid = models.IntegerField(db_column='RowID', primary_key=True)  # Field name made lowercase.
    stockid = models.ForeignKey(Stock, db_column='StockID', blank=True, null=True)  # Field name made lowercase.
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True)  # Field name made lowercase.
    quantitymin = models.FloatField(db_column='QuantityMin', blank=True, null=True)  # Field name made lowercase.
    quantitymax = models.FloatField(db_column='QuantityMax', blank=True, null=True)  # Field name made lowercase.
    quantitycur = models.FloatField(db_column='QuantityCur', blank=True, null=True)  # Field name made lowercase.
    quantityavail = models.FloatField(db_column='QuantityAvail', blank=True, null=True)  # Field name made lowercase.
    consumption01 = models.FloatField(db_column='Consumption01', blank=True, null=True)  # Field name made lowercase.
    consumption02 = models.FloatField(db_column='Consumption02', blank=True, null=True)  # Field name made lowercase.
    consumption03 = models.FloatField(db_column='Consumption03', blank=True, null=True)  # Field name made lowercase.
    consumption04 = models.FloatField(db_column='Consumption04', blank=True, null=True)  # Field name made lowercase.
    consumption05 = models.FloatField(db_column='Consumption05', blank=True, null=True)  # Field name made lowercase.
    consumption06 = models.FloatField(db_column='Consumption06', blank=True, null=True)  # Field name made lowercase.
    consumption07 = models.FloatField(db_column='Consumption07', blank=True, null=True)  # Field name made lowercase.
    consumption08 = models.FloatField(db_column='Consumption08', blank=True, null=True)  # Field name made lowercase.
    consumption09 = models.FloatField(db_column='Consumption09', blank=True, null=True)  # Field name made lowercase.
    consumption10 = models.FloatField(db_column='Consumption10', blank=True, null=True)  # Field name made lowercase.
    consumption11 = models.FloatField(db_column='Consumption11', blank=True, null=True)  # Field name made lowercase.
    consumption12 = models.FloatField(db_column='Consumption12', blank=True, null=True)  # Field name made lowercase.
    location = models.CharField(db_column='Location', max_length=15, blank=True)  # Field name made lowercase.

    # tstamp = models.TextField(db_column='TStamp') # Field name made lowercase. This field type is a guess.
    def __unicode__(self):
        return str(self.id)

    class Meta:
        managed = False
        db_table = 'StockData'
        app_label = 'hit_01_masterdata'


class Stocklocation(models.Model):
    class Meta:
        managed = False
        db_table = 'StockLocation'
        app_label = 'hit_01_masterdata'

    stockid = models.ForeignKey(Stock, db_column='StockID', blank=True, null=True)
    id = models.TextField(db_column='ID', primary_key=True)
    description = models.TextField(db_column='Description', blank=True, null=True)


class StockMovement(models.Model):
    class Meta:
        managed = False
        db_table = 'StockMovement'
        app_label = 'hit_01_masterdata'

    movementid = models.IntegerField(db_column='MovementID', primary_key=True)
    datecreation = models.DateTimeField(db_column='DateCreation', blank=True, null=True)
    datemodification = models.DateTimeField(db_column='DateModification', blank=True, null=True)
    stockid = models.ForeignKey(Stock, db_column='StockID', blank=True, null=True)
    locationid = models.ForeignKey(Stocklocation, db_column='LocationID', blank=True, null=True)
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True)
    quantitydelta = models.FloatField(db_column='QuantityDelta', blank=True, null=True)
    moduleid = models.IntegerField(db_column='ModuleID', blank=True, null=True)
    modulerecordtypeid = models.IntegerField(db_column='ModuleRecordTypeID', blank=True, null=True)
    # If modulerecordtypeid is '6000' key1 maps to DeliveryNote, '6010': key1=PurchaseDoc, '4010': manual entry
    key1 = models.TextField(db_column='Key1', blank=True, null=True)
    key2 = models.TextField(db_column='Key2', blank=True, null=True)
    key3 = models.TextField(db_column='Key3', blank=True, null=True)
    userid = models.TextField(db_column='UserID', blank=True, null=True)
    comment = models.TextField(db_column='Comment', blank=True, null=True)
    rsvmoduleid = models.IntegerField(db_column='RsvModuleID', blank=True, null=True)
    rsvmodulerecordtypeid = models.IntegerField(db_column='RsvModuleRecordTypeID', blank=True, null=True)
    rsvkey1 = models.TextField(db_column='RsvKey1', blank=True, null=True)
    rsvkey2 = models.TextField(db_column='RsvKey2', blank=True, null=True)
    rsvkey3 = models.TextField(db_column='RsvKey3', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.movementid:
            self.movementid = StockMovement.objects.all().order_by('-movementid')[0].movementid + 1
        super(StockMovement, self).save(*args, **kwargs)


class ProductPacking(models.Model):
    rowid = models.IntegerField(db_column='RowID', primary_key=True)
    packingid = models.CharField(db_column='PackingID', max_length=10, blank=True, null=True)
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True, related_name='packing')
    name = models.CharField(db_column='Name', max_length=40, blank=True, null=True)
    quantity = models.FloatField(db_column='Quantity', blank=True, null=True)

    def __unicode__(self):
        return str(self.rowid)

    class Meta:
        managed = False
        db_table = 'ProductPacking'
        app_label = 'hit_01_masterdata'


class PurchaseDocBase(models.Model):
    class Meta:
        # https://docs.djangoproject.com/es/1.9/topics/db/models/#meta-inheritance
        abstract = True
        managed = False
        db_table = 'PurchaseDoc'

    id = models.CharField(db_column='ID', max_length=15, primary_key=True)  # Field name made lowercase.
    concerns = models.CharField(db_column='Concerns', max_length=60, blank=True)
    remark = models.CharField(db_column='Remark', max_length=50, blank=True)
    subject = models.CharField(db_column='Subject', max_length=255, blank=True)
    leader = models.CharField(db_column='ContactOnSiteID', max_length=15, blank=True)
    responsible = models.CharField(db_column='Responsible', max_length=15, blank=True, null=True)
    doctype = models.SmallIntegerField(db_column='DocType', blank=True, null=True)
    module = models.SmallIntegerField(db_column='Module', blank=True, null=True)
    modulerefid= models.CharField(db_column='ModuleRefID', max_length=15, blank=True)
    status = models.SmallIntegerField(db_column='Status', blank=True, null=True)
    docdate = models.DateTimeField(db_column='DocDate', blank=True, null=True)
    stockid = models.CharField(db_column='StockID', blank=True, max_length=15)
    def save(self, *args, **kwargs):
        """http://stackoverflow.com/questions/4616787/django-making-a-custom-pk-auto-increment"""
        if not self.id:
            self.id = str(int(self.__class__.objects.all().order_by('-id')[0].id) + 1)
        # super(self.__class__, self).save(*args, **kwargs)
        # #stopped working after making class abstract (recursion), should never use self.__class__ for this!
        super(PurchaseDocBase, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.id


class PurchaseDocDataBase(models.Model):
    class Meta:
        abstract = True
        managed = False

    rowid = models.IntegerField(db_column='RowID', primary_key=True)
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True)
    name = models.CharField(db_column='Name', max_length=255, blank=True, null=True)
    unit = models.CharField(db_column='Unit', max_length=5, blank=True, null=True)
    quantity = models.FloatField(db_column='Quantity', blank=True, null=True)
    price = models.FloatField(db_column='Price', blank=True, null=True)
    netprice = models.FloatField(db_column='NetPrice', default=0)
    amount = models.FloatField(db_column='Amount', blank=True, null=True)
    packing = models.CharField(db_column='Packing', max_length=255, blank=True)
    # unused default fields
    linetype = models.SmallIntegerField(db_column='LineType', blank=True, null=True, default=0)
    projectid = models.CharField(db_column='ProjectID', max_length=15, blank=True)
    posid = models.CharField(db_column='PosID', max_length=15, blank=True)
    weight = models.FloatField(db_column='Weight', default=0)
    volume = models.FloatField(db_column='Volume', default=0)
    comment = models.CharField(db_column='Comment', max_length=255, default='', blank=True)
    calclineexpression = models.CharField(db_column='CalcLineExpression', max_length=60, default='')
    discount = models.FloatField(db_column='Discount', default=1)
    discountcalclineexpression = models.CharField(db_column='DiscountCalcLineExpression', max_length=60, default='')
    budgetprice = models.FloatField(db_column='BudgetPrice', default=0)
    budgetamount = models.FloatField(db_column='BudgetAmount', default=0)
    taxcode = models.CharField(db_column='TaxCode', max_length=6, blank=True)
    resourcememo = models.TextField(db_column='ResourceMemo', blank=True)

    def save(self, *args, **kwargs):
        self.netprice = self.price
        if not self.rowid:
            self.rowid = self.__class__.objects.all().order_by('-rowid')[0].rowid + 1
        super(PurchaseDocDataBase, self).save(*args, **kwargs)

    def __unicode__(self):
        return str(self.rowid)


class ProductSupplier(models.Model):
    rowid = models.IntegerField(db_column='RowID', primary_key=True)
    prodid = models.ForeignKey(Product, db_column='ProdID', blank=True, null=True, related_name='supplier')
    supplierid = models.ForeignKey(Supplier, db_column='SupplierID', blank=True, null=True)
    purchaseprice = models.FloatField(db_column='PurchasePrice', blank=True, null=True)
    comment = models.CharField(db_column='Brand', max_length=35, blank=True,
                               null=True)  # renamed, because it is being used as a comment field
    unit = models.CharField(db_column='Unit', max_length=5, blank=True, null=True)
    id = models.CharField(db_column='ID', max_length=25, blank=True, null=True)

    def __unicode__(self):
        return str(self.rowid)

    class Meta:
        managed = False
        db_table = 'ProductSupplier'
        app_label = 'hit_01_masterdata'


from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings


# This code is triggered whenever a new user has been created and saved to the database
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class Company(models.Model):
    class Meta:
        managed = False
        db_table = 'Company'
        app_label = 'hit'
    id = models.CharField(db_column='ID', max_length=15, primary_key=True)
    namea = models.CharField(db_column='NameA', max_length=30, blank=True)
    address = models.CharField(db_column='Address', max_length=255, blank=True)
    country = models.CharField(db_column='Country', max_length=3, blank=True)
    city = models.CharField(db_column='City', max_length=30, blank=True)

class UserData(models.Model):
    user = models.OneToOneField(User, db_column='userid', primary_key=True)
    prodid = models.CharField(db_column='ProdID', max_length=15, null=True)
    companyid = models.CharField(db_column='CompanyID', max_length=2, null=True)
    #companyid = models.ForeignKey(Company, db_column='CompanyID', blank=True, null=True)


class PurchaseDocuments(models.Model):
    # extends legacy database table PurchaseDoc
    purchasedocid = models.CharField(max_length=15, primary_key=True)
    pdf = models.CharField(max_length=128, blank=True, null=True)
    doc = models.CharField(max_length=128, blank=True, null=True)
    odt = models.CharField(max_length=128, blank=True, null=True)
