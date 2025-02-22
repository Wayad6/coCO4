
let nomClasseCourante = "cdivcr";
let nombredecouleur = 0;
const limite = 150;
const divgenerale = document.querySelector('#divgnr');

function genererCouleurs() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < limite; i++) {
        const nouvelElement = ajouterElementCouleur();
        fragment.appendChild(nouvelElement);
        nombredecouleur++;
    }
    divgenerale.appendChild(fragment);
}

function ajouterElementCouleur() {
    const couleurAleatoire = genererCouleurAleatoire();
    const tirage = Math.floor(Math.random() * 9) + 1;
    let couleurAleatoires;

    if (tirage >= 8) {
        couleurAleatoires = couleurAleatoire.slice(0, 4);
    } else if (tirage >= 6) {
        couleurAleatoires = couleurAleatoire.slice(0, 3);
    } else {
        couleurAleatoires = couleurAleatoire;
    }

    const nouvelElement = genererElementCouleur(couleurAleatoires);
    return nouvelElement;
}

function genererElementCouleur(codeCouleur) {
    const nouveauxdive = document.createElement('div');
    nouveauxdive.classList.add(nomClasseCourante);
    nouveauxdive.id = 'divcree'
    nouveauxdive.style.backgroundColor = '#' + codeCouleur;

    const texteCodeCouleur = document.createElement('div');
    texteCodeCouleur.textContent = '#' + codeCouleur;

    nouveauxdive.addEventListener('click', function() {
        const texteACopier = texteCodeCouleur.textContent;
        navigator.clipboard.writeText(texteACopier).then(function() {
            const messageCopie = document.createElement('div');
            messageCopie.textContent = 'copié';
            messageCopie.style.margin = '2px';
            nouveauxdive.appendChild(messageCopie);
            setTimeout(() => {
                nouveauxdive.removeChild(messageCopie);
            }, 2000);
        }).catch(function(err) {
            console.error('Erreur lors de la copie dans le presse-papiers : ', err);
        });
    });

    nouveauxdive.appendChild(texteCodeCouleur);
    return nouveauxdive;
}

function genererCouleurAleatoire() {
    return Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

function changerNomClasse() {
    const changercl = document.querySelector('#changeclasee');
    let elements = document.querySelectorAll("*");
    for (let element of elements) {
        element.classList.replace(nomClasseCourante, nomClasseCourante === "cdivcr" ? "cdivcr2" : "cdivcr");
    }
    nomClasseCourante = nomClasseCourante === "cdivcr" ? "cdivcr2" : "cdivcr";
    changercl.textContent = changercl.textContent === "cards" ? "width_full" : "cards";
}

function initEventListeners() {
    document.querySelector("#button").addEventListener("click", changerNomClasse);
    document.addEventListener("DOMContentLoaded", function() {
        const toggleDarkModeButton = document.getElementById("toggleDarkMode");
        const stoggleDarkModeButton = document.getElementById("stoggleDarkMode");

        toggleDarkModeButton.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
            const isDarkModeEnabled = document.body.classList.contains("dark-mode");
            stoggleDarkModeButton.textContent = isDarkModeEnabled ? "sunny" : "bedtime";
        });
    });

    window.addEventListener('scroll', function() {
        const scrolltop = window.scrollY || document.documentElement.scrollTop;
        const scrollheight = document.documentElement.scrollHeight;
        const scrollclient = document.documentElement.clientHeight;
        const pourcentage = (scrolltop / (scrollheight - scrollclient)) * 100;

        if (pourcentage >= 90 && nombredecouleur !== 0) {
            genererCouleurs();
        }
    });
}

genererCouleurs();
initEventListeners();