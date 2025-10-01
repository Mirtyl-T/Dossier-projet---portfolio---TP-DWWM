const API_URL = 'http://localhost:3000/api';

async function checkApiStatus() {
    try {
        const response = await fetch(`${API_URL}/test`);
        const data = await response.json();
        const statusDiv = document.getElementById('apiStatus');
        
        if (data.success) {
            statusDiv.innerHTML = '<span class="status online">✓ API Connectée</span>';
            statusDiv.style.background = '#d4edda';
        } else {
            throw new Error('API non disponible');
        }
    } catch (error) {
        const statusDiv = document.getElementById('apiStatus');
        statusDiv.innerHTML = '<span class="status offline">✗ API Déconnectée</span>';
        statusDiv.style.background = '#f8d7da';
        console.error('Erreur API:', error);
    }
}

async function loadPlayers() {
    const listDiv = document.getElementById('playersList');
    listDiv.innerHTML = '<div class="loading">Chargement...</div>';

    try {
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            updateStats(data.data);
            displayPlayers(data.data);
        } else {
            listDiv.innerHTML = '<p style="text-align: center; color: #666;">Aucun joueur trouvé</p>';
        }
    } catch (error) {
        listDiv.innerHTML = '<p style="text-align: center; color: #e74c3c;">Erreur de chargement</p>';
        console.error('Erreur:', error);
    }
}

function updateStats(players) {
    document.getElementById('totalPlayers').textContent = players.length;
    
    const totalGames = players.reduce((sum, p) => sum + (p.gamesPlayed || 0), 0);
    document.getElementById('totalGames').textContent = totalGames;
    
    const avgScore = players.length > 0 
        ? Math.round(players.reduce((sum, p) => sum + (p.score || 0), 0) / players.length)
        : 0;
    document.getElementById('avgScore').textContent = avgScore;
    
    const topScore = Math.max(...players.map(p => p.score || 0), 0);
    document.getElementById('topScore').textContent = topScore;
}

function displayPlayers(players) {
    const listDiv = document.getElementById('playersList');
    listDiv.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-info">
                <div class="player-name">${player.username} (${player.nom})</div>
                <div class="player-details">
                     ${player.email} | 
                     Score: ${player.score || 0} | 
                     Parties: ${player.gamesPlayed || 0} | 
                    ${player.avis}
                </div>
            </div>
            <div class="player-actions">
                <button class="btn" onclick="editPlayer('${player._id}')">✏️ Modifier</button>
                <button class="btn btn-danger" onclick="deletePlayer('${player._id}', '${player.username}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function createPlayer() {
    const player = {
        nom: document.getElementById('newNom').value,
        username: document.getElementById('newUsername').value,
        email: document.getElementById('newEmail').value,
        avis: document.getElementById('newAvis').value,
        score: 0
    };

    if (!player.nom || !player.username || !player.email) {
        alert('Tous les champs sont requis');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Joueur créé avec succès!');
            toggleAddForm();
            loadPlayers();
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        alert('Erreur de création');
        console.error(error);
    }
}

async function deletePlayer(id, username) {
    if (!confirm(`Supprimer ${username} ?`)) return;

    try {
        const response = await fetch(`${API_URL}/players/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Joueur supprimé');
            loadPlayers();
        }
    } catch (error) {
        alert('Erreur de suppression');
        console.error(error);
    }
}

async function confirmDeleteAll() {
    if (!confirm(' ATTENTION: Supprimer TOUS les joueurs ?')) return;
    if (!confirm('Êtes-vous VRAIMENT sûr ?')) return;

    try {
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();
        
        for (const player of data.data) {
            await fetch(`${API_URL}/players/${player._id}`, { method: 'DELETE' });
        }
        
        alert('Tous les joueurs ont été supprimés');
        loadPlayers();
    } catch (error) {
        alert('Erreur');
        console.error(error);
    }
}

async function showLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard/top?limit=10`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            displayPlayers(data.data);
        }
    } catch (error) {
        console.error(error);
    }
}

function toggleAddForm() {
    const form = document.getElementById('addPlayerForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function editPlayer(id) {
    alert('Fonction de modification à venir...\nID: ' + id);
}

// Initialisation
checkApiStatus();
loadPlayers();
setInterval(checkApiStatus, 30000); // Vérifier l'API toutes les 30s
