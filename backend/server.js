const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
<<<<<<< HEAD
=======
const path = require('path');
>>>>>>> master
require('dotenv').config();

const app = express();

<<<<<<< HEAD
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
=======
// ========== MIDDLEWARE (ORDRE IMPORTANT) ==========
// 1. CORS en premier (AMÉLIORÉ)
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Parsers JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging middleware (pour déboguer)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// 4. Fichiers statiques
app.use(express.static(path.join(__dirname)));

// ========== CONNEXION MONGODB ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Événements MongoDB
mongoose.connection.on('error', err => {
  console.error('❌ Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB déconnecté');
});

// ========== SCHÉMA PLAYER ==========
>>>>>>> master
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

<<<<<<< HEAD
// ==================== ROUTES API ====================

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Portfolio fonctionnelle ',
    timestamp: new Date()
=======
// ========== ROUTES API ==========

// Route de test (TRÈS IMPORTANT)
app.get('/api/test', (req, res) => {
  console.log('✅ Route /api/test appelée');
  res.json({ 
    success: true, 
    message: 'API Portfolio fonctionnelle ✅',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connectée' : 'déconnectée'
>>>>>>> master
  });
});

// GET tous les joueurs
app.get('/api/players', async (req, res) => {
  try {
<<<<<<< HEAD
    const players = await Player.find().sort({ score: -1 });
=======
    console.log('📋 Récupération de tous les joueurs...');
    const players = await Player.find().sort({ score: -1 });
    console.log(`✅ ${players.length} joueurs trouvés`);
    
>>>>>>> master
    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur GET /api/players:', error);
=======
    console.error('❌ Erreur GET /api/players:', error);
>>>>>>> master
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET joueur par ID
app.get('/api/players/:id', async (req, res) => {
  try {
<<<<<<< HEAD
    const player = await Player.findById(req.params.id);
    
    if (!player) {
=======
    console.log('🔍 Recherche joueur ID:', req.params.id);
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      console.log('❌ Joueur non trouvé');
>>>>>>> master
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
<<<<<<< HEAD
=======
    console.log('✅ Joueur trouvé:', player.username);
>>>>>>> master
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur GET /api/players/:id:', error);
=======
    console.error('❌ Erreur GET /api/players/:id:', error);
>>>>>>> master
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET joueur par email
app.get('/api/players/email/:email', async (req, res) => {
  try {
<<<<<<< HEAD
    const player = await Player.findOne({ 
      email: req.params.email.toLowerCase() 
    });
    
    if (!player) {
=======
    const email = req.params.email.toLowerCase();
    console.log('🔍 Recherche joueur email:', email);
    
    const player = await Player.findOne({ email });
    
    if (!player) {
      console.log('❌ Joueur non trouvé avec cet email');
>>>>>>> master
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
<<<<<<< HEAD
=======
    console.log('✅ Joueur trouvé:', player.username);
>>>>>>> master
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur GET /api/players/email/:email:', error);
=======
    console.error('❌ Erreur GET /api/players/email/:email:', error);
>>>>>>> master
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST créer un nouveau joueur
app.post('/api/players', async (req, res) => {
  try {
<<<<<<< HEAD
=======
    console.log('➕ Création nouveau joueur:', req.body);
>>>>>>> master
    const { nom, username, email, avis, selectedCharacter, score } = req.body;
    
    // Validation
    if (!nom || !username || !email) {
<<<<<<< HEAD
=======
      console.log('❌ Données manquantes');
>>>>>>> master
      return res.status(400).json({
        success: false,
        message: 'Nom, username et email sont requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingPlayer = await Player.findOne({ email: email.toLowerCase() });
    if (existingPlayer) {
<<<<<<< HEAD
=======
      console.log('❌ Email déjà utilisé');
>>>>>>> master
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
<<<<<<< HEAD
=======
    console.log('✅ Joueur créé:', savedPlayer.username, 'ID:', savedPlayer._id);
>>>>>>> master
    
    res.status(201).json({
      success: true,
      message: 'Joueur créé avec succès',
      data: savedPlayer
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur POST /api/players:', error);
=======
    console.error('❌ Erreur POST /api/players:', error);
>>>>>>> master
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT mettre à jour un joueur
app.put('/api/players/:id', async (req, res) => {
  try {
<<<<<<< HEAD
=======
    console.log('✏️  Mise à jour joueur:', req.params.id);
>>>>>>> master
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
    
<<<<<<< HEAD
=======
    console.log('✅ Joueur mis à jour:', player.username);
>>>>>>> master
    res.json({
      success: true,
      message: 'Joueur mis à jour avec succès',
      data: player
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur PUT /api/players/:id:', error);
=======
    console.error('❌ Erreur PUT /api/players/:id:', error);
>>>>>>> master
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PATCH mettre à jour le score d'un joueur
app.patch('/api/players/:id/score', async (req, res) => {
  try {
<<<<<<< HEAD
=======
    console.log('🎮 Mise à jour score:', req.params.id, req.body);
>>>>>>> master
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
<<<<<<< HEAD
=======
    console.log('✅ Score mis à jour:', player.username, 'Score:', player.score);
>>>>>>> master
    
    res.json({
      success: true,
      message: 'Score mis à jour avec succès',
      data: player
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur PATCH /api/players/:id/score:', error);
=======
    console.error('❌ Erreur PATCH /api/players/:id/score:', error);
>>>>>>> master
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE supprimer un joueur
app.delete('/api/players/:id', async (req, res) => {
  try {
<<<<<<< HEAD
=======
    console.log('🗑️  Suppression joueur:', req.params.id);
>>>>>>> master
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
<<<<<<< HEAD
=======
    console.log('✅ Joueur supprimé:', player.username);
>>>>>>> master
    res.json({
      success: true,
      message: 'Joueur supprimé avec succès'
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur DELETE /api/players/:id:', error);
=======
    console.error('❌ Erreur DELETE /api/players/:id:', error);
>>>>>>> master
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
<<<<<<< HEAD
=======
    console.log('🏆 Récupération top', limit);
>>>>>>> master
    
    const topPlayers = await Player.find()
      .sort({ score: -1 })
      .limit(limit);
    
<<<<<<< HEAD
=======
    console.log(`✅ ${topPlayers.length} joueurs dans le top`);
>>>>>>> master
    res.json({
      success: true,
      count: topPlayers.length,
      data: topPlayers
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Erreur GET /api/leaderboard/top:', error);
=======
    console.error('❌ Erreur GET /api/leaderboard/top:', error);
>>>>>>> master
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

<<<<<<< HEAD
=======
// Route pour la page admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

>>>>>>> master
// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 API Portfolio - Game Server',
<<<<<<< HEAD
=======
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
>>>>>>> master
    endpoints: {
      test: 'GET /api/test',
      players: 'GET /api/players',
      playerById: 'GET /api/players/:id',
      playerByEmail: 'GET /api/players/email/:email',
      createPlayer: 'POST /api/players',
      updatePlayer: 'PUT /api/players/:id',
      updateScore: 'PATCH /api/players/:id/score',
      deletePlayer: 'DELETE /api/players/:id',
<<<<<<< HEAD
      leaderboard: 'GET /api/leaderboard/top'
=======
      leaderboard: 'GET /api/leaderboard/top',
      admin: 'GET /admin'
>>>>>>> master
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
<<<<<<< HEAD
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
=======
  console.log('❌ Route non trouvée:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path
>>>>>>> master
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
  console.log(` Base de données: ${MONGODB_URI}`);
=======
  console.log('\n🚀 ========================================');
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Page admin: http://localhost:${PORT}/admin`);
  console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: ${MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);
  console.log('🚀 ========================================\n');
>>>>>>> master
});