from django.conf.urls import url, include
import views, views_c01, views_c04, views_c05
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter(trailing_slash=False)
router.register(r'supplier', views_c01.SupplierViewSet, base_name='supplier')
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'stockmovement', views.StockMovementViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet, base_name='product')
router.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router.register(r'purchasedocuments', views.PurchaseDocumentsView)
router.register(r'minpurchasedoc', views_c01.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router.register(r'purchasedoc', views_c01.PurchaseDocViewSet)
router.register(r'purchasedocdata', views_c01.PurchaseDocDataViewSet)
router.register(r'purchasedocsupplier', views_c01.PurchaseDocSupplierViewSet)
router.register(r'deliverynote', views_c01.DeliveryNoteViewSet)
router.register(r'deliverynotedata', views_c01.DeliveryNoteDataViewSet)

# router for company 01 api
router01 = DefaultRouter(trailing_slash=False)
router01.register(r'supplier', views_c01.SupplierViewSet, base_name='supplier01')
router01.register(r'minpurchasedoc', views_c01.MinPurchaseDocViewSet, base_name='minpurchasedoc')
router01.register(r'purchasedoc', views_c01.PurchaseDocViewSet)
router01.register(r'internalpurchasedoc', views_c01.InternalPurchaseDocViewSet)
router01.register(r'purchasedocdata', views_c01.PurchaseDocDataViewSet)
router01.register(r'purchasedocsupplier', views_c01.PurchaseDocSupplierViewSet)
router01.register(r'deliverynote', views_c01.DeliveryNoteViewSet)
router01.register(r'deliverynotedata', views_c01.DeliveryNoteDataViewSet)
router01.register(r'projects', views_c01.ProjectViewSet)
# router for company 04 api
router04 = DefaultRouter(trailing_slash=False)
router04.register(r'supplier', views_c04.SupplierViewSet, base_name='supplier04')
router04.register(r'purchasedoc', views_c04.PurchaseDocViewSet)
router04.register(r'purchasedocdata', views_c04.PurchaseDocDataViewSet)
router04.register(r'purchasedocsupplier', views_c04.PurchaseDocSupplierViewSet)
router04.register(r'deliverynote', views_c04.DeliveryNoteViewSet)
router04.register(r'deliverynotedata', views_c04.DeliveryNoteDataViewSet)
router04.register(r'projects', views_c04.ProjectViewSet)
# router for company 05 api
router05 = DefaultRouter(trailing_slash=False)
router05.register(r'supplier', views_c05.SupplierViewSet, base_name='supplier05')
router05.register(r'purchasedoc', views_c05.PurchaseDocViewSet)
router05.register(r'purchasedocdata', views_c05.PurchaseDocDataViewSet)
router05.register(r'purchasedocsupplier', views_c05.PurchaseDocSupplierViewSet)
router05.register(r'deliverynote', views_c05.DeliveryNoteViewSet)
router05.register(r'deliverynotedata', views_c05.DeliveryNoteDataViewSet)
router05.register(r'projects', views_c05.ProjectViewSet)
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
    url(r'^api/01/makepdf', views_c01.makepdf, name='makepdf'),
    url(r'^api/01/lagerausgangmakepdf', views_c01.lagerausgangmakepdf, name='lagerausgangmakepdf'),
    url(r'^api/getpr', views.get_project_data, name='get_project'),
]