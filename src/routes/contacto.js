import { Router } from 'express';
import { z } from 'zod';
import { guardarRegistro } from '../data/almacen.js';
import { enviarCorreo } from '../services/correo.js';

const router = Router();

const esquemaContacto = z.object({
  nombre: z.string().min(2).max(80),
  email: z.string().email().max(120),
  telefono: z.string().max(25).optional().default(''),
  mensaje: z.string().min(5, 'Cuentanos un poco mas').max(1500),
  web: z.string().max(0).optional().default(''),
});

router.post('/', async (req, res, next) => {
  try {
    const resultado = esquemaContacto.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        error: 'Revisa los datos del formulario',
        detalles: resultado.error.flatten().fieldErrors,
      });
    }

    const mensaje = {
      id: `msg_${Date.now()}`,
      ...resultado.data,
      creadoEn: new Date().toISOString(),
    };
    delete mensaje.web;

    await guardarRegistro('mensajes.json', mensaje);
    await enviarCorreo({
      asunto: `Mensaje web - ${mensaje.nombre}`,
      texto: `${mensaje.nombre} (${mensaje.email} / ${mensaje.telefono})\n\n${mensaje.mensaje}`,
    });

    res.status(201).json({ ok: true, mensaje: 'Mensaje enviado. Te respondemos pronto.' });
  } catch (error) {
    next(error);
  }
});

export default router;
