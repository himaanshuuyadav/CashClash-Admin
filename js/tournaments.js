// Firebase is already initialized in auth.js
// Just get references to Firestore
const db = firebase.firestore();
const tournamentsRef = db.collection('tournaments');

// Tournament management
let editingTournamentId = null;

async function loadTournaments() {
    try {
        const snapshot = await tournamentsRef.orderBy('createdAt', 'desc').get();
        const tournaments = [];
        
        snapshot.forEach((doc) => {
            tournaments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayTournaments(tournaments);
    } catch (error) {
        console.error('Error loading tournaments:', error);
        alert('Error loading tournaments: ' + error.message);
    }
}

function displayTournaments(tournaments) {
    const tbody = document.getElementById('tournamentsTable');
    
    if (tournaments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #94A3B8;">No tournaments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = tournaments.map(t => {
        const startDate = new Date(t.startTime);
        const categoryBadge = t.category || 'Unknown';
        const categoryColor = t.category === 'Bermuda' ? '#10b981' : '#7c3aed';
        
        return `
            <tr>
                <td>#${t.id.substring(0, 6)}</td>
                <td>
                    <div>${t.title}</div>
                    <div style="font-size: 12px; color: ${categoryColor}; margin-top: 4px;">
                        ${categoryBadge}
                    </div>
                </td>
                <td>₹${t.entryFee}</td>
                <td>₹${t.prizePool.toLocaleString()}</td>
                <td>${t.currentPlayers || 0}/${t.maxPlayers}</td>
                <td><span class="status-badge status-${t.status.toLowerCase()}">${t.status}</span></td>
                <td>${startDate.toLocaleString('en-IN', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editTournament('${t.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteTournament('${t.id}', '${t.title.replace(/'/g, "\\'")}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterTournaments() {
    const filter = document.getElementById('statusFilter').value;
    
    if (filter === 'all') {
        loadTournaments();
    } else {
        tournamentsRef.where('status', '==', filter.toUpperCase())
            .orderBy('createdAt', 'desc')
            .get()
            .then((snapshot) => {
                const tournaments = [];
                snapshot.forEach((doc) => {
                    tournaments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                displayTournaments(tournaments);
            })
            .catch((error) => {
                console.error('Error filtering tournaments:', error);
            });
    }
}

// Modal functions
function showCreateModal() {
    document.getElementById('createModal').style.display = 'block';
    document.getElementById('createTournamentForm').reset();
    document.getElementById('categoryInfo').style.display = 'none';
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
}

function updateCategoryInfo() {
    const category = document.getElementById('category').value;
    const infoDiv = document.getElementById('categoryInfo');
    const detailsDiv = document.getElementById('categoryDetails');
    
    if (!category) {
        infoDiv.style.display = 'none';
        return;
    }
    
    let details = '';
    if (category === 'Bermuda') {
        details = `
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Entry Fee:</strong> ₹7</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Max Players:</strong> 48</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Per Kill Reward:</strong> ₹5</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Booyah (Winner):</strong> ₹20 + Kill Rewards</p>
            <p style="margin: 4px 0; font-size: 12px; color: #94a3b8;">Example: Winner with 10 kills = ₹70</p>
        `;
    } else if (category === 'Clash Squad 1v1') {
        details = `
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Entry Fee:</strong> ₹20</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Max Players:</strong> 2</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Winner Prize:</strong> ₹30</p>
            <p style="margin: 4px 0; font-size: 12px; color: #94a3b8;">1v1 Match - Winner takes all!</p>
        `;
    } else if (category === 'Clash Squad 2v2') {
        details = `
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Entry Fee:</strong> ₹20</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Max Players:</strong> 4</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Winning Team:</strong> ₹60</p>
            <p style="margin: 4px 0; font-size: 12px; color: #94a3b8;">Team shares ₹60 (₹30 per player)</p>
        `;
    }
    
    detailsDiv.innerHTML = details;
    infoDiv.style.display = 'block';
}

function showResultsModal(tournamentId) {
    document.getElementById('resultsModal').style.display = 'block';
    document.getElementById('resultTournamentId').value = tournamentId;
}

function closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
}

// Create tournament form handler
if (document.getElementById('createTournamentForm')) {
    document.getElementById('createTournamentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        try {
            const tournamentName = document.getElementById('tournamentName').value;
            const category = document.getElementById('category').value;
            const timeValue = document.getElementById('startTime').value;
            
            // Create date for today with the specified time
            const today = new Date();
            const [hours, minutes] = timeValue.split(':');
            today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Set category-specific values
            let entryFee, maxPlayers, perKillReward, winnerPrize, prizePool;
            let appCategory; // Category displayed in app
            
            if (category === 'Bermuda') {
                entryFee = 7;
                maxPlayers = 48;
                perKillReward = 5;
                winnerPrize = 20;
                prizePool = entryFee * maxPlayers; // Total pool
                appCategory = 'Bermuda';
            } else if (category === 'Clash Squad 1v1') {
                entryFee = 20;
                maxPlayers = 2;
                perKillReward = 0;
                winnerPrize = 30;
                prizePool = 30;
                appCategory = 'Clash Squad';
            } else if (category === 'Clash Squad 2v2') {
                entryFee = 20;
                maxPlayers = 4;
                perKillReward = 0;
                winnerPrize = 60;
                prizePool = 60;
                appCategory = 'Clash Squad';
            }
            
            const tournament = {
                title: tournamentName,
                category: category, // Store full category (Bermuda/Clash Squad 1v1/Clash Squad 2v2)
                coverImage: 'https://i.imgur.com/placeholder.jpg',
                entryFee: entryFee,
                prizePool: prizePool,
                firstPlacePrize: winnerPrize, // For compatibility
                secondPlacePrize: 0,
                thirdPlacePrize: 0,
                perKillReward: perKillReward,
                winnerPrize: winnerPrize,
                maxPlayers: maxPlayers,
                currentPlayers: 0,
                playersPerMatch: maxPlayers,
                totalRounds: 1,
                currentRound: 1,
                matchDuration: category === 'Bermuda' ? '20-25 min' : '10-15 min',
                startTime: today.getTime(),
                status: 'OPEN',
                rules: getRulesForCategory(category),
                roomId: null,
                roomPassword: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await tournamentsRef.add(tournament);
            console.log('Tournament created with ID:', docRef.id);
            
            closeCreateModal();
            loadTournaments();
            alert('Tournament created successfully!');
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Error creating tournament: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Tournament';
        }
    });
}

function getRulesForCategory(category) {
    if (category === 'Bermuda') {
        return `📋 BERMUDA SOLO TOURNAMENT RULES:

1. Maximum 48 players
2. Entry Fee: ₹7
3. Per Kill Reward: ₹5
4. Booyah (Winner) Reward: ₹20 + Total Kill Rewards

🎯 PRIZE CALCULATION:
• Each elimination = ₹5
• Winner gets ₹20 + (Total Kills × ₹5)
• Example: Winner with 10 kills = ₹20 + ₹50 = ₹70

📝 RULES:
• Room ID and Password will be shared 10 minutes before match
• Join the room on time
• Screenshot proof of kills and result required
• Any cheating/hacking will result in disqualification
• Admin decision is final`;
    } else if (category === 'Clash Squad 1v1') {
        return `📋 CLASH SQUAD 1v1 TOURNAMENT RULES:

1. 2 Players (1v1 Match)
2. Entry Fee: ₹20 per player
3. Winner Prize: ₹30

🎯 PRIZE:
• Winner: ₹30
• No kill rewards

📝 RULES:
• Best of 1 round
• Room ID and Password will be shared before match
• Join the room on time
• Screenshot proof of result required
• Any cheating/hacking will result in disqualification
• Admin decision is final`;
    } else if (category === 'Clash Squad 2v2') {
        return `📋 CLASH SQUAD 2v2 TOURNAMENT RULES:

1. 4 Players (2v2 Match)
2. Entry Fee: ₹20 per player
3. Winning Team Prize: ₹60 (₹30 per player)

🎯 PRIZE:
• Winning Team: ₹60 total
• Each winner gets ₹30
• No kill rewards

📝 RULES:
• Best of 1 round
• Room ID and Password will be shared before match
• Join with your teammate
• Screenshot proof of result required
• Any cheating/hacking will result in disqualification
• Admin decision is final`;
    }
    return 'Tournament rules will be announced.';
}

// Results form handler
if (document.getElementById('resultsForm')) {
    document.getElementById('resultsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const tournamentId = document.getElementById('resultTournamentId').value;
        
        try {
            await tournamentsRef.doc(tournamentId).update({
                status: 'COMPLETED',
                winner: document.getElementById('winnerName').value,
                winnerKills: parseInt(document.getElementById('winnerKills').value),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeResultsModal();
            loadTournaments();
            alert('Results saved successfully!');
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Error saving results: ' + error.message);
        }
    });
}

function editTournament(id) {
    alert('Edit functionality coming soon! Tournament ID: ' + id);
    // TODO: Implement edit functionality
}

async function deleteTournament(id, title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        try {
            await tournamentsRef.doc(id).delete();
            loadTournaments();
            alert('Tournament deleted successfully!');
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Error deleting tournament: ' + error.message);
        }
    }
}

// Initialize
if (document.getElementById('tournamentsTable')) {
    loadTournaments();
    
    // Real-time updates
    tournamentsRef.onSnapshot(() => {
        loadTournaments();
    });
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
