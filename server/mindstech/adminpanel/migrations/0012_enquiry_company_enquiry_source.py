# Generated migration: add company and source fields to Enquiry

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0011_delete_knowledgebase'),
    ]

    operations = [
        migrations.AddField(
            model_name='enquiry',
            name='company',
            field=models.CharField(blank=True, default='', max_length=150),
        ),
        migrations.AddField(
            model_name='enquiry',
            name='source',
            field=models.CharField(
                choices=[('website', 'Website Form'), ('chatbot', 'Chatbot')],
                default='website',
                max_length=10,
            ),
        ),
    ]
