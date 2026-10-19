"""
Load the region x solution x brand matrix from the distribution brand sheet.

    python manage.py seed_region_brands --dry-run   # show what would change
    python manage.py seed_region_brands             # apply

Idempotent: a RegionBrand is matched on (region, name); its website and
solution links are then set to exactly what the sheet says. Brands already in
the CMS that the sheet does not mention are reported, never deleted.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from adminpanel.models import Region, RegionBrand, Solution

I, M, A, E = 'india', 'middle-east', 'africa', 'europe'
ALL = (I, M, A, E)

# Sheet vertical -> acceptable DB slugs (the CMS still carries the older short
# slugs; the site resolves them the same way).
SOLUTION_SLUGS = {
    'control-rooms': ('control-rooms-critical-environments', 'control-rooms'),
    'conferencing': ('conferencing-collaboration', 'conferencing'),
    'immersive': ('immersive-experience', 'live-events'),
    'broadcast': ('broadcast-production-streaming', 'broadcast'),
    'signage': ('digital-signage-dooh', 'digital-signage'),
    'audio': ('professional-audio-systems',),
    'hospitality': ('hospitality-guest-experience', 'hospitality'),
    'ict': ('information-and-communication-technology',),
}

URLS = {
    'Datapath': 'https://www.datapath.co.uk',
    'Christie': 'https://www.christiedigital.com',
    'Delta': 'https://www.deltadisplays.com',
    'Horion': 'https://www.horion.com',
    'Polywall': 'https://polywall.net',
    'NETGEAR AV': 'https://www.netgear.com/av/',
    'Cambium': 'https://www.cambiumnetworks.com',
    'MTC': 'https://mtc-technologies.com',
    'Kordz': 'https://www.kordz.com',
    'B-Tech': 'https://www.btechavmounts.com',
    'Blustream': 'https://www.blustream.com.au',
    'RTI': 'https://www.rticontrol.com',
    'Sapling': 'https://www.sapling-inc.com',
    'Wavex': 'https://www.wavextouch.com',
    'AtlasIED': 'https://www.atlasied.com',
    'Aurora': 'https://www.auroramultimedia.com',
    'T1V': 'https://www.t1v.com',
    'Avocor': 'https://www.avocor.com',
    'Sonance': 'https://www.sonance.com',
    'GoGet': 'https://www.gogetcorp.com',
    'iPort': 'https://www.iportproducts.com',
    'Magnum': '',
    'SCT': 'https://www.soundcontrol.net',
    'Vizrt': 'https://www.vizrt.com',
    'Telycam': 'https://www.telycam.com',
    'PTZ Optics': 'https://www.ptzoptics.com',
    'SalrayWorks': 'https://www.salrayworks.com',
    'Amino': 'https://www.amino.tv',
    'Smartsign': 'https://www.smartsign.se',
    'Bluefin': 'https://www.thebluefin.com',
    'Lemco': 'https://www.lemco.gr',
    'RDL': 'https://www.rdlnet.com',
    'Humelab': 'https://www.humelab-hospitality.com',
}

# vertical -> [(brand, regions it is offered in)], in the sheet's order.
MATRIX = {
    'control-rooms': [
        ('Datapath', ALL), ('Christie', (I,)), ('Delta', (M,)), ('Horion', (A,)),
        ('Polywall', (I, M, A)), ('NETGEAR AV', (I,)), ('Cambium', (M,)), ('MTC', ALL),
        ('Kordz', ALL), ('B-Tech', ALL), ('Blustream', (I, M, A)), ('RTI', (M, A)),
        ('Sapling', (I, M, A)), ('Wavex', (I,)), ('AtlasIED', (M,)), ('Aurora', (E,)),
    ],
    'conferencing': [
        ('T1V', ALL), ('MTC', ALL), ('Avocor', (I,)), ('Sonance', (I,)), ('Kordz', ALL),
        ('B-Tech', ALL), ('GoGet', (I, M)), ('iPort', (I, M)), ('Magnum', (I,)),
        ('Blustream', (I, M, A)), ('RTI', (M, A)), ('SCT', (I, M)), ('Wavex', (I,)),
        ('Aurora', (E,)),
    ],
    'immersive': [
        ('Datapath', ALL), ('T1V', ALL), ('MTC', ALL), ('Christie', (I,)), ('Sonance', (I,)),
        ('Kordz', ALL), ('B-Tech', ALL), ('Blustream', (I, M, A)), ('RTI', (M, A)),
        ('Wavex', (I,)), ('Vizrt', (I,)),
    ],
    'broadcast': [
        ('Vizrt', (I,)), ('Telycam', (I,)), ('PTZ Optics', (A,)), ('Kordz', ALL),
        ('B-Tech', ALL), ('Blustream', (I, M, A)), ('SalrayWorks', (I,)),
    ],
    'signage': [
        ('Kordz', ALL), ('B-Tech', ALL), ('Blustream', (I, M, A)), ('Amino', (I,)),
        ('Wavex', (I,)), ('Smartsign', (A,)), ('Bluefin', (I, M)),
    ],
    'audio': [
        ('Sonance', (I,)), ('AtlasIED', (M,)), ('SCT', (I, M)),
    ],
    'hospitality': [
        ('Lemco', (I, M, E)), ('Sonance', (I,)), ('RDL', (I, M)), ('Kordz', ALL),
        ('B-Tech', ALL), ('Blustream', (I, M, A)), ('RTI', (M, A)), ('MTC', (I,)),
        ('Humelab', (I, M, A)),
    ],
    'ict': [
        ('Cambium', (M,)), ('Kordz', ALL),
    ],
}


class Command(BaseCommand):
    help = 'Seed RegionBrand rows and their solution links from the brand sheet.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Report changes without saving.')

    def handle(self, *args, **opts):
        dry = opts['dry_run']

        solutions = {}
        for key, slugs in SOLUTION_SLUGS.items():
            sol = Solution.objects.filter(slug__in=slugs).first()
            if sol is None:
                self.stdout.write(self.style.WARNING(f'No Solution row for "{key}" ({", ".join(slugs)}) - skipped.'))
            solutions[key] = sol

        # region -> brand -> set of verticals
        plan = {}
        for key, rows in MATRIX.items():
            for brand, regions in rows:
                for r in regions:
                    plan.setdefault(r, {}).setdefault(brand, set()).add(key)

        with transaction.atomic():
            for slug, brands in plan.items():
                region = Region.objects.filter(slug=slug).first()
                if region is None:
                    self.stdout.write(self.style.WARNING(f'No Region "{slug}" - skipped {len(brands)} brands.'))
                    continue
                self.stdout.write(self.style.MIGRATE_HEADING(f'{region.name}: {len(brands)} brands'))
                for order, (name, keys) in enumerate(sorted(brands.items()), start=1):
                    linked = [solutions[k] for k in sorted(keys) if solutions.get(k)]
                    obj = RegionBrand.objects.filter(region=region, name__iexact=name).first()
                    verb = 'update' if obj else 'create'
                    self.stdout.write(f'  {verb} {name} -> {", ".join(sorted(keys))}')
                    if dry:
                        continue
                    if obj is None:
                        obj = RegionBrand(region=region, name=name, display_order=order)
                    obj.website_url = URLS.get(name, obj.website_url or '')
                    obj.is_active = True
                    obj.save()
                    obj.solutions.set(linked)
                extra = RegionBrand.objects.filter(region=region).exclude(name__in=list(brands)).values_list('name', flat=True)
                if extra:
                    self.stdout.write(self.style.WARNING(f'  not in sheet (left untouched): {", ".join(extra)}'))
