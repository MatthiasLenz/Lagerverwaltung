from django.conf.urls import url, include
import views, views_c01
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns
import models
# Create a router and register our viewsets with it.
router = DefaultRouter(trailing_slash=False)
router.register(r'installation', views.InstallationViewSet)
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'stockmovement', views.StockMovementViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet, base_name='product')
router.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router.register(r'purchasedocuments', views.PurchaseDocumentsView)
router.register(r'lagerausgang', views.LagerausgangView)
# router for company 01 api
router01 = DefaultRouter(trailing_slash=False)
router01.register(r'supplier', views.getSupplierViewSet(models.Supplier01), base_name='supplier01')
router01.register(r'internalpurchasedoc', views.getInternalPurchaseDocViewSet(
    models.PurchaseDoc01, models.PurchaseDocData01, models.DeliveryNote01, models.DeliveryNoteData01), base_name='internalpurchasedoc')
router01.register(r'purchasedoc', views.getPurchaseDocViewSet(models.PurchaseDoc01,models.PurchaseDocData01,
    models.DeliveryNote01, models.DeliveryNoteData01))
router01.register(r'purchasedocdata', views.getPurchaseDocDataViewSet(models.PurchaseDocData01))
router01.register(r'purchasedocsupplier', views.getPurchaseDocSupplierViewSet(models.PurchaseDoc01, models.Supplier01))
router01.register(r'deliverynote', views.getDeliveryNoteViewSet(models.DeliveryNote01,models.DeliveryNoteData01))
router01.register(r'deliverynotedata', views.getDeliveryNoteDataViewSet(models.DeliveryNoteData01))
router01.register(r'projects', views.getProjectViewSet(models.Project01, models.Staff01))
router01.register(r'staff', views.getStaffViewSet(models.Staff01))
# router for company 04 api
router04 = DefaultRouter(trailing_slash=False)
router04.register(r'supplier', views.getSupplierViewSet(models.Supplier04), base_name='supplier04')
router04.register(r'internalpurchasedoc', views.getInternalPurchaseDocViewSet(
    models.PurchaseDoc04, models.PurchaseDocData04, models.DeliveryNote04, models.DeliveryNoteData04), base_name='internalpurchasedoc')
router04.register(r'purchasedoc', views.getPurchaseDocViewSet(models.PurchaseDoc04,models.PurchaseDocData04,
    models.DeliveryNote04, models.DeliveryNoteData04))
router04.register(r'purchasedocdata', views.getPurchaseDocDataViewSet(models.PurchaseDocData04))
router04.register(r'purchasedocsupplier', views.getPurchaseDocSupplierViewSet(models.PurchaseDoc04, models.Supplier04))
router04.register(r'deliverynote', views.getDeliveryNoteViewSet(models.DeliveryNote04,models.DeliveryNoteData04))
router04.register(r'deliverynotedata', views.getDeliveryNoteDataViewSet(models.DeliveryNoteData04))
router04.register(r'projects', views.getProjectViewSet(models.Project04, models.Staff04))
router04.register(r'staff', views.getStaffViewSet(models.Staff04))
# router for company 05 api
router05 = DefaultRouter(trailing_slash=False)
router05.register(r'supplier', views.getSupplierViewSet(models.Supplier05), base_name='supplier05')
router05.register(r'internalpurchasedoc', views.getInternalPurchaseDocViewSet(
    models.PurchaseDoc05, models.PurchaseDocData05, models.DeliveryNote05, models.DeliveryNoteData05), base_name='internalpurchasedoc')
router05.register(r'purchasedoc', views.getPurchaseDocViewSet(models.PurchaseDoc05,models.PurchaseDocData05,
                                                              models.DeliveryNote05, models.DeliveryNoteData05))
router05.register(r'purchasedocdata', views.getPurchaseDocDataViewSet(models.PurchaseDocData05))
router05.register(r'purchasedocsupplier', views.getPurchaseDocSupplierViewSet(models.PurchaseDoc05, models.Supplier01))
router05.register(r'deliverynote', views.getDeliveryNoteViewSet(models.DeliveryNote05,models.DeliveryNoteData05))
router05.register(r'deliverynotedata', views.getDeliveryNoteDataViewSet(models.DeliveryNoteData05))
router05.register(r'projects', views.getProjectViewSet(models.Project05, models.Staff05))
router05.register(r'staff', views.getStaffViewSet(models.Staff05))
# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/01/', include(router01.urls)),
    url(r'^api/04/', include(router04.urls)),
    url(r'^api/05/', include(router05.urls))
]
urlpatterns += format_suffix_patterns([url(r'^api/productall/', views.CompleteProductView.as_view(), name='productALL'),
    url(r'^api/users/$', views.UserList.as_view()),
    url(r'^api/users/(?P<pk>[0-9]+)$', views.UserDetail.as_view()),
    url(r'^api/userdata/$', views.UserDataList.as_view()),
    url(r'^api/userdata/(?P<pk>[0-9]+)/$', views.UserDataDetail.as_view()),
    url(r'^api/01/makepdf$', views_c01.makepdf, name='makepdf'),
    url(r'^api/01/lagerausgangmakepdf$', views_c01.lagerausgangmakepdf, name='lagerausgangmakepdf', kwargs={'companyid':'01'}),
    url(r'^api/04/lagerausgangmakepdf$', views_c01.lagerausgangmakepdf, name='lagerausgangmakepdf', kwargs={'companyid':'04'}),
    url(r'^api/05/lagerausgangmakepdf$', views_c01.lagerausgangmakepdf, name='lagerausgangmakepdf', kwargs={'companyid':'05'}),
    url(r'^api/01/kleingeraetemakepdf$', views_c01.kleingeraetemakepdf, name='kleingeraetemakepdf', kwargs={'companyid':'01'}),
    url(r'^api/01/consumedproduct/(?P<id>[0-9A-Za-z-]+)$', views.get_project_data, name='project-detail', kwargs={'company':'01'}),
    url(r'^api/04/consumedproduct/(?P<id>[0-9A-Za-z-]+)$', views.get_project_data, name='project-detail', kwargs={'company':'04'}),
    url(r'^api/05/consumedproduct/(?P<id>[0-9A-Za-z-]+)$', views.get_project_data, name='project-detail', kwargs={'company': '05'}),
    url(r'^api/whoami$', views.whoami, name='whoami'),
    url(r'^api/companylogo$', views.companylogo, name='companylogo'),
    url(r'^api/getconfig$', views.getconfig, name='getconfig'),
    url(r'^api/sendmail/?$', views.sendmail, name='sendmail'),
    url(r'^api/01/rental/(?P<id>[0-9A-Za-z-]+)$', views.rental, name='rental-detail', kwargs={'company':'01'}),
    ])