import { Router } from 'express';
import { requireAuth, optionalAuth } from '@/middleware/auth';
import {
  getDraft,
  saveDraft,
  deleteDraft,
  getAds,
  createAd,
  getAd,
  deleteAd,
  toggleReserved,
  updateAd
} from '@/controllers/ads';

const router = Router();

// GET /ads/draft — dohvatanje radne verzije prijavljenog korisnika
router.get('/draft', requireAuth, getDraft);

// POST /ads/draft — kreiranje ili ažuriranje radne verzije
router.post('/draft', requireAuth, saveDraft);

// DELETE /ads/draft — brisanje radne verzije
router.delete('/draft', requireAuth, deleteDraft);

// GET /ads — lista oglasa sa filterima
router.get('/', optionalAuth, getAds);

// POST /ads — kreiranje novog oglasa
router.post('/', requireAuth, createAd);

// GET /ads/:id — jedan oglas
router.get('/:id', getAd);

// DELETE /ads/:id
router.delete('/:id', requireAuth, deleteAd);

// PATCH /ads/reserved — označi oglas kao rezervisan/nerezervisan
router.patch('/reserved', requireAuth, toggleReserved);

// PATCH /ads/:id
router.patch('/:id', requireAuth, updateAd);

export default router;
