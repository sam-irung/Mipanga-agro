# recommandations/management/commands/init_regles.py

from django.core.management.base import BaseCommand
from cultures.models import Culture, EtapeCulturelle
from recommandations.models import RegleAgronomique

class Command(BaseCommand):
    help = 'Initialise les règles agronomiques'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Initialisation des règles agronomiques...")

        # Récupérer les cultures
        mais = Culture.objects.get(nom='Maïs')
        manioc = Culture.objects.get(nom='Manioc')
        haricot = Culture.objects.get(nom='Haricot')

        # Récupérer les étapes
        semis_mais = EtapeCulturelle.objects.get(culture=mais, nom='Semis')
        sarclage_mais = EtapeCulturelle.objects.get(culture=mais, nom='Premier sarclage')
        engrais_mais = EtapeCulturelle.objects.get(culture=mais, nom="Fertilisation azotée")
        recolte_mais = EtapeCulturelle.objects.get(culture=mais, nom='Récolte')

        regles_data = [
            # MAÏS - Semis
            {
                'culture': mais,
                'etape': semis_mais,
                'conditions': {'pluie': '>20'},
                'conseil': 'Forte pluie annoncée (>20mm). Reportez le semis de 2-3 jours.',
                'source': 'meteo',
                'niveau': 'alerte',
                'priorite': 1
            },
            {
                'culture': mais,
                'etape': semis_mais,
                'conditions': {'temp_max': '>35'},
                'conseil': 'Température élevée (>35°C). Semez en début de journée.',
                'source': 'meteo',
                'niveau': 'attention',
                'priorite': 2
            },
            # MAÏS - Sarclage
            {
                'culture': mais,
                'etape': sarclage_mais,
                'conditions': {'pluie': '>30'},
                'conseil': 'Sol trop humide. Attendez 24-48h après la pluie.',
                'source': 'meteo',
                'niveau': 'attention',
                'priorite': 1
            },
            # MAÏS - Engrais
            {
                'culture': mais,
                'etape': engrais_mais,
                'conditions': {'pluie': '>15'},
                'conseil': 'Pluie annoncée. Reportez la fertilisation de 48h.',
                'source': 'meteo',
                'niveau': 'attention',
                'priorite': 1
            },
            # MAÏS - Récolte
            {
                'culture': mais,
                'etape': recolte_mais,
                'conditions': {'pluie': '>30'},
                'conseil': 'Risque de pourriture. Récoltez avant la pluie.',
                'source': 'meteo',
                'niveau': 'alerte',
                'priorite': 1
            },
            # Général
            {
                'culture': mais,
                'etape': None,
                'conditions': {'jours_sans_pluie': '>10'},
                'conseil': 'Sécheresse prolongée. Irriguez si possible.',
                'source': 'meteo',
                'niveau': 'alerte',
                'priorite': 1
            },
            # MANIOC
            {
                'culture': manioc,
                'etape': None,
                'conditions': {'jours_sans_pluie': '>14'},
                'conseil': 'Sécheresse prolongée. Surveillez l\'état des plants.',
                'source': 'meteo',
                'niveau': 'attention',
                'priorite': 2
            },
            # HARICOT
            {
                'culture': haricot,
                'etape': None,
                'conditions': {'pluie': '>25'},
                'conseil': 'Excès d\'eau. Vérifiez le drainage de la parcelle.',
                'source': 'meteo',
                'niveau': 'attention',
                'priorite': 1
            },
        ]

        for data in regles_data:
            RegleAgronomique.objects.get_or_create(
                culture=data['culture'],
                etape=data.get('etape'),
                conditions=data['conditions'],
                defaults={
                    'conseil': data['conseil'],
                    'source': data['source'],
                    'niveau': data['niveau'],
                    'priorite': data['priorite'],
                    'active': True
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Règles agronomiques initialisées !"))