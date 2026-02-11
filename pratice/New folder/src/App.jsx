import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Gavel,
    History,
    RotateCcw,
    Download,
    Search,
    Filter,
    Trophy,
    Wallet,
    Settings,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import playersData from './assets/players.json';

// --- Initial Data ---

const INITIAL_TEAMS = [
    { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', color: 'bg-yellow-500', purse: 200, roster: [] },
    { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', color: 'bg-blue-600', purse: 200, roster: [] },
    { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', color: 'bg-teal-700', purse: 200, roster: [] },
    { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', color: 'bg-purple-800', purse: 200, roster: [] },
    { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', color: 'bg-cyan-600', purse: 200, roster: [] },
    { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', color: 'bg-blue-800', purse: 200, roster: [] },
    { id: 'pbks', name: 'Punjab Kings', shortName: 'PBKS', color: 'bg-red-600', purse: 200, roster: [] },
    { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', color: 'bg-pink-600', purse: 200, roster: [] },
    { id: 'rcb', name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: 'bg-red-700', purse: 200, roster: [] },
    { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: 'bg-orange-600', purse: 200, roster: [] },
];

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];


// Mock Player Data Generator - REPLACED BY JSON IMPORT
// const generatePlayers = () => { ... }


// --- Components ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

const Header = ({ onManagePurses, onUndo, onExport }) => (
    <header className="bg-indigo-950 text-white p-4 shadow-lg sticky top-0 z-40 border-b border-indigo-900">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg text-indigo-950">
                    <Trophy size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic">IPL Auction Hub</h1>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onUndo}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-all border border-gray-600"
                >
                    <RotateCcw size={18} />
                    <span className="hidden sm:inline">Undo</span>
                </button>
                <button
                    onClick={onManagePurses}
                    className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg font-semibold transition-all border border-indigo-500"
                >
                    <Settings size={18} />
                    <span className="hidden sm:inline">Settings</span>
                </button>
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold transition-all border border-emerald-500"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export</span>
                </button>
            </div>
        </div>
    </header>
);

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-${color.split('-')[1]}-400`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// --- Main App Component ---

function App() {
    // State
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [players, setPlayers] = useState([]);
    const [history, setHistory] = useState([]);

    // UI State
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Unsold');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [isPurseModalOpen, setIsPurseModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');

    // Initialize
    useEffect(() => {
        const storedState = localStorage.getItem('iplAuctionState_v2');
        if (storedState) {
            const { teams, players, history } = JSON.parse(storedState);
            setTeams(teams);
            setPlayers(players);
            setHistory(history);
        } else {
            setPlayers(playersData);
        }
    }, []);

    // Persistence
    useEffect(() => {
        if (players.length > 0) {
            localStorage.setItem('iplAuctionState_v2', JSON.stringify({ teams, players, history }));
        }
    }, [teams, players, history]);

    // Actions
    const handleBid = (e) => {
        e.preventDefault();
        const amount = parseFloat(bidAmount);

        if (!selectedPlayer || !selectedTeamId || !amount) return;

        const team = teams.find(t => t.id === selectedTeamId);

        if (amount > team.purse) {
            alert(`Insufficient funds! ${team.name} only has ${team.purse} Cr.`);
            return;
        }

        if (amount < selectedPlayer.basePrice) {
            alert(`Bid must be at least ${selectedPlayer.basePrice} Cr.`);
            return;
        }

        // Execute Transaction
        const updatedTeams = teams.map(t => {
            if (t.id === selectedTeamId) {
                return {
                    ...t,
                    purse: parseFloat((t.purse - amount).toFixed(2)),
                    roster: [...t.roster, selectedPlayer.id]
                };
            }
            return t;
        });

        const updatedPlayers = players.map(p => {
            if (p.id === selectedPlayer.id) {
                return { ...p, status: 'Sold', soldPrice: amount, soldTo: selectedTeamId };
            }
            return p;
        });

        const newHistoryEntry = {
            id: Date.now(),
            type: 'BID',
            playerId: selectedPlayer.id,
            teamId: selectedTeamId,
            amount: amount,
            timestamp: new Date().toISOString()
        };

        setTeams(updatedTeams);
        setPlayers(updatedPlayers);
        setHistory([newHistoryEntry, ...history]);

        // Reset Modal
        setBidAmount('');
        setSelectedTeamId('');
        setIsBidModalOpen(false);
        setSelectedPlayer(null);
    };

    const undoLastAction = () => {
        if (history.length === 0) return;

        const lastAction = history[0];
        const { type, playerId, teamId, amount } = lastAction;

        if (type === 'BID') {
            const updatedTeams = teams.map(t => {
                if (t.id === teamId) {
                    return {
                        ...t,
                        purse: parseFloat((t.purse + amount).toFixed(2)),
                        roster: t.roster.filter(id => id !== playerId)
                    };
                }
                return t;
            });

            const updatedPlayers = players.map(p => {
                if (p.id === playerId) {
                    return { ...p, status: 'Unsold', soldPrice: 0, soldTo: null };
                }
                return p;
            });

            setTeams(updatedTeams);
            setPlayers(updatedPlayers);
            setHistory(history.slice(1));
        }
    };

    const handleUpdatePurse = (teamId, newPurse) => {
        setTeams(teams.map(t => t.id === teamId ? { ...t, purse: parseFloat(newPurse) } : t));
    };

    const exportData = () => {
        const data = JSON.stringify({ teams, players, history }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipl-auction-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // Derived Data
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || p.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalSpent = useMemo(() => {
        return history.filter(h => h.type === 'BID').reduce((acc, curr) => acc + curr.amount, 0);
    }, [history]);

    const totalPlayersSold = useMemo(() => players.filter(p => p.status === 'Sold').length, [players]);

    return (
        <div className="bg-gray-900 min-h-screen font-sans text-gray-100">
            <Header
                onManagePurses={() => setIsPurseModalOpen(true)}
                onUndo={undoLastAction}
                onExport={exportData}
            />

            <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar: Team Standings */}
                <aside className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <Users size={18} className="text-indigo-400" />
                                Team Standings
                            </h2>
                            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                                {2000 - totalSpent} Cr Left
                            </span>
                        </div>
                        <div className="divide-y divide-gray-700 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {teams.map(team => {
                                const percentLeft = (team.purse / 200) * 100;
                                let healthColor = 'bg-emerald-500';
                                if (percentLeft < 20) healthColor = 'bg-red-500';
                                else if (percentLeft < 50) healthColor = 'bg-yellow-500';

                                return (
                                    <div key={team.id} className="p-3 hover:bg-gray-700/50 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm">{team.name}</span>
                                            <span className="font-mono font-bold text-indigo-300">{team.purse} Cr</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Players: {team.roster.length}</span>
                                            <span>Budget Left</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${healthColor} transition-all duration-500`}
                                                style={{ width: `${Math.min(percentLeft, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Player Catalog */}
                <section className="lg:col-span-3 space-y-6">

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatsCard title="Players Sold" value={totalPlayersSold} icon={Gavel} color="bg-indigo-500" />
                        <StatsCard title="Total Spent" value={`${totalSpent.toFixed(2)} Cr`} icon={Wallet} color="bg-emerald-500" />
                        <StatsCard title="Unsold Players" value={players.length - totalPlayersSold} icon={Users} color="bg-blue-500" />
                        <StatsCard title="Last Bid" value={history.length > 0 ? `${history[0].amount} Cr` : '-'} icon={History} color="bg-orange-500" />
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Players..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['All', ...ROLES].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${roleFilter === role
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                            <div className="w-px bg-gray-600 mx-1"></div>
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'Unsold' ? 'Sold' : 'Unsold')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center gap-1`}
                            >
                                <Filter size={14} />
                                {statusFilter === 'Unsold' ? 'Show Sold' : 'Show Unsold'}
                            </button>
                        </div>
                    </div>

                    {/* Player Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredPlayers.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No players found matching criteria.</p>
                            </div>
                        ) : (
                            filteredPlayers.map(player => (
                                <div key={player.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group relative">
                                    <div className={`h-2 w-full ${player.status === 'Sold' ? 'bg-emerald-500' : 'bg-gray-700 group-hover:bg-indigo-500'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${player.type === 'Capped' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>
                                                    {player.type}
                                                </span>
                                                <h3 className="text-xl font-bold mt-1 text-white">{player.name}</h3>
                                                <p className="text-gray-400 text-sm">{player.role}</p>
                                            </div>
                                            <div className="text-right">
                                                {player.status === 'Sold' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-800 flex items-center gap-1">
                                                            <CheckCircle size={12} /> SOLD
                                                        </span>
                                                        <span className="mt-1 font-mono font-bold text-emerald-300">{player.soldPrice} Cr</span>
                                                        <span className="text-[10px] text-gray-500">to {teams.find(t => t.id === player.soldTo)?.shortName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-500 uppercase">Base Price</span>
                                                        <span className="font-mono font-bold text-white text-lg">{player.basePrice} Cr</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {player.status === 'Unsold' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPlayer(player);
                                                    setBidAmount(player.basePrice.toString());
                                                    setIsBidModalOpen(true);
                                                }}
                                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Gavel size={18} />
                                                Enter Bid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Bidding Modal */}
            <Modal
                isOpen={isBidModalOpen}
                onClose={() => setIsBidModalOpen(false)}
                title={selectedPlayer ? `Bid for ${selectedPlayer.name}` : 'Place Bid'}
            >
                {selectedPlayer && (
                    <form onSubmit={handleBid} className="space-y-6">
                        <div className="flex justify-between bg-gray-900 p-4 rounded-lg">
                            <div>
                                <p className="text-gray-400 text-sm">Base Price</p>
                                <p className="font-mono font-bold text-xl">{selectedPlayer.basePrice} Cr</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Role</p>
                                <p className="font-medium text-white">{selectedPlayer.role}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Winning Team</label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {teams.map(team => {
                                    const canAfford = team.purse >= parseFloat(bidAmount || 0);
                                    return (
                                        <button
                                            key={team.id}
                                            type="button"
                                            disabled={!canAfford}
                                            onClick={() => setSelectedTeamId(team.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${selectedTeamId === team.id
                                                ? 'bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-400/30'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                                } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="font-bold text-sm">{team.shortName}</div>
                                            <div className={`text-xs ${canAfford ? 'text-gray-400' : 'text-red-400'}`}>
                                                {team.purse} Cr Left
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Winning Bid (Cr)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={selectedPlayer.basePrice}
                                    required
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-8 pr-4 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedTeamId}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                        >
                            Confirm Sale
                        </button>
                    </form>
                )}
            </Modal>

            {/* Manage Purses Modal */}
            <Modal
                isOpen={isPurseModalOpen}
                onClose={() => setIsPurseModalOpen(false)}
                title="Manage Team Purses"
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-lg flex items-start gap-3 mb-4">
                        <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-yellow-200">
                            Modifying purses manually will affect the team's ability to bid. Proceed with caution.
                        </p>
                    </div>
                    {teams.map(team => (
                        <div key={team.id} className="flex items-center justify-between gap-4 bg-gray-900 p-3 rounded-lg border border-gray-700">
                            <div>
                                <h4 className="font-bold text-white leading-tight">{team.name}</h4>
                                <p className="text-xs text-gray-500">{team.roster.length} Players</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={team.purse}
                                    onChange={(e) => handleUpdatePurse(team.id, e.target.value)}
                                    className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-right font-mono text-sm focus:border-indigo-500 outline-none"
                                />
                                <span className="text-gray-500 text-sm">Cr</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to reset all data? This will clear all bids, history, and restore original purses/players.')) {
                                localStorage.removeItem('iplAuctionState');
                                window.location.reload();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 p-3 rounded-lg transition-all"
                    >
                        <RotateCcw size={18} />
                        Reset All Data (Clear Cache)
                    </button>
                </div>
            </Modal>

        </div>
    );
}

export default App;
