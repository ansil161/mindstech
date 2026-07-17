from django.db import models

class Enquiry(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Read', 'Read'),
        ('Resolved', 'Resolved'),
    )

    SOURCE_CHOICES = (
        ('website', 'Website Form'),
        ('chatbot', 'Chatbot'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=150, blank=True, default='')
    subject = models.CharField(max_length=150)
    message = models.TextField()
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='website')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enquiries'
        ordering = ['-created_at']
        verbose_name_plural = 'Enquiries'

    def __str__(self):
        return f"{self.subject} by {self.name} ({self.email})"


class Fieldwork(models.Model):
    title = models.CharField(max_length=150)
    location_meta = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    image = models.ImageField(upload_to='fieldwork/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        
        ordering = ['-created_at']
        

    def __str__(self):
        return f"{self.title} - {self.category} ({self.location_meta})"


class Solution(models.Model):
    title = models.CharField(max_length=150)
    desc = models.TextField()
    slug = models.CharField(max_length=100)
    image = models.ImageField(upload_to='solutions/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.title} ({self.slug})"


class Blog(models.Model):
    title = models.CharField(max_length=200)
    desc = models.TextField()
    content = models.TextField(blank=True, default='')
    href = models.CharField(max_length=250, blank=True, default='')
    cat = models.CharField(max_length=100)
    publish_date = models.DateField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-publish_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.cat})"


class CollectionCentre(models.Model):
    """An authorised e-waste drop-off location shown on the public site."""

    operator = models.CharField(max_length=150)
    city = models.CharField(max_length=150)
    address = models.TextField()
    contact_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['operator', 'city']

    def __str__(self):
        return f"{self.city} — {self.operator}"

class GalleryItem(models.Model):
    title    = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    image    = models.ImageField(upload_to='gallery/')

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.title} ({self.category})"


class EventNews(models.Model):
    """A single model for both Events and News items shown on the public /events page."""

    TYPE_CHOICES = (
        ('event', 'Event'),
        ('news', 'News'),
    )

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='events/', blank=True, null=True)

    # News-only
    category = models.CharField(max_length=100, blank=True, default='')

    # Event-only
    event_date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, default='')

    # Shared optional links
    external_url = models.URLField(max_length=500, blank=True, default='')
    register_url = models.URLField(max_length=500, blank=True, default='')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type.upper()}] {self.title}"


class Region(models.Model):
    """A geographic region the company operates in (e.g. India, Middle East)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    # List of page keys visible for this region.
    # e.g. ["ewaste", "gallery", "experience", "blogs"]
    # An empty list means no optional pages are enabled.
    enabled_pages = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    """A team member associated with a specific region."""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='team_members')
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=200)
    photo = models.ImageField(upload_to='team/')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"{self.name} — {self.role} ({self.region.name})"


class RegionContact(models.Model):
    """Contact information for a specific region."""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='contacts')
    phone = models.CharField(max_length=30)
    phone_display = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField()
    address = models.TextField()
    office_name = models.CharField(max_length=200, blank=True, default='')
    map_embed_url = models.URLField(max_length=500, blank=True, default='')
    map_link = models.URLField(max_length=500, blank=True, default='')


class RegionBrand(models.Model):
    """A brand/partner associated with a specific region."""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='brands')
    solutions = models.ManyToManyField(Solution, related_name='brands', blank=True)
    name = models.CharField(max_length=150)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    website_url = models.URLField(max_length=300, blank=True, default='')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"{self.name} ({self.region.name})"

    class Meta:
        verbose_name = 'Region Contact'
        verbose_name_plural = 'Region Contacts'

    def __str__(self):
        return f"Contact — {self.region.name}"


class ClientTestimonial(models.Model):
    """A client testimonial associated with a specific region."""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='testimonials')
    name = models.CharField(max_length=150)
    designation = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    message = models.TextField()
    photo = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"{self.name} — {self.company} ({self.region.name})"


class BaseModel(models.Model):
    """
    Abstract base model for tracking document synchronization status,
    versioning, and .
    """
    
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Increment the document version on each content modification to control re-indexing.
        """
        if self.pk:
            self.version += 1
        super().save(*args, **kwargs)



class Document(BaseModel):
    STATUS_CHOICES = (
        ('Uploaded', 'Uploaded'),
        ('Processing', 'Processing'),
        ('Pending Review', 'Pending Review'),
        ('Indexed', 'Indexed'),
        ('Failed', 'Failed'),
    )

    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Uploaded')
    extracted_text = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "documents"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.status}"

    def delete(self, *args, **kwargs):
        from .tasks.ai_tasks import delete_document_task
        
        # Trigger Celery task to delete from Qdrant (using ID prefix)
        delete_document_task.delay(f"document_{self.id}", self.category)
        
        # Delete the file from local storage
        if self.file:
            import os
            if os.path.isfile(self.file.path):
                try:
                    os.remove(self.file.path)
                except OSError:
                    pass
                    
        super().delete(*args, **kwargs)
