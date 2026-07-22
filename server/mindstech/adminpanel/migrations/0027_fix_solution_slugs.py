from django.db import migrations

# Solution.slug is a plain hand-typed CharField (never auto-slugified), so four
# of the six seeded rows ended up with slugs the public site can't route on
# (spaces, stray capitals, wrong words) — e.g. 'hospitality-av' instead of the
# canonical 'hospitality' used throughout the frontend (Navbar, Footer,
# SolutionDetails). Matched by title since slug is the corrupted field here.
TITLE_TO_CANONICAL_SLUG = {
    'Digital Signage': 'digital-signage',
    'Control Rooms': 'control-rooms',
    'Conferencing & Collaboration': 'conferencing',
    'Hospitality AV': 'hospitality',
    'Broadcast & Production': 'broadcast',
    'Live Events & Immersive': 'live-events',
}


def fix_slugs(apps, schema_editor):
    Solution = apps.get_model('adminpanel', 'Solution')
    for title, correct_slug in TITLE_TO_CANONICAL_SLUG.items():
        Solution.objects.filter(title=title).exclude(slug=correct_slug).update(slug=correct_slug)


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0026_region_parent'),
    ]

    operations = [
        migrations.RunPython(fix_slugs, migrations.RunPython.noop),
    ]
