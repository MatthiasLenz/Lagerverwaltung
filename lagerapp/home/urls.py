from django.conf.urls import url

from views import BasePageView

#catch all url pattern
urlpatterns = [
    url(r'^[0-9a-z]*_state$', BasePageView.as_view(), name='base'),
    url(r'^/?$', BasePageView.as_view(), name='base'),
]