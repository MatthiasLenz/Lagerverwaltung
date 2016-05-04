#encoding=UTF-8
from basemodels import SupplierBase, PurchaseDocBase, PurchaseDocDataBase, DeliveryNoteBase, DeliveryNoteDataBase, \
    StaffBase, ProjectBase
from django.db import models

class Staff01(StaffBase):
    class Meta(StaffBase.Meta):
        db_table = 'Staff'
        app_label = 'hit_01_staff'


class Staff04(StaffBase):
    class Meta(StaffBase.Meta):
        db_table = 'Staff'
        app_label = 'hit_04_staff'


class Staff05(StaffBase):
    class Meta(StaffBase.Meta):
        db_table = 'Staff'
        app_label = 'hit_05_staff'

class Project01(ProjectBase):
    class Meta(ProjectBase.Meta):
        db_table = 'Project'
        app_label = 'hit_01_project'
    manager = models.ForeignKey(Staff01, db_column='Manager',  max_length=15, blank=True)
    managerid = models.CharField(db_column='Manager')
    leader = models.ForeignKey(Staff01, db_column='Leader', blank=True, null=True)
    leaderid = models.CharField(db_column='Leader', max_length=15, blank=True)

class Project04(ProjectBase):
    class Meta(ProjectBase.Meta):
        db_table = 'Project'
        app_label = 'hit_04_project'
    manager = models.ForeignKey(Staff04, db_column='Manager', max_length=15, blank=True)
    managerid = models.CharField(db_column='Manager')
    leader = models.ForeignKey(Staff04, db_column='Leader', blank=True, null=True)
    leaderid = models.CharField(db_column='Leader', max_length=15, blank=True)

class Project05(ProjectBase):
    class Meta(ProjectBase.Meta):
        db_table = 'Project'
        app_label = 'hit_05_project'
    manager = models.ForeignKey(Staff05, db_column='Manager',  max_length=15, blank=True)
    managerid = models.CharField(db_column='Manager')
    leader = models.ForeignKey(Staff05, db_column='Leader', blank=True, null=True)
    leaderid = models.CharField(db_column='Leader', max_length=15, blank=True)

class Supplier01(SupplierBase):
    class Meta(SupplierBase.Meta):
        db_table = 'Supplier'
        app_label = 'hit_01_bookkeeping'


class Supplier04(SupplierBase):
    class Meta(SupplierBase.Meta):
        db_table = 'Supplier'
        app_label = 'hit_04_bookkeeping'


class Supplier05(SupplierBase):
    class Meta(SupplierBase.Meta):
        db_table = 'Supplier'
        app_label = 'hit_05_bookkeeping'


class PurchaseDoc01(PurchaseDocBase):
    class Meta(PurchaseDocBase.Meta):
        app_label = 'hit_01_purchase'

    supplierid = models.ForeignKey(Supplier01, db_column='SupplierID')  # app fails if this is empty


class PurchaseDoc04(PurchaseDocBase):
    class Meta(PurchaseDocBase.Meta):
        app_label = 'hit_04_purchase'

    supplierid = models.ForeignKey(Supplier04, db_column='SupplierID')  # app fails if this is empty


class PurchaseDoc05(PurchaseDocBase):
    class Meta(PurchaseDocBase.Meta):
        app_label = 'hit_05_purchase'

    supplierid = models.ForeignKey(Supplier05, db_column='SupplierID')  # app fails if this is empty


class PurchaseDocData01(PurchaseDocDataBase):
    class Meta(PurchaseDocDataBase.Meta):
        app_label = 'hit_01_purchase'
        db_table = 'PurchaseDocData'

    purchasedocid = models.ForeignKey(PurchaseDoc01, db_column='PurchaseDocID', blank=True, null=True,
                                      related_name='data')


class PurchaseDocData04(PurchaseDocDataBase):
    class Meta(PurchaseDocDataBase.Meta):
        app_label = 'hit_04_purchase'
        db_table = 'PurchaseDocData'

    purchasedocid = models.ForeignKey(PurchaseDoc04, db_column='PurchaseDocID', blank=True, null=True,
                                      related_name='data')

class PurchaseDocData05(PurchaseDocDataBase):
    class Meta(PurchaseDocDataBase.Meta):
        app_label = 'hit_05_purchase'
        db_table = 'PurchaseDocData'
    purchasedocid = models.ForeignKey(PurchaseDoc05, db_column='PurchaseDocID', blank=True, null=True,
                                      related_name='data')


class DeliveryNote01(DeliveryNoteBase):
    class Meta(DeliveryNoteBase.Meta):
        app_label = 'hit_01_purchase'
        db_table = 'DeliveryNote'

    orderid = models.ForeignKey(PurchaseDoc01, db_column='OrderID', blank=True, null=True, related_name='deliverynotes')
    supplierid = models.ForeignKey(Supplier01, db_column='SupplierID', blank=True, null=True)


class DeliveryNote04(DeliveryNoteBase):
    class Meta(DeliveryNoteBase.Meta):
        app_label = 'hit_04_purchase'
        db_table = 'DeliveryNote'

    orderid = models.ForeignKey(PurchaseDoc04, db_column='OrderID', blank=True, null=True, related_name='deliverynotes')
    supplierid = models.ForeignKey(Supplier04, db_column='SupplierID', blank=True, null=True)


class DeliveryNote05(DeliveryNoteBase):
    class Meta(DeliveryNoteBase.Meta):
        app_label = 'hit_05_purchase'
        db_table = 'DeliveryNote'

    orderid = models.ForeignKey(PurchaseDoc05, db_column='OrderID', blank=True, null=True, related_name='deliverynotes')
    supplierid = models.ForeignKey(Supplier05, db_column='SupplierID', blank=True, null=True)


class DeliveryNoteData01(DeliveryNoteDataBase):
    class Meta(DeliveryNoteDataBase.Meta):
        app_label = 'hit_01_purchase'
        db_table = 'DeliveryNoteData'

    deliverynoteid = models.ForeignKey(DeliveryNote01, db_column='DeliveryNoteID', blank=True, null=True,
                                       related_name='data')


class DeliveryNoteData04(DeliveryNoteDataBase):
    class Meta(DeliveryNoteDataBase.Meta):
        app_label = 'hit_04_purchase'
        db_table = 'DeliveryNoteData'

    deliverynoteid = models.ForeignKey(DeliveryNote04, db_column='DeliveryNoteID', blank=True, null=True,
                                       related_name='data')


class DeliveryNoteData05(DeliveryNoteDataBase):
    class Meta(DeliveryNoteDataBase.Meta):
        app_label = 'hit_05_purchase'
        db_table = 'DeliveryNoteData'

    deliverynoteid = models.ForeignKey(DeliveryNote05, db_column='DeliveryNoteID', blank=True, null=True,
                                       related_name='data')
