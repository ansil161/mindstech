from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0031_team_founder_first'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventnews',
            name='region',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='event_news',
                to='adminpanel.region',
            ),
        ),
    ]
