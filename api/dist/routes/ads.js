"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ads_1 = require("../controllers/ads");
const router = (0, express_1.Router)();
// GET /ads/draft — dohvatanje radne verzije prijavljenog korisnika
router.get('/draft', auth_1.requireAuth, ads_1.getDraft);
// POST /ads/draft — kreiranje ili ažuriranje radne verzije
router.post('/draft', auth_1.requireAuth, ads_1.saveDraft);
// DELETE /ads/draft — brisanje radne verzije
router.delete('/draft', auth_1.requireAuth, ads_1.deleteDraft);
// GET /ads — lista oglasa sa filterima
router.get('/', auth_1.optionalAuth, ads_1.getAds);
// POST /ads — kreiranje novog oglasa
router.post('/', auth_1.requireAuth, ads_1.createAd);
// GET /ads/:id — jedan oglas
router.get('/:id', ads_1.getAd);
// DELETE /ads/:id
router.delete('/:id', auth_1.requireAuth, ads_1.deleteAd);
// PATCH /ads/reserved — označi oglas kao rezervisan/nerezervisan
router.patch('/reserved', auth_1.requireAuth, ads_1.toggleReserved);
// PATCH /ads/:id
router.patch('/:id', auth_1.requireAuth, ads_1.updateAd);
exports.default = router;
