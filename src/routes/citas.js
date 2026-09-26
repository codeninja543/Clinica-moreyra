import { Router } from 'express';
import { z } from 'zod';
import { guardarRegistro, leerRegistros } from '../data/almacen.js';
import { enviarCorreo } from '../services/correo.js';

const router = Router();

const esquemaCita = z.object({
  nombre: z.string().min(2, 'Escribe tu nombre completo').max(80),
  telefono: z.string().min(6, 'Escribe un telefono valido').max(25),
  servicio: z.string().min(2).max(80),
  fecha: z.string().min(4).max(30),
  horario: z.string().max(40).optional().default(''),
  mensaje: z.string().max(1000).optional().default(''),
  // campo trampa contra bots: debe llegar vacio
  web: z.string().max(0).optional().default(''),
});

router.post('/', async (req, res, next) => {
  try {
    const resultado = esquemaCita.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        error: 'Revisa los datos del formulario',
        detalles: resultado.error.flatten().fieldErrors,
      });
    }

    const cita = {
      id: `cita_${Date.now()}`,
      ...resultado.data,
      creadaEn: new Date().toISOString(),
      estado: 'pendiente',
    };
    delete cita.web;

    await guardarRegistro('citas.json', cita);

    await enviarCorreo({
      asunto: `Nueva solicitud de cita - ${cita.nombre}`,
      texto: [
        `Nombre: ${cita.nombre}`,
        `Telefono: ${cita.telefono}`,
        `Servicio: ${cita.servicio}`,
        `Fecha preferida: ${cita.fecha} ${cita.horario}`,
        `Mensaje: ${cita.mensaje || '-'}`,
      ].join('\n'),
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Recibimos tu solicitud. Te llamamos para confirmar el horario.',
      id: cita.id,
    });
  } catch (error) {
    next(error);
  }
});

// Listado interno (protegido con una clave simple en la cabecera)
router.get('/', async (req, res, next) => {
  try {
    if (req.header('x-clave-admin') !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: 'No autorizado' });
    }
    res.json({ ok: true, citas: await leerRegistros('citas.json') });
  } catch (error) {
    next(error);
  }
});

export default router;
