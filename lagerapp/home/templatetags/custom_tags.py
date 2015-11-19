from django import template
from django.core.urlresolvers import NoReverseMatch, reverse
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

register = template.Library()


class CustomTag(template.Node):
    def render(self, context):
        context['custom_tag_context'] = "this is my custom tag, yeah"
        return ''


@register.tag(name='custom_tag')
def get_custom_tag(parser, token):
    return CustomTag()


@register.simple_tag
def optional_logout(request, user):
    """
    Include a logout snippet if REST framework's logout view is in the URLconf.
    """
    try:
        logout_url = reverse('rest_framework:logout')
    except NoReverseMatch:
        return '<li class="navbar-text">{user}</li>'.format(user=user)
    snippet = """
      <div class="btn-group" uib-dropdown is-open="status.isopen">
      <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle ng-disabled="disabled">
        {user} <span class="caret"></span>
      </button>
      <ul class="uib-dropdown-menu" aria-labelledby="single-button">
           <li><a href='{href}?next={next}'>Log out</a></li>
      </ul>
      </div>"""
    snippet = format_html(snippet, user=escape(user), href=logout_url, next=escape(request.path))

    return mark_safe(snippet)


@register.simple_tag
def optional_login(request):
    """
    Include a login snippet if REST framework's login view is in the URLconf.
    """
    try:
        login_url = reverse('rest_framework:login')
    except NoReverseMatch:
        return ''

    snippet = """<button type="button" class="btn btn-default"><a href='{href}?next={next}'>Log in</a></button>"""
    snippet = format_html(snippet, href=login_url, next=escape(request.path))

    return mark_safe(snippet)
