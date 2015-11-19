from django.conf.urls import url, include
from django.contrib import admin

admin.autodiscover()

urlpatterns = [
    url(r'^', include('masterdata.urls')), 
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include('home.urls')),
    url(r'^admin/', include(admin.site.urls)),
]