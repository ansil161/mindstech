from django.db import migrations


def seed_regions(apps, schema_editor):
    Region = apps.get_model('adminpanel', 'Region')
    RegionContact = apps.get_model('adminpanel', 'RegionContact')

    regions = [
        {
            'name': 'India',
            'slug': 'india',
            'display_order': 0,
            'contact': {
                'phone': '+918045256922',
                'phone_display': '+91 80 4525 6922',
                'email': 'india@mindstec.com',
                'address': 'No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043, India',
                'office_name': 'Mindstec Distribution — Bangalore HQ',
                'map_embed_url': 'https://maps.google.com/maps?q=MINDSTEC%20DISTRIBUTION%20PRIVATE%20LIMITED%2C%20OMBR%20Layout%2C%20Bangalore&z=15&output=embed',
                'map_link': 'https://www.google.com/maps/place/MINDSTEC+DISTRIBUTION+PRIVATE+LIMITED/@13.0108201,77.6558671,849m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bae171505942e5f:0x89ccc127b403eb0e!8m2!3d13.0108201!4d77.658442!16s%2Fg%2F11ckqsxnqv',
            },
        },
        {
            'name': 'Middle East',
            'slug': 'middle-east',
            'display_order': 1,
            'contact': {
                'phone': '+971000000000',
                'phone_display': '+971 — Middle East Desk',
                'email': 'middleeast@mindstec.com',
                'address': 'Middle East Regional Office',
                'office_name': 'Mindstec Distribution — Middle East',
                'map_embed_url': '',
                'map_link': '',
            },
        },
        {
            'name': 'Africa',
            'slug': 'africa',
            'display_order': 2,
            'contact': {
                'phone': '+254000000000',
                'phone_display': '+254 — Africa Desk',
                'email': 'africa@mindstec.com',
                'address': 'Africa Regional Office',
                'office_name': 'Mindstec Distribution — Africa',
                'map_embed_url': '',
                'map_link': '',
            },
        },
        {
            'name': 'South Asia',
            'slug': 'south-asia',
            'display_order': 3,
            'contact': {
                'phone': '+918045256922',
                'phone_display': '+91 — South Asia Desk',
                'email': 'southasia@mindstec.com',
                'address': 'South Asia Regional Office',
                'office_name': 'Mindstec Distribution — South Asia',
                'map_embed_url': '',
                'map_link': '',
            },
        },
        {
            'name': 'Hong Kong / China',
            'slug': 'hong-kong-china',
            'display_order': 4,
            'contact': {
                'phone': '+85200000000',
                'phone_display': '+852 — Hong Kong / China Desk',
                'email': 'china@mindstec.com',
                'address': 'Hong Kong / China Regional Office',
                'office_name': 'Mindstec Distribution — Hong Kong / China',
                'map_embed_url': '',
                'map_link': '',
            },
        },
    ]

    for entry in regions:
        contact_data = entry.pop('contact')
        region, created = Region.objects.get_or_create(
            slug=entry['slug'],
            defaults={'name': entry['name'], 'display_order': entry['display_order'], 'is_active': True},
        )
        if not created and region.name != entry['name']:
            region.name = entry['name']
            region.display_order = entry['display_order']
            region.save()

        RegionContact.objects.get_or_create(
            region=region,
            defaults=contact_data,
        )


def unseed_regions(apps, schema_editor):
    Region = apps.get_model('adminpanel', 'Region')
    slugs = ['india', 'middle-east', 'africa', 'south-asia', 'hong-kong-china']
    Region.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0015_region_regioncontact_teammember'),
    ]

    operations = [
        migrations.RunPython(seed_regions, unseed_regions),
    ]
