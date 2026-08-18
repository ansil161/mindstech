from django.db import migrations


def founder_first(apps, schema_editor):
    """
    Put the founder at the head of the About page's team grid.

    Why this needs a migration rather than a CMS edit
    -------------------------------------------------
    `TeamMember.Meta.ordering` is ['display_order', 'created_at'], and until
    recently nothing in the admin could write `display_order` after a row was
    created — `useTeam.addTeamMember` stamped it once and no screen could edit
    it again. Rows added before that stamp existed all sit at 0, so the public
    order was decided entirely by `created_at`, i.e. the sequence people
    happened to be entered in. That is why the founder rendered second with no
    way to correct it from the dashboard.

    What it does
    ------------
    Matches on the ROLE text, not on a name: hardcoding "Syed Abdul Wahab"
    would silently do nothing on any environment whose data differs, and would
    be wrong the day the role changes hands. Anyone whose role mentions
    "founder" or "chairman" moves to the front, keeping their order relative to
    each other; everyone else keeps their existing relative order behind them.

    The whole list is then renumbered 0..n-1. Renumbering is the point — a
    straight swap would leave the pile of ties at 0 intact, and the grid would
    fall back to creation order again on the next write.

    This runs once. Any ordering the client sets afterwards with the Up/Down
    controls in the Team tab is theirs and is not touched again.
    """
    TeamMember = apps.get_model('adminpanel', 'TeamMember')

    members = list(TeamMember.objects.all().order_by('display_order', 'created_at'))
    if not members:
        return

    def leads(member):
        role = (member.role or '').casefold()
        return 'founder' in role or 'chairman' in role

    # sorted() is stable, so within each group the existing order survives.
    ordered = sorted(members, key=lambda m: 0 if leads(m) else 1)

    changed = []
    for position, member in enumerate(ordered):
        if member.display_order != position:
            member.display_order = position
            changed.append(member)

    if changed:
        TeamMember.objects.bulk_update(changed, ['display_order'])


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0030_fieldwork_status_summary'),
    ]

    operations = [
        # Irreversible by design: the previous ordering was an accident of
        # insertion order, so there is no prior state worth restoring.
        migrations.RunPython(founder_first, migrations.RunPython.noop),
    ]
