from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0024_remove_solution_caps_remove_solution_caps_side_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventNews',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('event', 'Event'), ('news', 'News')], max_length=10)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('image', models.ImageField(blank=True, null=True, upload_to='events/')),
                ('category', models.CharField(blank=True, default='', max_length=100)),
                ('event_date', models.DateTimeField(blank=True, null=True)),
                ('location', models.CharField(blank=True, default='', max_length=200)),
                ('external_url', models.URLField(blank=True, default='', max_length=500)),
                ('register_url', models.URLField(blank=True, default='', max_length=500)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
