import { Router } from 'express';
import { servicios } from '../data/servicios.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, servicios });
});

router.get('/:slug', (req, res) => {
  const servicio = servicios.find((s) => s.slug === req.params.slug);
  if (!servicio) return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });
  res.json({ ok: true, servicio });
});

export default router;
