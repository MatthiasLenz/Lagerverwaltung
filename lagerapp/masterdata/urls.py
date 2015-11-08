from django.conf.urls import url, include
from masterdata import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'stock', views.StockViewSet)
router.register(r'stockdata', views.StockDataViewSet)
router.register(r'nature', views.NatureViewSet)
router.register(r'product', views.ProductViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls))
]