#!/usr/bin/env python
import os
import sys

print(sys.argv)
if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lagerapp.settings_sofico")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
