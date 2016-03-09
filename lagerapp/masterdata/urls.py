from django.conf.urls import url, include
from masterdata import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter(trailing_slash=False)
router.register(r'supplier', views.SupplierViewSet, base_name='supplier')
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet, base_name='product')
router.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router.register(r'minpurchasedoc', views.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router.register(r'purchasedoc', views.PurchaseDocViewSet)
router.register(r'purchasedocdata', views.PurchaseDocDataViewSet)
router.register(r'purchasedocsupplier', views.PurchaseDocSupplierViewSet)
router.register(r'deliverynote', views.DeliveryNoteViewSet)
router.register(r'deliverynotedata', views.DeliveryNoteDataViewSet)
router.register(r'purchasedocuments', views.PurchaseDocumentsView)
# router for company 01 api
router01 = DefaultRouter(trailing_slash=False)
router01.register(r'supplier', views.SupplierViewSet, base_name='supplier')
router01.register(r'stock', views.StockViewSet)
router01.register(r'stockdata', views.StockDataViewSet)
router01.register(r'nature', views.NatureViewSet)
router01.register(r'product', views.ProductViewSet, base_name='product')
router01.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router01.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router01.register(r'minpurchasedoc', views.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router01.register(r'purchasedoc', views.PurchaseDocViewSet)
router01.register(r'purchasedocdata', views.PurchaseDocDataViewSet)
router01.register(r'purchasedocsupplier', views.PurchaseDocSupplierViewSet)
router01.register(r'deliverynote', views.DeliveryNoteViewSet)
router01.register(r'deliverynotedata', views.DeliveryNoteDataViewSet)
router01.register(r'purchasedocuments', views.PurchaseDocumentsView)
# router for company 04 api
router04 = DefaultRouter(trailing_slash=False)
router04.register(r'supplier', views.SupplierViewSet, base_name='supplier')
router04.register(r'stock', views.StockViewSet)
router04.register(r'stockdata', views.StockDataViewSet)
router04.register(r'nature', views.NatureViewSet)
router04.register(r'product', views.ProductViewSet, base_name='product')
router04.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router04.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router04.register(r'minpurchasedoc', views.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router04.register(r'purchasedoc', views.PurchaseDocViewSet)
router04.register(r'purchasedocdata', views.PurchaseDocDataViewSet)
router04.register(r'purchasedocsupplier', views.PurchaseDocSupplierViewSet)
router04.register(r'deliverynote', views.DeliveryNoteViewSet)
router04.register(r'deliverynotedata', views.DeliveryNoteDataViewSet)
router04.register(r'purchasedocuments', views.PurchaseDocumentsView)
# router for company 05 api
from masterdata import views_c05

router05 = DefaultRouter(trailing_slash=False)
router05.register(r'supplier', views.SupplierViewSet, base_name='supplier')
router05.register(r'stock', views.StockViewSet)
router05.register(r'stockdata', views_c05.StockDataViewSet)
router05.register(r'nature', views.NatureViewSet)
router05.register(r'product', views.ProductViewSet, base_name='product')
router05.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router05.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router05.register(r'minpurchasedoc', views.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router05.register(r'purchasedoc', views_c05.PurchaseDocViewSet)
router05.register(r'purchasedocdata', views.PurchaseDocDataViewSet)
router05.register(r'purchasedocsupplier', views.PurchaseDocSupplierViewSet)
router05.register(r'deliverynote', views.DeliveryNoteViewSet)
router05.register(r'deliverynotedata', views.DeliveryNoteDataViewSet)
router05.register(r'purchasedocuments', views.PurchaseDocumentsView)
# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/01/', include(router01.urls)),
    url(r'^api/04/', include(router04.urls)),
    url(r'^api/05/', include(router05.urls)),
    url(r'^api/productall/', views.CompleteProductView.as_view(), name='productALL'),
    url(r'^api/users/$', views.UserList.as_view()),
    url(r'^api/users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
    url(r'^api/userdata/$', views.UserDataList.as_view()),
    url(r'^api/userdata/(?P<pk>[0-9]+)/$', views.UserDataDetail.as_view()),
    url(r'^api/makepdf', views.makepdf, name='makepdf')
]