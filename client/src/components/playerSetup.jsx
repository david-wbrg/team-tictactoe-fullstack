import { useState } from 'react';

export default function PlayerSetup({ onPlayerSet }) { //function to set up players
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any previous errors
        setError('');

        // Validate name
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        // Set loading state
        setLoading(true);

        try {
            // Call backend API
            const response = await fetch('http://localhost:3000/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() })
            });

            const data = await response.json();

            if (data.success) {
                // Save to localstorage
                localStorage.setItem('playerId', data.player.id);
                localStorage.setItem('playerName', data.player.name);

                // Call parent callback with player data
                onPlayerSet(data.player);
            } else {
                // handle API error
                setError(data.error || 'Failed to create player');
            }
        } catch (err) {
            console.error('error creating player:', err);
            setError('Could not connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="player-setup">
        <div className="player-setup-card">
          <h2>Welcome to Tic-Tac-Toe!</h2>
          <p className="subtitle">Enter your name to start playing</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="player-form">
            <div className="form-group">
              <label htmlFor="playerName">Player Name</label>
              <input
                id="playerName"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="player-iput"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn btn-primary"
            >
              {loading ? "Creating Player..." : "Start Game"}
            </button>
          </form>

          <div className="help-txt">
            <p>🎮 Play against yourself or a friend!</p>
            <p>📊 Your wins and losses will be tracked</p>
          </div>
        </div>
      </div>
    );
}