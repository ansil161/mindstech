from django.contrib import admin

from .models import Enquiry, Fieldwork, Solution, Blog

admin.site.register(Enquiry)
admin.site.register(Fieldwork)
admin.site.register(Solution)
admin.site.register(Blog)

