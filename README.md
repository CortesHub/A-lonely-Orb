Ce site met en avant une exp�rience utilisateur bas� sur un visualiseur 3D de musique utilisant l'API WebGL et la Web Audio API, mettant en vedette les Shaders d'OpenGL avec des d�placements de sommets selon un algorithme de bruit classique (aka. classic noise) et une formule de type `sqrt(x�+y�)` pour les d�placements du sol, avec en  bonus des particules !

L'intensit� des d�placements se fait en temps r�el et selon la gamme des fr�quences analys�e en JavaScript de la musique.
Le sol bouge en fonction des fr�quences basses de la musique tandis que la sph�re bouge en fonction des fr�quences aigue.

Divers effets de post-processing ( traitement de l'image rendu par un algorithme ) sont eux aussi contr�l�s selon la fr�quence de la  musique.
Les musiques dont le son n'est pas satur� r�agissent mieux.
Il y a possibilit� de prendre une capture d'�cran.

Ce projet personnel m'a permis d'�tre plus � l'aise quant � la cr�ation et � la compr�hension des Shaders en GLSL, mais aussi � la cr�ation d'une application 3D proc�durale avec du JavaScript Orient�-Objet (POO) et de m'am�liorer en d�veloppement , en math et en motion design .
Les points les plus longs ont �t� les algorithmes de d�placement.
Ce projet m'a pris environ 3 mois.

La d�marche artistique r�side dans le r�sultat de l'influence de la musique sur un corps, d'autres interpr�tations peuvent �tre donn�es selon les personnes.

Logiciels utilis�s : Brackets


Les tests pour arriver au 60 fps en qualit� Basique ont �t� r�alis�s sur un MSI avec un CPU i5-4210H (2.9GHz),  GPU  GTX 850M (1920x1080). (Ordinateur portable entr�e de gamme).