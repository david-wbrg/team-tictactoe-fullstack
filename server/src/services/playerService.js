// server/src/services/playerService.js
import { v4 as uuidv4 } from "uuid";
import db from "../config/database.js";

export function createPlayer(name) {
  const playerId = uuidv4();
  const createdAt = Date.now();
  try {
    db.prepare(
      `
            INSERT INTO players (id, name, wins, losses, ties, total_games, created_at)
            VALUES (?, ?, 0, 0, 0, 0, ?)
            `,
    ).run(playerId, name, createdAt);
    console.log(`Player created at: ${name} (${playerId})`);
    return {
      id: playerId,
      name: name,
      wins: 0,
      loses: 0,
      ties: 0,
      totalGames: 0,
      createdAt: createdAt,
    };
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return { error: "Player name already exists", status: 400 };
    }
    throw error;
  }
}

/*
 * Get Player by ID
 */
export function getPlayer(playerId) {
  const player = db
    .prepare(
      `
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    WHERE id = ?
    `
    ).get(playerId);

  if (!player) {
    return { error: "Player not found", status: 404 };
  }

  return {
    id: player.id,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    ties: player.ties,
    totalGames: player.total_game,
    createdAt: player.created_at
  };
}

/** Get all players (sorted by wuns */
export function getAllPlayers() {
  const players = db
    .prepare(
      `
        SELECT id, name, wins, losses, ties, total_games, created_at
        FROM players
        ORDER BY created_at DESC
        `,
    )
    .all();

  return players.map((p) => ({
    id: p.id,
    name: p.name,
    wins: p.wins,
    losses: p.losses,
    ties: p.ties,
    totalGames: p.total_games,
    createdAt: p.created_at
  }));
}

/**
 * ✅ NEW: Update player stats after a game
 * @param {string} playerId
 * @param {string} result - 'win', 'loss', or 'tie'
 */

export function updatePlayerStats(playerId, result) {
  try {
    // Validate result
    if (!['win', 'loss', 'tie'].includes(result)) {
      return { error: 'Invalid result. Must be win, loss, or tie.', status: 400 };
    }

    // Determine which column to increment
    let updateColumn;
    if (result === 'win') {
      updateColumn = 'wins';
    } else if (result === 'loss') {
      updateColumn = 'losses';
    } else {
      updateColumn = 'ties';
    }

    //update the stat and total_games
    db.prepare(`
      UPDATE players
      SET ${updateColumn} = ${updateColumn} + 1,
          total_games = total_games + 1
      WHERE id = ?
    `).run(playerId);

    console.log(`✓ Updated ${playerId}: ${result}`);

    // Return updated player
    return getPlayer(playerId);
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
}

/**
 * ✅ NEW: Get leaderboard (top players by wins)
 * @param {number} limit - How many players to return (default 10)
 */
export function getLeaderboard(limit = 10) {
  const players = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    ORDER BY wins DESC, total_games ASC
    LIMIT ?
    `).all(limit);

  return players.map(p => ({
    id: p.id,
    name: p.name,
    wins: p.wins,
    losses: p.losses,
    ties: p.ties,
    totalGames: p.total_games,
    createdAt: p.created_at,
    winRate: p.total_games > 0
      ? (p.wins / p.total_games * 100).toFixed(1)
      : '0.0'
  }));
}

export function getPlayerByName(name) {
  const player = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    WHERE name = ?
    `).get(name);

  if (!player) {
    return { error: 'Player not found', status: 404 };
  }

  return {
    id: player.id,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    ties: player.tiles,
    totalGames: player.total_games,
    createdAt: player.created_at
  };
}
