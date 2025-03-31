const cachePokemons = {};
let fuseButton;
let selectedLanguage = "en";
let selectedAbilityIndices = { A: 0, B: 0 };

initialize();

function initialize() {
  document.addEventListener("DOMContentLoaded", documentLoaded);
}

function documentLoaded() {
  fuseButton = document.getElementById("fuse-button");
  updateFuseButton();
}

function changeLanguage() {
  const languageSelect = document.querySelector(".language-selector select");
  selectedLanguage = languageSelect.value;
}

function searchPokemon(pokemonId) {
  const searchInput = document.getElementById(`search${pokemonId}`).value;

  if (searchInput.length >= 3) {
    fetch(`http://82.64.152.244:27350/search/${selectedLanguage}/${searchInput}`)
      .then((response) => response.json())
      .then((data) => {
        // Affichage des suggestions sous la textbox
        displaySuggestions(pokemonId, data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else {
    clearSuggestions(pokemonId);
  }
}

function displaySuggestions(pokemonDivID, data) {
  const suggestionsDiv = document.getElementById(`pokemon${pokemonDivID}-suggestions`);

  suggestionsDiv.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach((pokemon) => {
      const suggestion = document.createElement("div");
      const nameProperty = `name_${selectedLanguage}`;
      suggestion.textContent = pokemon[nameProperty] || pokemon.name_en;
      suggestion.onclick = () => selectPokemon(pokemonDivID, pokemon.id);
      suggestionsDiv.appendChild(suggestion);
    });
  } else {
    suggestionsDiv.innerHTML = "No Pokémon found";
  }
}

//======================
// CLEAR THE SUGGESTIONS
//======================
function clearSuggestions(pokemonId) {
  const suggestionsDiv = document.getElementById(`pokemon${pokemonId}-suggestions`);
  suggestionsDiv.innerHTML = "";
}

// Fonction appelée lorsque l'utilisateur clique sur une suggestion
function selectPokemon(pokemonDivID, pokemonID) {
  const urlSpriteImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokemonID + ".png";

  const searchBar = document.getElementById(`search${pokemonDivID}`);
  const pokemonCard = document.getElementById(`pokemon${pokemonDivID}`);
  const pokemonNameDiv = document.getElementById(`pokemon${pokemonDivID}-name`);
  const pokemonImageDiv = document.getElementById(`pokemon${pokemonDivID}-image`);
  const pokemonStatsDiv = document.getElementById(`pokemon${pokemonDivID}-stats`);
  const pokemonTypesDiv = document.getElementById(`pokemon${pokemonDivID}-types`);
  const pokemonAbilitiesDiv = document.getElementById(`pokemon${pokemonDivID}-abilities`);
  const pokemonHiddenAbilityDiv = document.getElementById(`pokemon${pokemonDivID}-hidden-ability`);

  fetch(`http://82.64.152.244:27350/pokemons/${pokemonID}`)
    .then((response) => response.json())
    .then((data) => {
      pokemonNameDiv.innerHTML = `${data.name_en} <span style="color: #4a5568; font-size: 0.9em; margin-left: 8px;">#${data.id}</span>`;
      pokemonStatsDiv.innerHTML = renderStats(data.stats);
      pokemonTypesDiv.innerHTML = renderTypes(data.types);
      pokemonAbilitiesDiv.innerHTML = renderAbilities(data.abilities, pokemonDivID);
      pokemonHiddenAbilityDiv.innerHTML = renderHiddenAbility(data.passive, pokemonDivID);

      pokemonImageDiv.innerHTML = `<img src="${urlSpriteImage}" alt="${data.name_en}" />`;

      cachePokemons[pokemonDivID] = data;
      pokemonCard.classList.add("visible");

      // Sélectionner automatiquement la première capacité
      if (data.abilities && data.abilities.length > 0) {
        toggleAbilityDescription(0, pokemonDivID);
      }

      // Sélectionner automatiquement l'ability cachée
      if (data.passive) {
        toggleHiddenAbilityDescription(data.passive.name, pokemonDivID);
      }

      updateFuseButton();
      updateFusionSymbols();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);

      cachePokemons[pokemonDivID] = undefined;
      pokemonCard.classList.remove("visible");

      updateFuseButton();
      updateFusionSymbols();
    });

  searchBar.value = "";
  clearSuggestions(pokemonDivID);
}

function updateFuseButton() {
  if (cachePokemons["A"] != undefined && cachePokemons["B"] != undefined) {
    fuseButton.disabled = false;
  } else {
    fuseButton.disabled = true;
  }
  updateFusionSymbols();
}

function updateFusionSymbols() {
  const plusSymbol = document.querySelector('.fusion-symbol:nth-child(2)');
  const equalsSymbol = document.querySelector('.fusion-symbol:nth-child(4)');
  
  // Afficher le + si A et B sont visibles
  plusSymbol.style.display = (cachePokemons["A"] && cachePokemons["B"]) ? 'flex' : 'none';
  
  // Afficher le = si la fusion est visible
  equalsSymbol.style.display = document.getElementById('pokemonFused').classList.contains('visible') ? 'flex' : 'none';
}

function getColorFromString(colorString) {
  const colorMap = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'green': '#00FF00',
    'black': '#000000',
    'brown': '#A52A2A',
    'purple': '#800080',
    'gray': '#808080',
    'white': '#FFFFFF',
    'pink': '#FFC0CB'
  };
  return colorMap[colorString.toLowerCase()] || '#FFFFFF';
}

function fuseClick() {
  var fusion = fusePokemon(cachePokemons["A"], cachePokemons["B"]);

  const pokemonFusedCard = document.getElementById("pokemonFused");
  const pokemonFusedNameDiv = document.getElementById("pokemonFused-name");
  const pokemonFusedImageDiv = document.getElementById("pokemonFused-image");
  const pokemonFusedStatsDiv = document.getElementById("pokemonFused-stats");
  const pokemonFusedTypesDiv = document.getElementById("pokemonFused-types");
  const pokemonFusedAbilitiesDiv = document.getElementById("pokemonFused-abilities");
  const pokemonFusedHiddenAbilityDiv = document.getElementById("pokemonFused-hidden-ability");

  // Afficher les informations du Pokémon fusionné
  pokemonFusedNameDiv.innerHTML = fusion.name_en;
  pokemonFusedStatsDiv.innerHTML = renderStats(fusion.stats);
  pokemonFusedTypesDiv.innerHTML = renderTypes(fusion.types);
  pokemonFusedAbilitiesDiv.innerHTML = renderAbilities([{ 
    name: fusion.ability, 
    description: cachePokemons["A"].abilities[selectedAbilityIndices["A"]].description 
  }], 'Fused');
  pokemonFusedHiddenAbilityDiv.innerHTML = renderHiddenAbility(fusion.passive, 'Fused');

  // Sélectionner automatiquement l'ability du Pokémon fusionné
  toggleAbilityDescription(0, 'Fused');

  // Sélectionner automatiquement l'ability cachée du Pokémon fusionné
  if (fusion.passive) {
    toggleHiddenAbilityDescription(fusion.passive.name, 'Fused');
  }

  // Utiliser l'image du Pokémon A avec la couleur du Pokémon B
  const urlSpriteImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + cachePokemons["A"].id + ".png";
  const color = getColorFromString(cachePokemons["B"].color);
  
  // Calculer l'angle de rotation de la teinte en fonction de la couleur
  let hueRotation = 0;
  switch(cachePokemons["B"].color.toLowerCase()) {
    case 'red': hueRotation = 0; break;
    case 'blue': hueRotation = 240; break;
    case 'yellow': hueRotation = 60; break;
    case 'green': hueRotation = 120; break;
    case 'purple': hueRotation = 300; break;
    case 'pink': hueRotation = 330; break;
    case 'brown': hueRotation = 30; break;
    case 'gray': hueRotation = 0; break;
    case 'white': hueRotation = 0; break;
    case 'black': hueRotation = 0; break;
  }

  pokemonFusedImageDiv.innerHTML = `
    <div style="position: relative; width: 150px; height: 150px;">
      <img src="${urlSpriteImage}" alt="${fusion.name_en}" style="position: absolute; width: 100%; height: 100%; object-fit: contain; filter: sepia(100%) saturate(300%) hue-rotate(${hueRotation}deg) brightness(90%);" />
    </div>
  `;

  // Afficher la carte
  pokemonFusedCard.classList.add("visible");
  updateFusionSymbols();

  fetch(`http://82.64.152.244:27350/fusions/${cachePokemons["A"].id}/${cachePokemons["B"].id}`).catch((error) => {
    console.error("Error fetch fusions", error);
  });
}

function fusePokemon(pokemonA, pokemonB) {
  const fusedAbility = pokemonA.abilities[selectedAbilityIndices["A"]].name;

  // Fusionner les types en évitant les doublons
  const fusedTypes = [];
  const typeA = pokemonA.types[0];
  const typeB = pokemonB.types.length > 1 ? pokemonB.types[1] : pokemonB.types[0];
  
  if (typeA === typeB) {
    fusedTypes.push(typeA);
  } else {
    fusedTypes.push(typeA, typeB);
  }

  // Fusionner les stats en prenant la moyenne
  const fusedStats = pokemonA.stats.map((statA, index) => {
    const statB = pokemonB.stats[index];
    const averageStat = Math.round((statA.base_stat + statB.base_stat) / 2);
    return {
      stat: statA.stat,
      base_stat: averageStat,
    };
  });

  // Créer le Pokémon fusionné
  const fusedPokemon = {
    id: `${pokemonA.id}-${pokemonB.id}`,
    name_en: getFusedSpeciesName(pokemonA.name_en, pokemonB.name_en),
    ability: fusedAbility,
    types: fusedTypes,
    stats: fusedStats,
    passive: pokemonB.passive,
  };

  return fusedPokemon;
}

// Fonction pour afficher les stats
function renderStats(stats) {
  return stats
    .map((stat) => {
      const statName = stat.stat.replace("-", " ");
      const statClass = stat.stat.replace("-", "-");
      const width = (stat.base_stat / 255) * 100; // 255 est la stat maximale possible

      // Raccourcir les noms des stats
      let shortName = statName;
      switch (statName.toLowerCase()) {
        case "hp":
          shortName = "HP";
          break;
        case "attack":
          shortName = "ATK";
          break;
        case "defense":
          shortName = "DEF";
          break;
        case "special attack":
          shortName = "SPA";
          break;
        case "special defense":
          shortName = "SPD";
          break;
        case "speed":
          shortName = "SPE";
          break;
      }

      // Déterminer la couleur en fonction de la valeur
      let statColor;
      if (stat.base_stat <= 30) statColor = "#FF0000"; // Rouge
      else if (stat.base_stat <= 60) statColor = "#FFA500"; // Orange
      else if (stat.base_stat <= 90) statColor = "#FFD700"; // Jaune
      else if (stat.base_stat <= 120) statColor = "#90EE90"; // Vert clair
      else if (stat.base_stat <= 150) statColor = "#32CD32"; // Vert
      else if (stat.base_stat <= 180) statColor = "#006400"; // Vert foncé
      else statColor = "#19b3da"; // Bleu

      return `
      <div class="stat-bar stat-${statClass}">
        <div class="stat-name">${shortName}</div>
        <div class="stat-value">${stat.base_stat}</div>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${width}%; background-color: ${statColor}"></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Fonction pour afficher les types
function renderTypes(types) {
  return types.map(type => {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    return `<div style="display: inline-flex; align-items: center; gap: 5px; margin: 0 5px;">
      <img src="images/types/${type}.png" alt="${typeName}" style="width: 20px; height: 20px;">
      <span style="font-weight: bold;">${typeName}</span>
    </div>`;
  }).join("");
}

// Fonction pour formater le nom d'une capacité
function formatAbilityName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fonction pour formater la description d'une capacité
function formatAbilityDescription(description) {
  return description.split('\n')[0];
}

// Fonction pour afficher les abilities
function renderAbilities(abilities, pokemonId) {
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
      ${abilities.map((ability, index) => `
        <button class="ability-button" onclick="toggleAbilityDescription(${index}, '${pokemonId}')" style="
          background-color: #4b5563;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        ">
          <span>${formatAbilityName(ability.name)}</span>
        </button>
      `).join("")}
    </div>
    <div style="margin-top: 10px;">
      ${abilities.map((ability, index) => `
        <div class="ability-description" id="ability-${index}" style="
          display: none;
          padding: 10px;
          background-color: #374151;
          border-radius: 4px;
          margin-top: 5px;
          font-size: 0.85rem;
          line-height: 1.4;
        ">${formatAbilityDescription(ability.description)}</div>
      `).join("")}
    </div>
  `;
}

// Fonction pour basculer l'affichage de la description d'une capacité
function toggleAbilityDescription(selectedIndex, pokemonId) {
  // Récupérer tous les boutons et descriptions pour ce Pokémon spécifique
  const card = document.getElementById(`pokemon${pokemonId}`);
  const buttons = card.querySelectorAll('.ability-button');
  const descriptions = card.querySelectorAll('.ability-description');
  
  // Désélectionner tous les boutons et cacher toutes les descriptions
  buttons.forEach((button, index) => {
    if (index === selectedIndex) {
      button.style.backgroundColor = '#6b7280';
    } else {
      button.style.backgroundColor = '#4b5563';
    }
  });
  
  descriptions.forEach((description, index) => {
    description.style.display = index === selectedIndex ? 'block' : 'none';
  });

  // Mettre à jour l'index de la capacité sélectionnée pour ce Pokémon
  selectedAbilityIndices[pokemonId] = selectedIndex;
}

// Fonction pour afficher l'ability cachée
function renderHiddenAbility(hiddenAbility, pokemonId) {
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
      <button class="ability-button" onclick="toggleHiddenAbilityDescription('${hiddenAbility.name}', '${pokemonId}')" style="
        background-color: #4b5563;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 6px;
        font-family: 'Quicksand', sans-serif;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        font-style: italic;
      ">
        <span>${formatAbilityName(hiddenAbility.name)} <span style="color: #fbbf24; margin-left: 4px;">★</span></span>
      </button>
    </div>
    <div style="margin-top: 10px;">
      <div class="ability-description" id="hidden-ability-description-${pokemonId}" style="
        display: none;
        padding: 10px;
        background-color: #374151;
        border-radius: 4px;
        margin-top: 5px;
        font-size: 0.85rem;
        line-height: 1.4;
      ">${formatAbilityDescription(hiddenAbility.description)}</div>
    </div>
  `;
}

// Fonction pour basculer l'affichage de la description de l'ability cachée
function toggleHiddenAbilityDescription(abilityName, pokemonId) {
  const button = document.querySelector(`button[onclick="toggleHiddenAbilityDescription('${abilityName}', '${pokemonId}')"]`);
  const description = document.getElementById(`hidden-ability-description-${pokemonId}`);
  
  if (description.style.display === 'none') {
    description.style.display = 'block';
    button.style.backgroundColor = '#6b7280';
  } else {
    description.style.display = 'none';
    button.style.backgroundColor = '#4b5563';
  }
}

function getFusedSpeciesName(nameA, nameB) {
  // Prendre la première moitié du nom du premier Pokémon et la deuxième moitié du second
  const halfLengthA = Math.floor(nameA.length / 2);
  const halfLengthB = Math.floor(nameB.length / 2);

  const firstHalf = nameA.substring(0, halfLengthA);
  const secondHalf = nameB.substring(halfLengthB);

  return firstHalf + secondHalf;
}

function swapPokemons() {
  // Échanger les valeurs des champs de recherche
  const searchA = document.getElementById("searchA");
  const searchB = document.getElementById("searchB");
  const tempValue = searchA.value;
  searchA.value = searchB.value;
  searchB.value = tempValue;

  // Échanger les Pokémon dans le cache
  const tempPokemon = cachePokemons["A"];
  cachePokemons["A"] = cachePokemons["B"];
  cachePokemons["B"] = tempPokemon;

  // Mettre à jour l'affichage des cartes
  if (cachePokemons["A"]) {
    selectPokemon("A", cachePokemons["A"].id);
  } else {
    document.getElementById("pokemonA").classList.remove("visible");
  }

  if (cachePokemons["B"]) {
    selectPokemon("B", cachePokemons["B"].id);
  } else {
    document.getElementById("pokemonB").classList.remove("visible");
  }

  // Rafraîchir la fusion si elle existe
  const pokemonFusedCard = document.getElementById("pokemonFused");
  if (pokemonFusedCard.classList.contains("visible")) {
    fuseClick();
  }

  // Mettre à jour le bouton de fusion
  updateFuseButton();
}
