# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Nature',
            fields=[
                ('id', models.CharField(max_length=15, serialize=False, primary_key=True, db_column=b'ID')),
                ('title', models.NullBooleanField(db_column=b'Title')),
                ('titlegrade', models.SmallIntegerField(null=True, db_column=b'TitleGrade', blank=True)),
                ('name', models.CharField(max_length=35, db_column=b'Name', blank=True)),
                ('remark', models.CharField(max_length=50, db_column=b'Remark', blank=True)),
            ],
            options={
                'db_table': 'Nature',
                'managed': False,
            },
        ),
    ]
