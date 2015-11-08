from django.views.generic.base import TemplateView

class BasePageView(TemplateView):

    template_name = "base.html"

    def get_context_data(self, **kwargs):
        context = super(BasePageView, self).get_context_data(**kwargs)
        return context
