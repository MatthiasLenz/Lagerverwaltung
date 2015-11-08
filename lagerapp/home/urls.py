from django.conf.urls import url

from home.views import BasePageView

urlpatterns = [
    url(r'^$', BasePageView.as_view(), name='base'),
]