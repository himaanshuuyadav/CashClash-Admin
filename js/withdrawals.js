// Withdrawal management
function getWithdrawals() {
    const withdrawals = localStorage.getItem('withdrawals');
    return withdrawals ? JSON.parse(withdrawals) : getMockWithdrawals();
}

function getMockWithdrawals() {
    const mockData = [
        {
            id: 1,
            userId: 'user123',
            userName: 'Alex Ryder',
            amount: 150.00,
            method: 'UPI',
            accountDetails: 'alex@upi',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'pending'
        },
        {
            id: 2,
            userId: 'user456',
            userName: 'John Doe',
            amount: 75.50,
            method: 'Paytm',
            accountDetails: '9876543210',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'pending'
        },
        {
            id: 3,
            userId: 'user789',
            userName: 'Sarah Smith',
            amount: 200.00,
            method: 'UPI',
            accountDetails: 'sarah@paytm',
            date: new Date(Date.now() - 259200000).toISOString(),
            status: 'approved'
        }
    ];
    
    localStorage.setItem('withdrawals', JSON.stringify(mockData));
    return mockData;
}

function loadWithdrawals() {
    const withdrawals = getWithdrawals();
    displayWithdrawals(withdrawals);
}

function displayWithdrawals(withdrawals) {
    const tbody = document.getElementById('withdrawalsTable');
    
    tbody.innerHTML = withdrawals.map(w => `
        <tr>
            <td>#${w.id}</td>
            <td>${w.userName}</td>
            <td>$${w.amount.toFixed(2)}</td>
            <td>${w.method}</td>
            <td>${w.accountDetails}</td>
            <td>${new Date(w.date).toLocaleString()}</td>
            <td><span class="status-badge status-${w.status}">${w.status}</span></td>
            <td>
                ${w.status === 'pending' ? 
                    `<button class="btn btn-success" onclick="approveWithdrawal(${w.id})">Approve</button>
                     <button class="btn btn-danger" onclick="declineWithdrawal(${w.id})">Decline</button>` :
                    `<span class="status-badge status-${w.status}">${w.status}</span>`
                }
            </td>
        </tr>
    `).join('');
}

function filterWithdrawals() {
    const filter = document.getElementById('statusFilter').value;
    const withdrawals = getWithdrawals();
    
    if (filter === 'all') {
        displayWithdrawals(withdrawals);
    } else {
        const filtered = withdrawals.filter(w => w.status === filter);
        displayWithdrawals(filtered);
    }
}

function approveWithdrawal(id) {
    if (confirm('Are you sure you want to approve this withdrawal?')) {
        const withdrawals = getWithdrawals();
        const withdrawal = withdrawals.find(w => w.id === id);
        
        if (withdrawal) {
            withdrawal.status = 'approved';
            withdrawal.approvedDate = new Date().toISOString();
            localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
            loadWithdrawals();
            alert('Withdrawal approved successfully!');
        }
    }
}

function declineWithdrawal(id) {
    if (confirm('Are you sure you want to decline this withdrawal?')) {
        const withdrawals = getWithdrawals();
        const withdrawal = withdrawals.find(w => w.id === id);
        
        if (withdrawal) {
            withdrawal.status = 'declined';
            withdrawal.declinedDate = new Date().toISOString();
            localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
            loadWithdrawals();
            alert('Withdrawal declined.');
        }
    }
}

// Initialize
if (document.getElementById('withdrawalsTable')) {
    loadWithdrawals();
}
