const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => console.log(' Connecté à MongoDB'))
  .catch(err => {
    console.error(' Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Schéma Player
const playerSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  avis: { 
    type: String, 
    required: true,
    enum: ['Pas-ouf', 'sympa', 'Trop-Top'],
    default: 'sympa'
  },
  selectedCharacter: { type: String },
  score: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

const Player = mongoose.model('Player', playerSchema);

// ==================== ROUTES API ====================

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Portfolio fonctionnelle ',
    timestamp: new Date()
  });
});

// GET tous les joueurs
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ score: -1 });
    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Erreur GET /api/players:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET joueur par ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Erreur GET /api/players/:id:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET joueur par email
app.get('/api/players/email/:email', async (req, res) => {
  try {
    const player = await Player.findOne({ 
      email: req.params.email.toLowerCase() 
    });
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Erreur GET /api/players/email/:email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST créer un nouveau joueur
app.post('/api/players', async (req, res) => {
  try {
    const { nom, username, email, avis, selectedCharacter, score } = req.body;
    
    // Validation
    if (!nom || !username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom, username et email sont requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingPlayer = await Player.findOne({ email: email.toLowerCase() });
    if (existingPlayer) {
      return res.status(409).json({
        success: false,
        message: 'Un joueur avec cet email existe déjà'
      });
    }

    const player = new Player({
      nom,
      username,
      email: email.toLowerCase(),
      avis: avis || 'sympa',
      selectedCharacter,
      score: score || 0
    });

    const savedPlayer = await player.save();
    
    res.status(201).json({
      success: true,
      message: 'Joueur créé avec succès',
      data: savedPlayer
    });
  } catch (error) {
    console.error('Erreur POST /api/players:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT mettre à jour un joueur
app.put('/api/players/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updates.email) {
      const existingPlayer = await Player.findOne({ 
        email: updates.email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingPlayer) {
        return res.status(409).json({
          success: false,
          message: 'Un autre joueur utilise déjà cet email'
        });
      }
      
      updates.email = updates.email.toLowerCase();
    }
    
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Joueur mis à jour avec succès',
      data: player
    });
  } catch (error) {
    console.error('Erreur PUT /api/players/:id:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PATCH mettre à jour le score d'un joueur
app.patch('/api/players/:id/score', async (req, res) => {
  try {
    const { won, scoreEarned } = req.body;
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Mettre à jour les statistiques
    player.gamesPlayed = (player.gamesPlayed || 0) + 1;
    player.score = (player.score || 0) + (scoreEarned || 0);
    
    if (won) {
      player.wins = (player.wins || 0) + 1;
    } else {
      player.losses = (player.losses || 0) + 1;
    }
    
    await player.save();
    
    res.json({
      success: true,
      message: 'Score mis à jour avec succès',
      data: player
    });
  } catch (error) {
    console.error('Erreur PATCH /api/players/:id/score:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE supprimer un joueur
app.delete('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Joueur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur DELETE /api/players/:id:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET leaderboard (classement)
app.get('/api/leaderboard/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await Player.find()
      .sort({ score: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      count: topPlayers.length,
      data: topPlayers
    });
  } catch (error) {
    console.error('Erreur GET /api/leaderboard/top:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 API Portfolio - Game Server',
    endpoints: {
      test: 'GET /api/test',
      players: 'GET /api/players',
      playerById: 'GET /api/players/:id',
      playerByEmail: 'GET /api/players/email/:email',
      createPlayer: 'POST /api/players',
      updatePlayer: 'PUT /api/players/:id',
      updateScore: 'PATCH /api/players/:id/score',
      deletePlayer: 'DELETE /api/players/:id',
      leaderboard: 'GET /api/leaderboard/top'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
  console.log(` Base de données: ${MONGODB_URI}`);
});