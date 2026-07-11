from django.db import models

class Enquiry(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Read', 'Read'),
        ('Resolved', 'Resolved'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    subject = models.CharField(max_length=150)
    message = models.TextField()
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
    href = models.CharField(max_length=250)
    cat = models.CharField(max_length=100)
    publish_date = models.DateField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-publish_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.cat})"

class SynchronizedModel(models.Model):
    """
    Abstract base model for tracking document synchronization status,
    versioning, and tenant mapping.
    """
    tenant_id = models.CharField(max_length=100, default="default")
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


class FAQ(SynchronizedModel):
    """
    Represents Frequently Asked Questions content to be synced to the RAG service.
    """
    question = models.TextField()
    answer = models.TextField()

    class Meta:
        db_table = 'synchronized_faqs'

    def __str__(self):
        return f"FAQ ({self.id}): {self.question[:50]}..."


class Product(SynchronizedModel):
    """
    Represents product specification and descriptions synchronized to the search indexes.
    """
    name = models.CharField(max_length=200)
    description = models.TextField()

    class Meta:
        db_table = 'synchronized_products'

    def __str__(self):
        return f"Product ({self.id}): {self.name}"


class CompanyPage(SynchronizedModel):
    """
    Represents corporate static pages (e.g. About Us, Contact, History) for AI ingestion.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()

    class Meta:
        db_table = 'synchronized_company_pages'

    def __str__(self):
        return f"CompanyPage ({self.id}): {self.title}"


class Policy(SynchronizedModel):
    """
    Represents internal procedures, HR guidelines, or security policies.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()

    class Meta:
        db_table = 'synchronized_policies'
        verbose_name_plural = 'Policies'

    def __str__(self):
        return f"Policy ({self.id}): {self.title}"


class Documentation(SynchronizedModel):
    """
    Represents technical or general document libraries.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()

    class Meta:
        db_table = 'synchronized_documentation'
        verbose_name_plural = 'Documentation'

    def __str__(self):
        return f"Doc ({self.id}): {self.title}"

