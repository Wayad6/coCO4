

let nomClasseCourante = "cdivcr";
let nombredecouleur = 0;
const limite = 150;

function genererCouleurs() {
  // Générer les couleurs avec une boucle for
  for (let i = 0; i < limite; i++) {
    ajouterElementCouleur();
    nombredecouleur++;
  }

}

window.addEventListener('scroll', function() {
  const scrolltop = window.scrollY || document.documentElement.scrollTop;
  const scrollheight = document.documentElement.scrollHeight;
  const scrollclient = document.documentElement.clientHeight;

  const pourcentage = (scrolltop / (scrollheight - scrollclient)) * 100;


  if (pourcentage >= 90 && nombredecouleur !== 0) {
    // Appeler la fonction de génération de couleurs
    genererCouleurs();
  }
});


genererCouleurs();


function genererElementCouleur(codeCouleur) {
  const nouveauxdive = document.createElement('div');
  nouveauxdive.classList.add(nomClasseCourante);
  nouveauxdive.id = 'divcree'
  nouveauxdive.style.backgroundColor = '#' + codeCouleur;

  const texteCodeCouleur = document.createElement('div');
  texteCodeCouleur.textContent = '#' + codeCouleur;

  // Ajoutez un gestionnaire d'événements au div pour la copie du texte
  nouveauxdive.addEventListener('click', function() {
    const texteACopier = texteCodeCouleur.textContent;

    // Copiez le texte dans le presse-papiers
    navigator.clipboard.writeText(texteACopier).then(function() {
      // Affichez un message de confirmation
      const messageCopie = document.createElement('div');
      messageCopie.textContent = 'copié';
      messageCopie.style.margin = '2px';

      nouveauxdive.appendChild(messageCopie);

      // Disparition du message après 2 secondes
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



function genererCouleurAleatoire(){
  return  Math.floor(Math.random() * 16777215).toString(16);
}


function ajouterElementCouleur() {
  const divgenerale = document.querySelector('#divgnr');
  const couleurAleatoire = genererCouleurAleatoire();
  const tirage = Math.floor(Math.random() * 9) + 1;

  if(tirage === 8 || tirage === 9 ){
 // console.log( 'tirage 89', tirage)
  couleurAleatoires = couleurAleatoire.slice(0, 4)
  }else if(tirage === 6 || tirage === 7){
    couleurAleatoires = couleurAleatoire.slice(0, 3)

    //console.log( 'tirage 67', tirage)

  }else{
    couleurAleatoires = couleurAleatoire
  }
  const nouvelElement = genererElementCouleur(couleurAleatoires);
  divgenerale.appendChild(nouvelElement);
}


/*
//document.addEventListener("DOMContentLoaded", function() {
  const toggleDarkModeButton = document.getElementById("toggleDarkMode");

  toggleDarkModeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
  });
*/

document.addEventListener("DOMContentLoaded", function() {
  const toggleDarkModeButton = document.getElementById("toggleDarkMode");
  const stoggleDarkModeButton = document.getElementById("stoggleDarkMode");

  toggleDarkModeButton.addEventListener("click", function() {
    // Basculer la classe dark-mode sur le body
    document.body.classList.toggle("dark-mode");
    
    // Mettre à jour le texte du bouton en fonction de l'état
    const isDarkModeEnabled = document.body.classList.contains("dark-mode");
    stoggleDarkModeButton.textContent = isDarkModeEnabled ? "sunny" : "bedtime" ;
  });
});



function changerNomClasse() {
  const changercl = document.querySelector('#changeclasee')
  // On récupère tous les éléments du DOM
  let elements = document.querySelectorAll("*");

  // On parcourt tous les éléments
  for (let element of elements) {
    // On remplace la classe actuelle par la classe opposée
    element.classList.replace(nomClasseCourante, nomClasseCourante === "cdivcr" ? "cdivcr2" : "cdivcr");
  }

  // On met à jour la variable nomClasseCourante
  nomClasseCourante = nomClasseCourante === "cdivcr" ? "cdivcr2" : "cdivcr";
  if(changercl.textContent === "cards"){
    changercl.textContent = "width_full"
  }else{
    changercl.textContent = "cards"

  }
  
}

document.querySelector("#button").addEventListener("click", changerNomClasse);
