from django.conf.urls import url, include
from django.contrib import admin
from rest_framework.authtoken import views
admin.autodiscover()

from django.conf import settings
from django.conf.urls import include, url

urlpatterns = [
    url(r'^', include('masterdata.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/api-token-auth/', views.obtain_auth_token),
]
