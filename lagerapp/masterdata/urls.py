from django.conf.urls import url, include
from masterdata import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'supplier', views.SupplierViewSet, base_name='supplier')
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet, base_name='product')
router.register(r'productpacking', views.ProductPackingViewSet, base_name='productpacking')
router.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
router.register(r'purchasedoc', views.PurchaseDocViewSet)
router.register(r'minpurchasedoc', views.MinPurchaseDocViewSet)
router.register(r'purchasedocdata', views.PurchaseDocDataViewSet)
# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/productall/', views.CompleteProductView.as_view(), name='productALL'),
    url(r'^api/users/$', views.UserList.as_view()),
    url(r'^api/users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
    url(r'^api/userdata/$', views.UserDataList.as_view()),
    url(r'^api/userdata/(?P<pk>[0-9]+)/$', views.UserDataDetail.as_view())
]

from rest_framework.authtoken import views

urlpatterns += [
    url(r'^api/api-token-auth/', views.obtain_auth_token)
]
