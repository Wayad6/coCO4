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

  // Scores 0–5
  const scores = [];
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const prob = poisson(i, lambdaHome) * poisson(j, lambdaAway);
      scores.push({ score: `${i} - ${j}`, prob });
    }
  }

  // Top 10
  scores.sort((a, b) => b.prob - a.prob);
  const top10 = scores.slice(0, 10);
  const totalProb = top10.reduce((sum, item) => sum + item.prob, 0);

  // --- Affichage ---
  let html = `<h2>Top 10 scores les plus probables </h2>`;
  html += `<p><strong>λ Domicile :</strong> ${lambdaHome.toFixed(2)} | <strong>λ Extérieur :</strong> ${lambdaAway.toFixed(2)}</p>`;
  html += `<p><strong>Probabilité cumulée des 10 scores :</strong> ${(totalProb*100).toFixed(2)}%</p>`;
  html += `<table><tr><th>Score</th><th>Probabilité (%)</th></tr>`;
  top10.forEach(item => {
    html += `<tr><td>${item.score}</td><td>${(item.prob*100).toFixed(2)}%</td></tr>`;
  });
  html += `</table>`;
  document.getElementById("result").innerHTML = html;
}