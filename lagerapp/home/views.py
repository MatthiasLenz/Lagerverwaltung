from django.views.generic.base import TemplateView

class HomePageView(TemplateView):

    template_name = "base.html"

    def get_context_data(self, **kwargs):
        context = super(HomePageView, self).get_context_data(**kwargs)
        return context

class ArtikelPageView(TemplateView):

    template_name = "ressourcen.html"

    def get_context_data(self, **kwargs):
        context = super(ArtikelPageView, self).get_context_data(**kwargs)
        return context
        
class LagerPageView(TemplateView):

    template_name = "lager.html"

    def get_context_data(self, **kwargs):
        context = super(LagerPageView, self).get_context_data(**kwargs)
        return context