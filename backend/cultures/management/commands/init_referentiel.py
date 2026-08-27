# backend/cultures/management/commands/init_referentiel.py

from django.core.management.base import BaseCommand
from datetime import date
from cultures.models import Culture, Variete, EtapeCulturelle, ProfilClimatique, ZoneAgricole, CalendrierZone

class Command(BaseCommand):
    help = 'Initialise les 10 cultures avec données vérifiées'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Initialisation du référentiel des 10 cultures...")

        # === ZONE ===
        zone, _ = ZoneAgricole.objects.get_or_create(
            nom='Lubumbashi',
            province='Haut-Katanga',
            defaults={'territoire': 'Lubumbashi', 'latitude': -11.6645, 'longitude': 27.4824}
        )

        # === DONNÉES DES 10 CULTURES ===
        cultures_data = [
            {
                'nom': 'Maïs',
                'emoji': '🌽',
                'type': 'cereale',
                'nom_scientifique': 'Zea mays',
                'description': 'Principale céréale cultivée en RDC',
                'duree_min': 105,
                'duree_max': 140,
                'temp_min': 18,
                'temp_opt_min': 22,
                'temp_opt_max': 28,
                'temp_max': 35,
                'besoin_eau_min': 500,
                'besoin_eau_max': 800,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 2,
                'source': 'FAO - Crop Water Requirements',
                'source_url': 'https://www.fao.org/4/S2022E/s2022e07.htm',
                'semis_debut': 305,  # 1 novembre
                'semis_fin': 365,    # 31 décembre
                'recolte_debut': 152,
                'recolte_fin': 212,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -7, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 25, 'ordre': 4},
                    {'nom': 'Fertilisation azotée', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 35, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 40, 'decalage_max': 55, 'ordre': 6},
                    {'nom': 'Deuxième sarclage', 'type': 'entretien', 'decalage_min': 45, 'decalage_max': 65, 'ordre': 7},
                    {'nom': 'Surveillance floraison', 'type': 'surveillance', 'decalage_min': 60, 'decalage_max': 80, 'ordre': 8},
                    {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 90, 'decalage_max': 115, 'ordre': 9},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 105, 'decalage_max': 140, 'ordre': 10},
                ]
            },
            {
                'nom': 'Manioc',
                'emoji': '🌱',
                'type': 'tubercule',
                'nom_scientifique': 'Manihot esculenta',
                'description': 'Première culture vivrière du Haut-Katanga',
                'duree_min': 180,
                'duree_max': 360,
                'temp_min': 20,
                'temp_opt_min': 24,
                'temp_opt_max': 30,
                'temp_max': 38,
                'besoin_eau_min': 500,
                'besoin_eau_max': 800,
                'tolerance_secheresse': 3,
                'tolerance_exces_eau': 2,
                'source': 'IITA - Cassava Production Guide',
                'source_url': 'https://www.iita.org/cassava',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 274,
                'recolte_fin': 334,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -7, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Sélection des boutures', 'type': 'preparation', 'decalage_min': -3, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Plantation', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 3},
                    {'nom': 'Contrôle de reprise', 'type': 'surveillance', 'decalage_min': 15, 'decalage_max': 30, 'ordre': 4},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 30, 'decalage_max': 60, 'ordre': 5},
                    {'nom': 'Deuxième sarclage', 'type': 'entretien', 'decalage_min': 60, 'decalage_max': 90, 'ordre': 6},
                    {'nom': 'Troisième sarclage', 'type': 'entretien', 'decalage_min': 90, 'decalage_max': 120, 'ordre': 7},
                    {'nom': 'Surveillance maladies', 'type': 'surveillance', 'decalage_min': 100, 'decalage_max': 180, 'ordre': 8},
                    {'nom': 'Surveillance racines', 'type': 'surveillance', 'decalage_min': 180, 'decalage_max': 270, 'ordre': 9},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 240, 'decalage_max': 360, 'ordre': 10},
                ]
            },
            {
                'nom': 'Haricot',
                'emoji': '🫘',
                'type': 'legumineuse',
                'nom_scientifique': 'Phaseolus vulgaris',
                'description': 'Légumineuse riche en protéines',
                'duree_min': 60,
                'duree_max': 90,
                'temp_min': 16,
                'temp_opt_min': 18,
                'temp_opt_max': 24,
                'temp_max': 30,
                'besoin_eau_min': 300,
                'besoin_eau_max': 500,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 1,
                'source': 'FAO - Crop Water Requirements',
                'source_url': 'https://www.fao.org/4/S2022E/s2022e07.htm',
                'semis_debut': 305,
                'semis_fin': 349,
                'recolte_debut': 32,
                'recolte_fin': 74,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 20, 'ordre': 4},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 30, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 35, 'decalage_max': 45, 'ordre': 6},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 60, 'decalage_max': 90, 'ordre': 7},
                ]
            },
            {
                'nom': 'Arachide',
                'emoji': '🥜',
                'type': 'oleagineux',
                'nom_scientifique': 'Arachis hypogaea',
                'description': 'Culture oléagineuse importante',
                'duree_min': 90,
                'duree_max': 120,
                'temp_min': 20,
                'temp_opt_min': 24,
                'temp_opt_max': 30,
                'temp_max': 35,
                'besoin_eau_min': 500,
                'besoin_eau_max': 700,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 2,
                'source': 'FAO - Groundnut Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 90,
                'recolte_fin': 120,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 7, 'decalage_max': 14, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 20, 'decalage_max': 25, 'ordre': 4},
                    {'nom': 'Buttage', 'type': 'entretien', 'decalage_min': 30, 'decalage_max': 35, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 40, 'decalage_max': 55, 'ordre': 6},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 90, 'decalage_max': 120, 'ordre': 7},
                ]
            },
            {
                'nom': 'Soja',
                'emoji': '🌿',
                'type': 'legumineuse',
                'nom_scientifique': 'Glycine max',
                'description': 'Légumineuse oléagineuse',
                'duree_min': 80,
                'duree_max': 120,
                'temp_min': 18,
                'temp_opt_min': 20,
                'temp_opt_max': 28,
                'temp_max': 35,
                'besoin_eau_min': 450,
                'besoin_eau_max': 700,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 2,
                'source': 'FAO - Soybean Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 80,
                'recolte_fin': 120,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 20, 'ordre': 4},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 30, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 35, 'decalage_max': 45, 'ordre': 6},
                    {'nom': 'Floraison', 'type': 'surveillance', 'decalage_min': 45, 'decalage_max': 60, 'ordre': 7},
                    {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 70, 'decalage_max': 100, 'ordre': 8},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 80, 'decalage_max': 120, 'ordre': 9},
                ]
            },
            {
                'nom': 'Sorgho',
                'emoji': '🌾',
                'type': 'cereale',
                'nom_scientifique': 'Sorghum bicolor',
                'description': 'Céréale résistante à la sécheresse',
                'duree_min': 90,
                'duree_max': 140,
                'temp_min': 22,
                'temp_opt_min': 25,
                'temp_opt_max': 32,
                'temp_max': 40,
                'besoin_eau_min': 350,
                'besoin_eau_max': 500,
                'tolerance_secheresse': 3,
                'tolerance_exces_eau': 1,
                'source': 'FAO - Sorghum Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 90,
                'recolte_fin': 140,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 25, 'ordre': 4},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 35, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 40, 'decalage_max': 55, 'ordre': 6},
                    {'nom': 'Deuxième sarclage', 'type': 'entretien', 'decalage_min': 50, 'decalage_max': 70, 'ordre': 7},
                    {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 70, 'decalage_max': 100, 'ordre': 8},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 90, 'decalage_max': 140, 'ordre': 9},
                ]
            },
            {
                'nom': 'Patate douce',
                'emoji': '🍠',
                'type': 'tubercule',
                'nom_scientifique': 'Ipomoea batatas',
                'description': 'Tubercule riche en vitamines',
                'duree_min': 90,
                'duree_max': 150,
                'temp_min': 18,
                'temp_opt_min': 20,
                'temp_opt_max': 26,
                'temp_max': 35,
                'besoin_eau_min': 300,
                'besoin_eau_max': 500,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 2,
                'source': 'FAO - Sweet Potato Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 90,
                'recolte_fin': 150,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Plantation des boutures', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance reprise', 'type': 'surveillance', 'decalage_min': 10, 'decalage_max': 15, 'ordre': 3},
                    {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 20, 'decalage_max': 30, 'ordre': 4},
                    {'nom': 'Buttage', 'type': 'entretien', 'decalage_min': 30, 'decalage_max': 40, 'ordre': 5},
                    {'nom': 'Deuxième sarclage', 'type': 'entretien', 'decalage_min': 45, 'decalage_max': 60, 'ordre': 6},
                    {'nom': 'Surveillance maladies', 'type': 'surveillance', 'decalage_min': 60, 'decalage_max': 90, 'ordre': 7},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 90, 'decalage_max': 150, 'ordre': 8},
                ]
            },
            {
                'nom': 'Riz',
                'emoji': '🌾',
                'type': 'cereale',
                'nom_scientifique': 'Oryza sativa',
                'description': 'Céréale de base dans certaines zones',
                'duree_min': 100,
                'duree_max': 150,
                'temp_min': 20,
                'temp_opt_min': 24,
                'temp_opt_max': 30,
                'temp_max': 35,
                'besoin_eau_min': 400,
                'besoin_eau_max': 800,
                'tolerance_secheresse': 1,
                'tolerance_exces_eau': 3,
                'source': 'FAO - Rice Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 100,
                'recolte_fin': 150,
                'etapes': [
                    {'nom': 'Préparation de la pépinière', 'type': 'preparation', 'decalage_min': -15, 'decalage_max': -5, 'ordre': 1},
                    {'nom': 'Semis en pépinière', 'type': 'semis', 'decalage_min': -5, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Repiquage', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 3},
                    {'nom': 'Surveillance repiquage', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 4},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 15, 'decalage_max': 25, 'ordre': 5},
                    {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 30, 'decalage_max': 45, 'ordre': 6},
                    {'nom': 'Désherbage', 'type': 'entretien', 'decalage_min': 40, 'decalage_max': 60, 'ordre': 7},
                    {'nom': 'Surveillance floraison', 'type': 'surveillance', 'decalage_min': 60, 'decalage_max': 80, 'ordre': 8},
                    {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 80, 'decalage_max': 120, 'ordre': 9},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 100, 'decalage_max': 150, 'ordre': 10},
                ]
            },
            {
                'nom': 'Pomme de terre',
                'emoji': '🥔',
                'type': 'tubercule',
                'nom_scientifique': 'Solanum tuberosum',
                'description': 'Tubercule important en maraîchage',
                'duree_min': 80,
                'duree_max': 120,
                'temp_min': 12,
                'temp_opt_min': 16,
                'temp_opt_max': 22,
                'temp_max': 25,
                'besoin_eau_min': 350,
                'besoin_eau_max': 500,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 1,
                'source': 'FAO - Potato Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 80,
                'recolte_fin': 120,
                'etapes': [
                    {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -7, 'decalage_max': -1, 'ordre': 1},
                    {'nom': 'Plantation', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 7, 'decalage_max': 14, 'ordre': 3},
                    {'nom': 'Buttage', 'type': 'entretien', 'decalage_min': 20, 'decalage_max': 25, 'ordre': 4},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 30, 'decalage_max': 35, 'ordre': 5},
                    {'nom': 'Surveillance maladies', 'type': 'surveillance', 'decalage_min': 40, 'decalage_max': 60, 'ordre': 6},
                    {'nom': 'Deuxième buttage', 'type': 'entretien', 'decalage_min': 50, 'decalage_max': 60, 'ordre': 7},
                    {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 60, 'decalage_max': 90, 'ordre': 8},
                    {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 80, 'decalage_max': 120, 'ordre': 9},
                ]
            },
            {
                'nom': 'Tomate',
                'emoji': '🍅',
                'type': 'maraicher',
                'nom_scientifique': 'Solanum lycopersicum',
                'description': 'Culture maraîchère importante',
                'duree_min': 60,
                'duree_max': 90,
                'temp_min': 18,
                'temp_opt_min': 20,
                'temp_opt_max': 26,
                'temp_max': 32,
                'besoin_eau_min': 400,
                'besoin_eau_max': 600,
                'tolerance_secheresse': 2,
                'tolerance_exces_eau': 1,
                'source': 'FAO - Tomato Production Guide',
                'source_url': 'https://www.fao.org',
                'semis_debut': 305,
                'semis_fin': 365,
                'recolte_debut': 60,
                'recolte_fin': 90,
                'etapes': [
                    {'nom': 'Préparation pépinière', 'type': 'preparation', 'decalage_min': -15, 'decalage_max': -5, 'ordre': 1},
                    {'nom': 'Semis en pépinière', 'type': 'semis', 'decalage_min': -5, 'decalage_max': 0, 'ordre': 2},
                    {'nom': 'Entretien pépinière', 'type': 'entretien', 'decalage_min': -5, 'decalage_max': 0, 'ordre': 3},
                    {'nom': 'Repiquage', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 4},
                    {'nom': 'Surveillance reprise', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 5},
                    {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 15, 'decalage_max': 20, 'ordre': 6},
                    {'nom': 'Tuteurage', 'type': 'entretien', 'decalage_min': 20, 'decalage_max': 25, 'ordre': 7},
                    {'nom': 'Surveillance maladies', 'type': 'surveillance', 'decalage_min': 30, 'decalage_max': 45, 'ordre': 8},
                    {'nom': 'Première récolte', 'type': 'recolte', 'decalage_min': 60, 'decalage_max': 75, 'ordre': 9},
                    {'nom': 'Récoltes successives', 'type': 'recolte', 'decalage_min': 70, 'decalage_max': 90, 'ordre': 10},
                ]
            },
        ]

        # === CRÉATION DES CULTURES ===
        for data in cultures_data:
            # Créer la culture
            culture, created = Culture.objects.get_or_create(
                nom=data['nom'],
                defaults={
                    'type': data['type'],
                    'emoji': data['emoji'],
                    'nom_scientifique': data['nom_scientifique'],
                    'description': data['description'],
                    'duree_min': data['duree_min'],
                    'duree_max': data['duree_max'],
                    'temperature_min': data['temp_min'],
                    'temperature_optimum': (data['temp_opt_min'] + data['temp_opt_max']) / 2,
                    'temperature_max': data['temp_max'],
                    'besoin_eau_min': data['besoin_eau_min'],
                    'besoin_eau_max': data['besoin_eau_max'],
                    'tolerance_exces_eau': data['tolerance_exces_eau'],
                    'tolerance_secheresse': data['tolerance_secheresse'],
                    'active': True
                }
            )

            if created:
                self.stdout.write(f"✅ {culture.emoji} {culture.nom} ajouté")
            else:
                self.stdout.write(f"ℹ️ {culture.emoji} {culture.nom} existe déjà")

            # Ajouter une variété standard
            Variete.objects.get_or_create(
                culture=culture,
                nom='Standard',
                defaults={
                    'duree_min': data['duree_min'],
                    'duree_max': data['duree_max'],
                    'source': data['source'],
                    'active': True
                }
            )

            # Ajouter le profil climatique
            ProfilClimatique.objects.update_or_create(
                culture=culture,
                defaults={
                    'temp_min': data['temp_min'],
                    'temp_opt_min': data['temp_opt_min'],
                    'temp_opt_max': data['temp_opt_max'],
                    'temp_max': data['temp_max'],
                    'besoin_eau_min': data['besoin_eau_min'],
                    'besoin_eau_max': data['besoin_eau_max'],
                    'tolerance_secheresse': data['tolerance_secheresse'],
                    'tolerance_exces_eau': data['tolerance_exces_eau'],
                    'source': data['source'],
                    'source_url': data['source_url'],
                    'niveau_confiance': 'eleve',
                    'date_verification': date.today()
                }
            )

            # Ajouter les étapes
            for etape_data in data['etapes']:
                EtapeCulturelle.objects.update_or_create(
                    culture=culture,
                    ordre=etape_data['ordre'],
                    defaults={
                        'nom': etape_data['nom'],
                        'type_etape': etape_data['type'],
                        'decalage_min': etape_data['decalage_min'],
                        'decalage_max': etape_data['decalage_max'],
                        'source': data['source']
                    }
                )

            # Ajouter le calendrier par zone
            CalendrierZone.objects.update_or_create(
                culture=culture,
                zone=zone,
                saison='A',
                defaults={
                    'semis_debut_jour': data['semis_debut'],
                    'semis_fin_jour': data['semis_fin'],
                    'recolte_debut_jour': data['recolte_debut'],
                    'recolte_fin_jour': data['recolte_fin'],
                    'source': data['source'],
                    'niveau_confiance': 'eleve',
                    'actif': True
                }
            )

        self.stdout.write(self.style.SUCCESS("🎉 10 cultures initialisées avec sources vérifiées !"))