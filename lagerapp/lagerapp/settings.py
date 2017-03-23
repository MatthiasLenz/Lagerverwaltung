"""
Django settings for lagerapp project.

Generated by 'django-admin startproject' using Django 1.8.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import json
DEBUG_TOOLBAR_PATCH_SETTINGS = True
INTERNAL_IPS = ['127.0.0.1',]
with open('settings.json') as settings_file:
    private_settings = json.load(settings_file)
DEFAULTSTOCK = private_settings["defaultstock"]
APPEND_SLASH = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = private_settings['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

if DEBUG:
    import logging

    l = logging.getLogger('django.db.backends')
    # l.setLevel(logging.DEBUG)
    l.addHandler(logging.StreamHandler())

LOGGING = {
    'disable_existing_loggers': False,
    'version': 1,
    'handlers': {
        'console': {
            # logging handler that outputs log messages to terminal
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',  # message level to be written to console
        },
    },
    'loggers': {
        '': {
            # this sets root level logger to log debug and higher level
            # logs to console. All other loggers inherit settings from
            # root level logger.
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,  # this tells logger to send logging message
            # to its parent (will send if set to True)
        },
        'sql_server.pyodbc': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
        'django.db.backends.sqlite3': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
    },
}
ALLOWED_HOSTS = ["localhost"]

# Application definition

INSTALLED_APPS = (
    'home',
    'masterdata',
    'rest_framework',
    'rest_framework.authtoken',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #'djangosecure',
    #'sslserver',
    #'debug_toolbar',
)

REST_FRAMEWORK = {
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': ( )
}

MIDDLEWARE_CLASSES = (
    #'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    #'djangosecure.middleware.SecurityMiddleware',
)
#SECURE_SSL_REDIRECT = False
#'lagerapp.middleware.profile_middleware.ProfileMiddleware', //conflict with debug toolbar

ROOT_URLCONF = 'lagerapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lagerapp.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
# Define the database manager to setup the various projects
DATABASE_ROUTERS = ['lagerapp.settings.HitRouter']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },
}
for key, value in private_settings['databases'].iteritems():
    DATABASES[key] = value

class HitRouter(object):
    """
    A router to control all database operations on models in the
    auth application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read stock models go to hit_db.
        """
        if model._meta.app_label == 'hit_01_maintenance':
            return 'hit_01_maintenance'
        if model._meta.app_label == 'hit_01_bookkeeping':
            return 'hit_01_bookkeeping'
        if model._meta.app_label == 'hit_01_masterdata':
            return 'hit_01_masterdata'
        if model._meta.app_label == 'hit_0x_masterdata':
            return 'hit_0x_masterdata'
        if model._meta.app_label == 'hit_01_purchase':
            return 'hit_01_purchase'
        if model._meta.app_label == 'hit_01_staff':
            return 'hit_01_staff'
        if model._meta.app_label == 'hit_01_project':
            return 'hit_01_project'
        if model._meta.app_label == 'hit_05_purchase':
            return 'hit_05_purchase'
        if model._meta.app_label == 'hit_05_bookkeeping':
            return 'hit_05_bookkeeping'
        if model._meta.app_label == 'hit_05_staff':
            return 'hit_05_staff'
        if model._meta.app_label == 'hit_05_project':
            return 'hit_05_project'
        if model._meta.app_label == 'hit_04_purchase':
            return 'hit_04_purchase'
        if model._meta.app_label == 'hit_04_bookkeeping':
            return 'hit_04_bookkeeping'
        if model._meta.app_label == 'hit_04_staff':
            return 'hit_04_staff'
        if model._meta.app_label == 'hit_04_project':
            return 'hit_04_project'
        if model._meta.app_label == 'hit':
            return 'hit'
        # go to default

        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label in ['hit_01_purchase','hit_04_purchase','hit_05_purchase', 'hit_01_masterdata', 'hit_01_staff', 'hit_04_staff']:
            return model._meta.app_label
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations or deny relations.
        """
        return True
# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static/'), private_settings['purchase']['folder'],
                    private_settings['document_folder']]

DOCFOLDER = private_settings['document_folder']
STOCKBYID = private_settings['stockbyid']
DBSERVER = private_settings['dbserver']
DBPASSWORD = private_settings['dbpassword']