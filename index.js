// --- Maths ---
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(k, lambdaVal) {
  if (lambdaVal < 0 || k < 0) return 0;
  return (Math.pow(lambdaVal, k) * Math.exp(-lambdaVal)) / factorial(k);
}

// --- UI erreurs ---
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorDiv = document.getElementById("error-" + inputId);
  if (!input || !errorDiv) return;
  input.classList.add("error");
  errorDiv.innerText = message;
  errorDiv.style.display = "block";
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach(div => {
    div.style.display = "none";
    div.innerText = "";
  });
  document.querySelectorAll("input").forEach(input => {
    input.classList.remove("error");
  });
}

// --- Calcul principal ---
function calculer() {
  clearErrors();
  let valid = true;

  const fields = [
    { id: "homeMatches", label: "Matchs domicile" },
    { id: "homeGoalsScored", label: "Buts marqués domicile" },
    { id: "homeGoalsConceded", label: "Buts encaissés domicile" },
    { id: "awayMatches", label: "Matchs extérieur" },
    { id: "awayGoalsScored", label: "Buts marqués extérieur" },
    { id: "awayGoalsConceded", label: "Buts encaissés extérieur" }
  ];

  // Validation
  fields.forEach(field => {
    const el = document.getElementById(field.id);
    const value = el?.value ?? "";
    if (value === "") {
      showError(field.id, `Merci d’indiquer ${field.label.toLowerCase()}.`);
      valid = false;
    } else if (Number(value) < 0) {
      showError(field.id, `${field.label} doit être positif.`);
      valid = false;
    }
  });

  const hMVal = Number(document.getElementById("homeMatches").value);
  const aMVal = Number(document.getElementById("awayMatches").value);
  if (hMVal === 0) { showError("homeMatches", "Le nombre de matchs domicile doit être > 0."); valid = false; }
  if (aMVal === 0) { showError("awayMatches", "Le nombre de matchs extérieur doit être > 0."); valid = false; }

  if (!valid) return;

  // --- Lecture des valeurs ---
  const hM  = hMVal;
  const hGS = Number(document.getElementById("homeGoalsScored").value);
  const hGC = Number(document.getElementById("homeGoalsConceded").value);
  const aM  = aMVal;
  const aGS = Number(document.getElementById("awayGoalsScored").value);
  const aGC = Number(document.getElementById("awayGoalsConceded").value);

  // Moyennes
  const homeAvgScored   = hGS / hM;
  const homeAvgConceded = hGC / hM;
  const awayAvgScored   = aGS / aM;
  const awayAvgConceded = aGC / aM;

  const lambdaHome = (homeAvgScored + awayAvgConceded) / 2;
  const lambdaAway = (awayAvgScored + homeAvgConceded) / 2;

  // --- Génération de tous les scores (0 à 10) ---
  const scores = [];
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const prob = poisson(i, lambdaHome) * poisson(j, lambdaAway);
      scores.push({ score: `${i} - ${j}`, prob });
    }
  }

  // --- Top 10 pour affichage ---
  const top10 = [...scores].sort((a, b) => b.prob - a.prob).slice(0, 10);
  const totalTopProb = top10.reduce((sum, item) => sum + item.prob, 0);

  // --- Calcul des pourcentages 1X2 et BTTS sur tous les scores ---
  let homeWin = 0, draw = 0, awayWin = 0;
  let bttsYes = 0, bttsNo = 0;

  scores.forEach(item => {
    const [h, a] = item.score.split(" - ").map(Number);

    // 1X2
    if (h > a) homeWin += item.prob;
    else if (h === a) draw += item.prob;
    else awayWin += item.prob;

    // BTTS
    if (h > 0 && a > 0) bttsYes += item.prob;
    else bttsNo += item.prob;
  });

  const totalProb = homeWin + draw + awayWin; // devrait être ~1
 // console.log (totalProb)
  // --- Distribution des totaux de buts ---
function calculerTotaux(scores) {
  const totalGoalsDist = {};
  
  // Parcourir tous les scores (0-10)
  scores.forEach(item => {
    const [h, a] = item.score.split(" - ").map(Number);
    const total = h + a;
    
    if (!totalGoalsDist[total]) totalGoalsDist[total] = 0;
    totalGoalsDist[total] += item.prob;
  });
  
  // Transformation en tableau et filtrage
  const results = Object.entries(totalGoalsDist)
    .map(([goals, prob]) => ({ goals: Number(goals), prob }))
    .filter(r => r.prob >= 0.01) // on garde seulement >= 1%
    .sort((a, b) => b.prob - a.prob); // tri du + probable au - probable
  
  // Probabilités utiles (Over/Under)
  const under25 = Object.entries(totalGoalsDist)
    .filter(([g]) => Number(g) <= 2)
    .reduce((s, [, p]) => s + p, 0);
  const over25 = Object.entries(totalGoalsDist)
    .filter(([g]) => Number(g) >= 3)
    .reduce((s, [, p]) => s + p, 0);
  
  // --- Affichage HTML ---
  let html = `<h3>Distribution du total de buts </h3>`;
  html += `<table><tr><th>Total de buts</th><th>Probabilité (%)</th></tr>`;
  results.forEach(r => {
    html += `<tr><td>${r.goals} buts</td><td>${(r.prob * 100).toFixed(2)}%</td></tr>`;
  });
  html += `</table>`;
  html += `<p><strong>Moins de 2.5 buts :</strong> ${(under25*100).toFixed(2)}%</p>`;
  html += `<p><strong>Plus de 2.5 buts :</strong> ${(over25*100).toFixed(2)}%</p>`;
  
  return html;
}

  // --- Affichage ---
  let html = `<hr />`
  html += `<h2>Top 10 scores les plus probables </h2>`;
  html += `<p><strong>λ Domicile :</strong> ${lambdaHome.toFixed(2)} | <strong>λ Extérieur :</strong> ${lambdaAway.toFixed(2)}</p>`;
  html += `<p><strong>Probabilité cumulée des 10 scores :</strong> ${(totalTopProb*100).toFixed(2)}%</p>`;
  html += `<table><tr><th>Score</th><th>Probabilité (%)</th></tr>`;
  top10.forEach(item => {
    html += `<tr><td>${item.score}</td><td>${(item.prob*100).toFixed(2)}%</td></tr>`;
  });
  html += `</table>`;

  // Affichage 1X2 et BTTS
  html+= `<hr />`
  html += `<h3 class="formula">Analyse supplémentaires </h3>`;
  html += `<p><strong>Victoire domicile :</strong> ${(homeWin/totalProb*100).toFixed(2)}%</p>`;
  html += `<p><strong>Match nul :</strong> ${(draw/totalProb*100).toFixed(2)}%</p>`;
  html += `<p><strong>Victoire visiteur :</strong> ${(awayWin/totalProb*100).toFixed(2)}%</p>`;
  html += `<p><strong>Les deux équipes marquent :</strong> ${(bttsYes/totalProb*100).toFixed(2)}%</p>`;
  html += `<p><strong>Au moins une ne marque pas :</strong> ${(bttsNo/totalProb*100).toFixed(2)}%</p>`;
  html += `<hr />`
  html += calculerTotaux(scores);
  document.getElementById("result").innerHTML = html;
}

// --- Dark Mode ---
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById("darkModeBtn");
  body.classList.toggle('dark-mode');

  if (body.classList.contains("dark-mode")) btn.textContent = "☀️";
  else btn.textContent = "🌙";
}