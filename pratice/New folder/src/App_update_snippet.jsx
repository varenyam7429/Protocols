import playersData from './assets/players.json';

// ... inside App component ...
// Replace generatePlayers call
useEffect(() => {
    const storedState = localStorage.getItem('iplAuctionState');
    if (storedState) {
        // ... load state
    } else {
        // Initialize with imported data
        // Ensure IDs are unique if JSON doesn't provide them reliably, but our script did.
        // But players.json has "id": "p-1" etc.
        // However, App.jsx uses "p-{index+1}". The JSON IDs are fine.
        // Need to add status: 'Unsold', soldPrice: 0, soldTo: null if not in JSON.
        // Our script added those fields.
        setPlayers(playersData);
    }
}, []);
