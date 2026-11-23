"""
Rename two seeded regions:
    South Asia         (south-asia)      -> Southeast Asia (southeast-asia)
    Hong Kong / China  (hong-kong-china) -> Europe         (europe)

The slug changes with the name because the site keys translations and email
routing off it ('europe' routes enquiries to info.eu@mindstec.com).

Seeded placeholder contact details are updated alongside: Southeast Asia
enquiries are handled by the Global inbox, and Europe gets its regional inbox.
The Hong Kong dummy phone (+852 0000 0000) is cleared rather than carried over
to Europe; the Contact page hides an empty phone. Contact fields an admin has
already edited away from the seed values are left alone.
"""

from django.db import migrations

RENAMES = [
    {
        'old': ('South Asia', 'south-asia'),
        'new': ('Southeast Asia', 'southeast-asia'),
        'contact_old': {
            'office_name': 'Mindstec Distribution — South Asia',
            'address': 'South Asia Regional Office',
            'email': 'southasia@mindstec.com',
            'phone_display': '+91 — South Asia Desk',
        },
        'contact_new': {
            'office_name': 'Mindstec Distribution — Southeast Asia',
            'address': 'Southeast Asia Regional Office',
            'email': 'info@mindstec.com',
            'phone_display': '+91 80 4525 6922',
        },
    },
    {
        'old': ('Hong Kong / China', 'hong-kong-china'),
        'new': ('Europe', 'europe'),
        'contact_old': {
            'office_name': 'Mindstec Distribution — Hong Kong / China',
            'address': 'Hong Kong / China Regional Office',
            'email': 'china@mindstec.com',
            'phone_display': '+852 — Hong Kong / China Desk',
            'phone': '+85200000000',
        },
        'contact_new': {
            'office_name': 'Mindstec Distribution — Europe',
            'address': 'Europe Regional Office',
            'email': 'info.eu@mindstec.com',
            'phone_display': '',
            'phone': '',
        },
    },
]


def _apply(apps, direction):
    Region = apps.get_model('adminpanel', 'Region')
    RegionContact = apps.get_model('adminpanel', 'RegionContact')
    for r in RENAMES:
        (from_name, from_slug), (to_name, to_slug) = (
            (r['old'], r['new']) if direction == 'forward' else (r['new'], r['old'])
        )
        from_contact, to_contact = (
            (r['contact_old'], r['contact_new']) if direction == 'forward'
            else (r['contact_new'], r['contact_old'])
        )
        region = Region.objects.filter(slug=from_slug).first()
        if region is None or Region.objects.filter(slug=to_slug).exists():
            continue
        region.name, region.slug = to_name, to_slug
        region.save(update_fields=['name', 'slug'])
        for contact in RegionContact.objects.filter(region=region):
            changed = []
            for field, old_value in from_contact.items():
                if getattr(contact, field) == old_value:
                    setattr(contact, field, to_contact[field])
                    changed.append(field)
            if changed:
                contact.save(update_fields=changed)


def forward(apps, schema_editor):
    _apply(apps, 'forward')


def backward(apps, schema_editor):
    _apply(apps, 'backward')


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0032_enquiry_region'),
    ]

    operations = [
        migrations.RunPython(forward, backward),
    ]
