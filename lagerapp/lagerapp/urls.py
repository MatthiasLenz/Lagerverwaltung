from django.conf.urls import url, include
from django.contrib import admin
from rest_framework.authtoken import views
admin.autodiscover()

from django.conf import settings
from django.conf.urls import include, patterns, url

urlpatterns = [
    url(r'^', include('masterdata.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^', include('home.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/api-token-auth/', views.obtain_auth_token),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )