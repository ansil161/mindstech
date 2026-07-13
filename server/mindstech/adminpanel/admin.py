from django.contrib import admin

from .models import Enquiry, Fieldwork, Solution, Blog, CollectionCentre, KnowledgeBase

admin.site.register(Enquiry)
admin.site.register(Fieldwork)
admin.site.register(Solution)
admin.site.register(Blog)

@admin.register(CollectionCentre)
class CollectionCentreAdmin(admin.ModelAdmin):
    list_display = ('city', 'operator', 'contact_name', 'phone', 'is_active')
    list_filter = ('is_active', 'operator')
    search_fields = ('city', 'operator', 'address', 'contact_name')

@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'knowledge_type', 'title', 'version', 'is_active', 'updated_at')
    list_filter = ('knowledge_type', 'is_active')
    search_fields = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    list_per_page = 25

