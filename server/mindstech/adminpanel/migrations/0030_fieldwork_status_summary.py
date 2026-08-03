from django.db import migrations, models


class Migration(migrations.Migration):
    """Adds case-study metadata to Fieldwork for the public /projects page.

    Both fields carry defaults, so existing rows keep working untouched:
    everything already in the table describes finished work and becomes
    'completed'.
    """

    dependencies = [
        ('adminpanel', '0029_remove_clienttestimonial_region'),
    ]

    operations = [
        migrations.AddField(
            model_name='fieldwork',
            name='status',
            field=models.CharField(
                choices=[('completed', 'Completed'), ('ongoing', 'Ongoing')],
                default='completed',
                help_text='Whether this installation is delivered or still in progress.',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='fieldwork',
            name='summary',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Optional short case-study paragraph shown on the Projects page.',
            ),
        ),
    ]
