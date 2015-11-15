from django.conf.urls import url

from home.views import BasePageView

#catch all url pattern
urlpatterns = [
    url(r'^$', BasePageView.as_view(), name='base'),
]