from django.conf.urls import url, include
from masterdata import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet, base_name='product')
router.register(r'productsupplier', views.ProductSupplierViewSet, base_name='productsupplier')
# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/productall/', views.CompleteProductView.as_view(), name='productALL')
]
