from django.contrib import admin

from .models import Enquiry, Fieldwork, Solution, Blog, CollectionCentre, Region, RegionContact


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'company', 'subject', 'source', 'status', 'created_at')
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('name', 'email', 'phone', 'company', 'subject', 'message')
    readonly_fields = ('name', 'email', 'phone', 'company', 'subject', 'message', 'source', 'created_at')
    list_per_page = 25
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Contact Details', {
            'fields': ('name', 'email', 'phone', 'company'),
        }),
        ('Enquiry', {
            'fields': ('subject', 'message'),
        }),
        ('Meta', {
            'fields': ('source', 'status', 'created_at'),
        }),
    )

    def get_fields(self, request, obj=None):
        # Allow editing only the status field
        if obj:
            return super().get_fields(request, obj)
        return super().get_fields(request, obj)

    def has_add_permission(self, request):
        # Enquiries are created through the API only
        return False


admin.site.register(Fieldwork)
admin.site.register(Solution)
admin.site.register(Blog)


@admin.register(CollectionCentre)
class CollectionCentreAdmin(admin.ModelAdmin):
    list_display = ('city', 'operator', 'contact_name', 'phone', 'is_active')
    list_filter = ('is_active', 'operator')
    search_fields = ('city', 'operator', 'address', 'contact_name')


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'display_order')
    search_fields = ('name', 'slug')


@admin.register(RegionContact)
class RegionContactAdmin(admin.ModelAdmin):
    list_display = ('region', 'office_name', 'email', 'phone')
    list_filter = ('region',)
    search_fields = ('office_name', 'address', 'email', 'phone')
