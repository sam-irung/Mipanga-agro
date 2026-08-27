# backend/cultures/management/commands/init_cultures.py

from django.core.management.base import BaseCommand
from datetime import date
from cultures.models import (
    Culture, Variete, ZoneAgricole, CalendrierZone,
    EtapeCulturelle, ProfilClimatique, SourceAgronomique
)

class Command(BaseCommand):
    help = 'Initialise les 3 cultures pilotes avec sources vérifiées'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Initialisation des cultures pilotes...")

        # === SOURCES ===
        source_fao, _ = SourceAgronomique.objects.get_or_create(
            titre="FAO Crop Calendar Database",
            organisation="FAO",
            annee=2023,
            url="https://www.fao.org/agriculture/crops/crop-calendar",
            defaults={'date_consultation': date(2024, 1, 15)}
        )

        source_guide, _ = SourceAgronomique.objects.get_or_create(
            titre="Guide de plantation - Lubumbashi 2024",
            organisation="Service Agricole Haut-Katanga",
            auteur="Direction Provinciale de l'Agriculture",
            annee=2024,
            defaults={'date_consultation': date(2024, 1, 15)}
        )

        source_iita, _ = SourceAgronomique.objects.get_or_create(
            titre="IITA Cassava Crop Calendar",
            organisation="IITA",
            annee=2023,
            url="https://www.iita.org/cassava",
            defaults={'date_consultation': date(2024, 1, 15)}
        )

        # === ZONE AGRICOLE ===
        lubumbashi, _ = ZoneAgricole.objects.get_or_create(
            nom='Lubumbashi',
            province='Haut-Katanga',
            defaults={
                'territoire': 'Lubumbashi',
                'latitude': -11.6645,
                'longitude': 27.4824
            }
        )

        # === 1. MAÏS ===
        mais, _ = Culture.objects.get_or_create(
            nom='Maïs',
            defaults={
                'type': 'cereale',
                'nom_scientifique': 'Zea mays',
                'description': 'Culture vivrière de base en RDC. Le maïs est la principale céréale cultivée au Haut-Katanga.',
                'emoji': '🌽',
                'duree_min': 105,
                'duree_max': 140,
                'temperature_min': 18,
                'temperature_optimum': 25,
                'temperature_max': 35,
                'besoin_eau_min': 400,
                'besoin_eau_max': 600,
                'tolerance_exces_eau': 2,
                'tolerance_secheresse': 2,
            }
        )

        # Variétés
        Variete.objects.get_or_create(
            culture=mais, nom='Précoce (90-110j)',
            defaults={
                'duree_min': 90, 'duree_max': 110,
                'description': 'Cycle court, idéal pour zones à saison courte',
                'source': source_guide.titre
            }
        )
        Variete.objects.get_or_create(
            culture=mais, nom='Intermédiaire (105-130j)',
            defaults={
                'duree_min': 105, 'duree_max': 130,
                'description': 'Variété la plus cultivée en RDC',
                'source': source_guide.titre
            }
        )
        Variete.objects.get_or_create(
            culture=mais, nom='Tardive (120-150j)',
            defaults={
                'duree_min': 120, 'duree_max': 150,
                'description': 'Idéale pour zones à forte pluviométrie',
                'source': source_guide.titre
            }
        )

        # Calendrier par zone (Lubumbashi)
        CalendrierZone.objects.get_or_create(
            culture=mais,
            zone=lubumbashi,
            saison='A',
            defaults={
                'semis_debut_jour': 305,  # 1 novembre
                'semis_fin_jour': 365,    # 31 décembre
                'recolte_debut_jour': 152, # 1 juin (année suivante)
                'recolte_fin_jour': 212,   # 31 juillet (année suivante)
                'source': source_guide.titre,
                'niveau_confiance': 'eleve'
            }
        )

        # Profil climatique
        ProfilClimatique.objects.get_or_create(
            culture=mais,
            defaults={
                'pluie_min': 400,
                'pluie_max': 600,
                'pluie_optimum': 500,
                'temp_min': 18,
                'temp_max': 35,
                'temp_optimum': 25,
                'altitude_min': 800,
                'altitude_max': 1800,
                'jours_secheresse_toleres': 7,
                'source': source_fao.titre,
                'niveau_confiance': 'eleve',
                'date_verification': date(2024, 1, 15)
            }
        )

        # Étapes (avec décalage négatif pour la préparation)
        etapes_mais = [
            {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -7, 'decalage_max': -1, 'ordre': 1},
            {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
            {'nom': 'Surveillance de la levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
            {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 25, 'ordre': 4},
            {'nom': 'Fertilisation azotée', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 35, 'ordre': 5},
            {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 40, 'decalage_max': 55, 'ordre': 6},
            {'nom': 'Deuxième sarclage', 'type': 'entretien', 'decalage_min': 45, 'decalage_max': 65, 'ordre': 7},
            {'nom': 'Surveillance floraison', 'type': 'surveillance', 'decalage_min': 60, 'decalage_max': 80, 'ordre': 8},
            {'nom': 'Maturation', 'type': 'surveillance', 'decalage_min': 90, 'decalage_max': 115, 'ordre': 9},
            {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 105, 'decalage_max': 140, 'ordre': 10},
        ]

        for data in etapes_mais:
            EtapeCulturelle.objects.get_or_create(
                culture=mais,
                ordre=data['ordre'],
                defaults={
                    'nom': data['nom'],
                    'type_etape': data['type'],
                    'decalage_min': data['decalage_min'],
                    'decalage_max': data['decalage_max'],
                    'source': source_guide.titre
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Maïs initialisé"))

        # === 2. MANIOC ===
        manioc, _ = Culture.objects.get_or_create(
            nom='Manioc',
            defaults={
                'type': 'tubercule',
                'nom_scientifique': 'Manihot esculenta',
                'description': 'Culture vivrière de base en RDC. Le manioc est la première culture du Haut-Katanga.',
                'emoji': '🌱',
                'duree_min': 180,
                'duree_max': 360,
                'temperature_min': 20,
                'temperature_optimum': 28,
                'temperature_max': 38,
                'besoin_eau_min': 500,
                'besoin_eau_max': 800,
                'tolerance_exces_eau': 2,
                'tolerance_secheresse': 3,
            }
        )

        Variete.objects.get_or_create(
            culture=manioc, nom='Précoce (6-8 mois)',
            defaults={
                'duree_min': 180, 'duree_max': 240,
                'description': 'Variété précoce adaptée aux sols pauvres',
                'source': source_iita.titre
            }
        )
        Variete.objects.get_or_create(
            culture=manioc, nom='Intermédiaire (8-12 mois)',
            defaults={
                'duree_min': 240, 'duree_max': 360,
                'description': 'Variété la plus cultivée en RDC',
                'source': source_iita.titre
            }
        )

        CalendrierZone.objects.get_or_create(
            culture=manioc,
            zone=lubumbashi,
            saison='A',
            defaults={
                'semis_debut_jour': 305,
                'semis_fin_jour': 365,
                'recolte_debut_jour': 274,  # 1 octobre
                'recolte_fin_jour': 334,    # 30 novembre
                'source': source_guide.titre,
                'niveau_confiance': 'eleve'
            }
        )

        ProfilClimatique.objects.get_or_create(
            culture=manioc,
            defaults={
                'pluie_min': 500,
                'pluie_max': 800,
                'pluie_optimum': 600,
                'temp_min': 20,
                'temp_max': 38,
                'temp_optimum': 28,
                'altitude_min': 0,
                'altitude_max': 2000,
                'jours_secheresse_toleres': 14,
                'source': source_iita.titre,
                'niveau_confiance': 'eleve',
                'date_verification': date(2024, 1, 15)
            }
        )

        etapes_manioc = [
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

        for data in etapes_manioc:
            EtapeCulturelle.objects.get_or_create(
                culture=manioc,
                ordre=data['ordre'],
                defaults={
                    'nom': data['nom'],
                    'type_etape': data['type'],
                    'decalage_min': data['decalage_min'],
                    'decalage_max': data['decalage_max'],
                    'source': source_guide.titre
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Manioc initialisé"))

        # === 3. HARICOT ===
        haricot, _ = Culture.objects.get_or_create(
            nom='Haricot',
            defaults={
                'type': 'legumineuse',
                'nom_scientifique': 'Phaseolus vulgaris',
                'description': 'Culture légumineuse riche en protéines. Très cultivée au Haut-Katanga.',
                'emoji': '🫘',
                'duree_min': 60,
                'duree_max': 90,
                'temperature_min': 16,
                'temperature_optimum': 22,
                'temperature_max': 30,
                'besoin_eau_min': 250,
                'besoin_eau_max': 350,
                'tolerance_exces_eau': 1,
                'tolerance_secheresse': 2,
            }
        )

        Variete.objects.get_or_create(
            culture=haricot, nom='Précoce (60-75j)',
            defaults={
                'duree_min': 60, 'duree_max': 75,
                'description': 'Variété à cycle court',
                'source': source_guide.titre
            }
        )
        Variete.objects.get_or_create(
            culture=haricot, nom='Intermédiaire (75-90j)',
            defaults={
                'duree_min': 75, 'duree_max': 90,
                'description': 'Variété la plus cultivée',
                'source': source_guide.titre
            }
        )

        CalendrierZone.objects.get_or_create(
            culture=haricot,
            zone=lubumbashi,
            saison='A',
            defaults={
                'semis_debut_jour': 305,
                'semis_fin_jour': 349,  # 15 décembre
                'recolte_debut_jour': 32,  # 1 février
                'recolte_fin_jour': 74,    # 15 mars
                'source': source_guide.titre,
                'niveau_confiance': 'eleve'
            }
        )

        ProfilClimatique.objects.get_or_create(
            culture=haricot,
            defaults={
                'pluie_min': 250,
                'pluie_max': 350,
                'pluie_optimum': 300,
                'temp_min': 16,
                'temp_max': 30,
                'temp_optimum': 22,
                'altitude_min': 800,
                'altitude_max': 2000,
                'jours_secheresse_toleres': 5,
                'source': source_fao.titre,
                'niveau_confiance': 'eleve',
                'date_verification': date(2024, 1, 15)
            }
        )

        etapes_haricot = [
            {'nom': 'Préparation du terrain', 'type': 'preparation', 'decalage_min': -5, 'decalage_max': -1, 'ordre': 1},
            {'nom': 'Semis', 'type': 'semis', 'decalage_min': 0, 'decalage_max': 0, 'ordre': 2},
            {'nom': 'Surveillance levée', 'type': 'surveillance', 'decalage_min': 5, 'decalage_max': 10, 'ordre': 3},
            {'nom': 'Premier sarclage', 'type': 'entretien', 'decalage_min': 15, 'decalage_max': 20, 'ordre': 4},
            {'nom': 'Fertilisation', 'type': 'fertilisation', 'decalage_min': 25, 'decalage_max': 30, 'ordre': 5},
            {'nom': 'Surveillance ravageurs', 'type': 'surveillance', 'decalage_min': 35, 'decalage_max': 45, 'ordre': 6},
            {'nom': 'Récolte', 'type': 'recolte', 'decalage_min': 60, 'decalage_max': 90, 'ordre': 7},
        ]

        for data in etapes_haricot:
            EtapeCulturelle.objects.get_or_create(
                culture=haricot,
                ordre=data['ordre'],
                defaults={
                    'nom': data['nom'],
                    'type_etape': data['type'],
                    'decalage_min': data['decalage_min'],
                    'decalage_max': data['decalage_max'],
                    'source': source_guide.titre
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Haricot initialisé"))

        self.stdout.write(self.style.SUCCESS("🎉 Les 3 cultures pilotes ont été initialisées avec succès !"))
        self.stdout.write(f"📚 Sources ajoutées: {SourceAgronomique.objects.count()}")
        self.stdout.write(f"📍 Zone: {ZoneAgricole.objects.count()}")