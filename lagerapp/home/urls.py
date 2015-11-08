from django.conf.urls import url

from home.views import HomePageView, ArtikelPageView, LagerPageView

urlpatterns = [
    #url(r'^$', HomePageView.as_view(), name='home'),
    url(r'^artikel$', ArtikelPageView.as_view(), name='home'),
    url(r'^lager$', LagerPageView.as_view(), name='home'),
]