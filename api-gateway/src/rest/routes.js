const express = require('express');
const router = express.Router();
const grpcClients = require('../grpc/clients');

// ==================== HOTELS ====================

// GET /api/hotels - Liste tous les hôtels
router.get('/hotels', async (req, res) => {
  try {
    const result = await grpcClients.hotel.getHotels({});
    res.json({ succes: true, data: result.hotels });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// GET /api/hotels/:id - Détail d'un hôtel
router.get('/hotels/:id', async (req, res) => {
  try {
    const result = await grpcClients.hotel.getHotelById({ id: req.params.id });
    res.json({ succes: true, data: result });
  } catch (err) {
    res.status(404).json({ succes: false, message: 'Hôtel non trouvé' });
  }
});

// POST /api/hotels - Ajouter un hôtel
router.post('/hotels', async (req, res) => {
  try {
    const { nom, ville, adresse, etoiles } = req.body;
    if (!nom || !ville || !adresse || !etoiles) {
      return res.status(400).json({ succes: false, message: 'Champs manquants: nom, ville, adresse, etoiles' });
    }
    const result = await grpcClients.hotel.addHotel({ nom, ville, adresse, etoiles: parseInt(etoiles) });
    res.status(201).json({ succes: true, data: result });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// GET /api/hotels/:id/disponibilite - Vérifier disponibilité
router.get('/hotels/:id/disponibilite', async (req, res) => {
  try {
    const { dateArrivee, dateDepart } = req.query;
    const result = await grpcClients.hotel.checkAvailability({
      hotelId: req.params.id,
      dateArrivee: dateArrivee || '',
      dateDepart: dateDepart || ''
    });
    res.json({ succes: true, data: result });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// ==================== RESERVATIONS ====================

// GET /api/reservations - Toutes les réservations
router.get('/reservations', async (req, res) => {
  try {
    const result = await grpcClients.reservation.getAllReservations({});
    res.json({ succes: true, data: result.reservations });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// GET /api/reservations/:id - Une réservation
router.get('/reservations/:id', async (req, res) => {
  try {
    const result = await grpcClients.reservation.getReservation({ id: req.params.id });
    res.json({ succes: true, data: result });
  } catch (err) {
    res.status(404).json({ succes: false, message: 'Réservation non trouvée' });
  }
});

// GET /api/reservations/user/:userId - Réservations d'un utilisateur
router.get('/reservations/user/:userId', async (req, res) => {
  try {
    const result = await grpcClients.reservation.getUserReservations({ userId: req.params.userId });
    res.json({ succes: true, data: result.reservations });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// POST /api/reservations - Créer une réservation
router.post('/reservations', async (req, res) => {
  try {
    const { userId, hotelId, chambreId, dateArrivee, dateDepart, nomClient, emailClient } = req.body;
    if (!userId || !hotelId || !chambreId || !dateArrivee || !dateDepart || !nomClient || !emailClient) {
      return res.status(400).json({ succes: false, message: 'Champs manquants' });
    }
    const result = await grpcClients.reservation.createReservation({
      userId, hotelId, chambreId, dateArrivee, dateDepart, nomClient, emailClient
    });
    res.status(201).json({ succes: true, data: result });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// DELETE /api/reservations/:id - Annuler une réservation
router.delete('/reservations/:id', async (req, res) => {
  try {
    const result = await grpcClients.reservation.cancelReservation({ id: req.params.id });
    res.json({ succes: true, data: result });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// ==================== NOTIFICATIONS ====================

// GET /api/notifications - Toutes les notifications
router.get('/notifications', async (req, res) => {
  try {
    const result = await grpcClients.notification.getAllNotifications({});
    res.json({ succes: true, data: result.notifications });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// GET /api/notifications/user/:userId - Notifications d'un utilisateur
router.get('/notifications/user/:userId', async (req, res) => {
  try {
    const result = await grpcClients.notification.getNotifications({ userId: req.params.userId });
    res.json({ succes: true, data: result.notifications });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

// PATCH /api/notifications/:id/lire - Marquer comme lue
router.patch('/notifications/:id/lire', async (req, res) => {
  try {
    const result = await grpcClients.notification.markAsRead({ id: req.params.id });
    res.json({ succes: true, data: result });
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message });
  }
});

module.exports = router;
