Ce site met en avant une expérience utilisateur basé sur un visualiseur 3D de musique utilisant l'API WebGL et la Web Audio API, mettant en vedette les Shaders d'OpenGL avec des déplacements de sommets selon un algorithme de bruit classique (aka. classic noise) et une formule de type `sqrt(x²+y²)` pour les déplacements du sol, avec en  bonus des particules !

L'intensité des déplacements se fait en temps réel et selon la gamme des fréquences analysée en JavaScript de la musique.
Le sol bouge en fonction des fréquences basses de la musique tandis que la sphère bouge en fonction des fréquences aigue.

Divers effets de post-processing ( traitement de l'image rendu par un algorithme ) sont eux aussi contrôlés selon la fréquence de la  musique.
Les musiques dont le son n'est pas saturé réagissent mieux.
Il y a possibilité de prendre une capture d'écran.

Ce projet personnel m'a permis d'être plus à l'aise quant à la création et à la compréhension des Shaders en GLSL, mais aussi à la création d'une application 3D procédurale avec du JavaScript Orienté-Objet (POO) et de m'améliorer en développement , en math et en motion design .
Les points les plus longs ont été les algorithmes de déplacement.
Ce projet m'a pris environ 3 mois.

La démarche artistique réside dans le résultat de l'influence de la musique sur un corps, d'autres interprétations peuvent être données selon les personnes.

Logiciels utilisés : Brackets


Les tests pour arriver au 60 fps en qualité Basique ont été réalisés sur un MSI avec un CPU i5-4210H (2.9GHz),  GPU  GTX 850M (1920x1080). (Ordinateur portable entrée de gamme).