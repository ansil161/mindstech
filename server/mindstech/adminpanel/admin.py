from django.contrib import admin

from .models import Enquiry, Fieldwork, Solution, Blog, KnowledgeBase

admin.site.register(Enquiry)
admin.site.register(Fieldwork)
admin.site.register(Solution)
admin.site.register(Blog)

@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'knowledge_type', 'title', 'version', 'is_active', 'updated_at')
    list_filter = ('knowledge_type', 'is_active')
    search_fields = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    list_per_page = 25

