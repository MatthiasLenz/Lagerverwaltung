# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('id', models.TextField(serialize=False, primary_key=True, db_column=b'ID')),
                ('firstname', models.TextField(null=True, db_column=b'FirstName', blank=True)),
                ('lastname', models.TextField(null=True, db_column=b'LastName', blank=True)),
                ('phone', models.TextField(null=True, db_column=b'Phone', blank=True)),
                ('mobile', models.TextField(null=True, db_column=b'Mobile', blank=True)),
                ('mail', models.TextField(null=True, db_column=b'Mail', blank=True)),
                ('gender', models.NullBooleanField(db_column=b'Gender')),
            ],
            options={
                'abstract': False,
                'db_table': 'Staff',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Lagerausgang',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('stockid', models.CharField(max_length=15, null=True, blank=True)),
                ('projectid1', models.CharField(max_length=15, null=True, blank=True)),
                ('projectid2', models.CharField(max_length=15, null=True, blank=True)),
                ('purchasedocid1', models.CharField(max_length=15, null=True, blank=True)),
                ('purchasedocid2', models.CharField(max_length=15, null=True, blank=True)),
                ('docdate', models.DateTimeField(null=True, blank=True)),
                ('responsible', models.CharField(max_length=15, blank=True)),
                ('pdf', models.CharField(max_length=128, null=True, blank=True)),
                ('abholer', models.CharField(max_length=128, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='PurchaseDocuments',
            fields=[
                ('purchasedocid', models.CharField(max_length=15, serialize=False, primary_key=True)),
                ('pdf', models.CharField(max_length=128, null=True, blank=True)),
                ('doc', models.CharField(max_length=128, null=True, blank=True)),
                ('odt', models.CharField(max_length=128, null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserData',
            fields=[
                ('user', models.OneToOneField(primary_key=True, db_column=b'userid', serialize=False, to=settings.AUTH_USER_MODEL)),
                ('companyid', models.CharField(max_length=2, null=True, db_column=b'CompanyID')),
            ],
        ),
    ]
