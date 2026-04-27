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
      showError(field.id, `Requis.`);
      valid = false;
    } else if (Number(value) < 0) {
      showError(field.id, `Doit être positif.`);
      valid = false;
    }
  });

  const hMVal = Number(document.getElementById("homeMatches").value);
  const aMVal = Number(document.getElementById("awayMatches").value);
  if (hMVal === 0) { showError("homeMatches", "Doit être > 0."); valid = false; }
  if (aMVal === 0) { showError("awayMatches", "Doit être > 0."); valid = false; }

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

  // --- Calcul des pourcentages 1X2 et BTTS sur tous les scores ---
  let homeWin = 0, draw = 0, awayWin = 0;
  let bttsYes = 0, bttsNo = 0;

  scores.forEach(item => {
    const [h, a] = item.score.split(" - ").map(Number);
    if (h > a) homeWin += item.prob;
    else if (h === a) draw += item.prob;
    else awayWin += item.prob;

    if (h > 0 && a > 0) bttsYes += item.prob;
    else bttsNo += item.prob;
  });

  const totalProb = homeWin + draw + awayWin;

  // --- Distribution des totaux de buts ---
  function getTotauxHtml(scores) {
    const totalGoalsDist = {};
    scores.forEach(item => {
      const [h, a] = item.score.split(" - ").map(Number);
      const total = h + a;
      if (!totalGoalsDist[total]) totalGoalsDist[total] = 0;
      totalGoalsDist[total] += item.prob;
    });
    
    const results = Object.entries(totalGoalsDist)
      .map(([goals, prob]) => ({ goals: Number(goals), prob }))
      .filter(r => r.prob >= 0.05) // Top probabilités
      .sort((a, b) => b.prob - a.prob);
    
    const under25 = Object.entries(totalGoalsDist)
      .filter(([g]) => Number(g) <= 2)
      .reduce((s, [, p]) => s + p, 0);
    const over25 = Object.entries(totalGoalsDist)
      .filter(([g]) => Number(g) >= 3)
      .reduce((s, [, p]) => s + p, 0);
    
    let html = `<div class="result-card"><h3>Distribution des buts</h3><table>`;
    results.slice(0, 5).forEach(r => {
      html += `<tr><td>Total ${r.goals} buts</td><td>${(r.prob * 100).toFixed(1)}%</td></tr>`;
    });
    html += `</table>`;
    html += `<div class="analysis-grid">
      <div class="analysis-item"><span class="analysis-label">Moins 2.5</span><span class="analysis-value">${(under25*100).toFixed(1)}%</span></div>
      <div class="analysis-item"><span class="analysis-label">Plus 2.5</span><span class="analysis-value">${(over25*100).toFixed(1)}%</span></div>
    </div></div>`;
    
    return html;
  }

  // --- Construction du HTML final ---
  let html = `<div class="result-card">
    <h2>Analyse du Match</h2>
    <div class="analysis-grid">
      <div class="analysis-item"><span class="analysis-label">λ Domicile</span><span class="analysis-value">${lambdaHome.toFixed(2)}</span></div>
      <div class="analysis-item"><span class="analysis-label">λ Extérieur</span><span class="analysis-value">${lambdaAway.toFixed(2)}</span></div>
    </div>
    
    <div class="analysis-grid" style="margin-top: 1rem;">
      <div class="analysis-item"><span class="analysis-label">Victoire Dom.</span><span class="analysis-value">${(homeWin/totalProb*100).toFixed(1)}%</span></div>
      <div class="analysis-item"><span class="analysis-label">Match Nul</span><span class="analysis-value">${(draw/totalProb*100).toFixed(1)}%</span></div>
      <div class="analysis-item"><span class="analysis-label">Victoire Ext.</span><span class="analysis-value">${(awayWin/totalProb*100).toFixed(1)}%</span></div>
    </div>
  </div>`;

  html += `<div class="result-card">
    <h3>Top 10 Scores Probables</h3>
    <table>
      <thead><tr><th>Score</th><th>Probabilité</th></tr></thead>
      <tbody>`;
  top10.forEach(item => {
    html += `<tr><td>${item.score}</td><td>${(item.prob*100).toFixed(1)}%</td></tr>`;
  });
  html += `</tbody></table></div>`;

  html += `<div class="result-card">
    <h3>Les deux marquent (BTTS)</h3>
    <div class="analysis-grid">
      <div class="analysis-item"><span class="analysis-label">OUI</span><span class="analysis-value">${(bttsYes/totalProb*100).toFixed(1)}%</span></div>
      <div class="analysis-item"><span class="analysis-label">NON</span><span class="analysis-value">${(bttsNo/totalProb*100).toFixed(1)}%</span></div>
    </div>
  </div>`;

  html += getTotauxHtml(scores);

  document.getElementById("result").innerHTML = html;
  document.getElementById("result").scrollIntoView({ behavior: 'smooth' });
}

// --- Dark Mode ---
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById("darkModeBtn");
  body.classList.toggle('dark-mode');

  if (body.classList.contains("dark-mode")) {
    btn.textContent = "☀️";
    localStorage.setItem('theme', 'dark');
  } else {
    btn.textContent = "🌙";
    localStorage.setItem('theme', 'light');
  }
}

// Persistence du thème
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  document.getElementById("darkModeBtn").textContent = "☀️";
}