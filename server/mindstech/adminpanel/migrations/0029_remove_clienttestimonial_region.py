from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0028_remove_teammember_region'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clienttestimonial',
            name='region',
        ),
    ]
