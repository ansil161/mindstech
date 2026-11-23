from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0031_team_founder_first'),
    ]

    operations = [
        migrations.AddField(
            model_name='enquiry',
            name='region',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
    ]
