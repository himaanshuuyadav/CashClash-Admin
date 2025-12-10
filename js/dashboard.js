// Dashboard data management
function loadDashboardStats() {
    const tournaments = getTournaments();
    const withdrawals = getWithdrawals();
    
    // Update stats
    document.getElementById('totalTournaments').textContent = tournaments.length;
    document.getElementById('totalUsers').textContent = '150'; // Mock data
    document.getElementById('totalRevenue').textContent = '$' + calculateRevenue(tournaments);
    document.getElementById('pendingWithdrawals').textContent = withdrawals.filter(w => w.status === 'pending').length;
    
    // Load recent tournaments
    loadRecentTournaments();
}

function calculateRevenue(tournaments) {
    return tournaments.reduce((sum, t) => sum + (t.entryFee * t.currentPlayers || 0), 0).toFixed(2);
}

function loadRecentTournaments() {
    const tournaments = getTournaments();
    const recentTournaments = tournaments.slice(0, 5);
    const tbody = document.getElementById('recentTournaments');
    
    tbody.innerHTML = recentTournaments.map(t => `
        <tr>
            <td>${t.name}</td>
            <td><span class="status-badge status-${t.status}">${t.status}</span></td>
            <td>${t.currentPlayers}/${t.maxPlayers}</td>
            <td>$${t.prizePool}</td>
            <td>${new Date(t.startDate).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Get tournaments from localStorage
function getTournaments() {
    const tournaments = localStorage.getItem('tournaments');
    return tournaments ? JSON.parse(tournaments) : getMockTournaments();
}

// Mock data for initial setup
function getMockTournaments() {
    const mockData = [
        {
            id: 1,
            name: 'Clash Royale Championship',
            gameType: 'Free Fire',
            entryFee: 100,
            prizePool: 500,
            maxPlayers: 100,
            currentPlayers: 45,
            playersPerMatch: 10,
            totalRounds: 3,
            matchDuration: '10 Min',
            startDate: new Date(Date.now() - 3600000).toISOString(),
            rules: 'Squad mode, 10 players per match, top 3 advance',
            status: 'ongoing'
        },
        {
            id: 2,
            name: 'Mobile Legends Cup',
            gameType: 'Free Fire',
            entryFee: 50,
            prizePool: 300,
            maxPlayers: 50,
            currentPlayers: 12,
            playersPerMatch: 10,
            totalRounds: 2,
            matchDuration: '10 Min',
            startDate: new Date(Date.now() + 7200000).toISOString(),
            rules: 'Solo mode, 10 players per match',
            status: 'upcoming'
        }
    ];
    
    localStorage.setItem('tournaments', JSON.stringify(mockData));
    return mockData;
}

// Initialize dashboard
if (document.getElementById('recentTournaments')) {
    loadDashboardStats();
}
