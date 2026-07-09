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
        db_table = 'fieldwork'
        ordering = ['-created_at']
        verbose_name_plural = 'Fieldwork Projects'

    def __str__(self):
        return f"{self.title} - {self.category} ({self.location_meta})"


