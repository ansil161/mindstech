from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0027_fix_solution_slugs'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='teammember',
            name='region',
        ),
    ]
