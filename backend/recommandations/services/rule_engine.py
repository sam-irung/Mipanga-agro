# backend/recommandations/services/rule_engine.py

class RuleEngine:
    """
    Moteur d'évaluation des règles agronomiques
    """

    @staticmethod
    def evaluer_condition(conditions, meteo, age, etape_nom, jours_retard=0):
        """
        Évalue si une condition est vraie
        """
        resultat = True

        for cle, valeur in conditions.items():
            if not RuleEngine._evaluer_condition_unique(cle, valeur, meteo, age, etape_nom, jours_retard):
                resultat = False
                break

        return resultat

    @staticmethod
    def _evaluer_condition_unique(cle, valeur, meteo, age, etape_nom, jours_retard):
        """
        Évalue une condition unique
        """
        if cle == 'pluie':
            pluie = meteo.get('pluie', 0)
            return RuleEngine._comparer_nombre(pluie, valeur)

        elif cle == 'jours_sans_pluie':
            return meteo.get('pluie', 0) == 0

        elif cle == 'age':
            return RuleEngine._comparer_nombre(age, valeur)

        elif cle == 'etape':
            if etape_nom:
                return etape_nom.lower() == valeur.lower()
            return False

        elif cle == 'temp_max':
            temp = meteo.get('temp_max', 0)
            return RuleEngine._comparer_nombre(temp, valeur)

        elif cle == 'temp_min':
            temp = meteo.get('temp_min', 0)
            return RuleEngine._comparer_nombre(temp, valeur)

        elif cle == 'humidite':
            humidite = meteo.get('humidite', 0)
            return RuleEngine._comparer_nombre(humidite, valeur)

        elif cle == 'vent':
            vent = meteo.get('vent', 0)
            return RuleEngine._comparer_nombre(vent, valeur)

        # ✅ NOUVEAU: condition de retard
        elif cle == 'retard':
            return RuleEngine._comparer_nombre(jours_retard, valeur)

        return True

    @staticmethod
    def _comparer_nombre(valeur_reelle, valeur_condition):
        """
        Compare une valeur réelle avec une condition
        Ex: ">20", "<15", ">=10", "<=5", "=30"
        """
        str_valeur = str(valeur_condition)

        if str_valeur.startswith('>='):
            seuil = float(str_valeur[2:])
            return valeur_reelle >= seuil
        elif str_valeur.startswith('<='):
            seuil = float(str_valeur[2:])
            return valeur_reelle <= seuil
        elif str_valeur.startswith('>'):
            seuil = float(str_valeur[1:])
            return valeur_reelle > seuil
        elif str_valeur.startswith('<'):
            seuil = float(str_valeur[1:])
            return valeur_reelle < seuil
        else:
            return valeur_reelle == float(str_valeur)