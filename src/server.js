import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import citasRouter from './routes/citas.js';
import contactoRouter from './routes/contacto.js';
import serviciosRouter from './routes/servicios.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 4000;

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': [
          "'self'", 
          'data:', 
          'https://images.unsplash.com', 
          'https://i.postimg.cc',
          'https://raw.githubusercontent.com',
          'https://github.com'
        ],
      },
    },
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '200kb' }));

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
  })
);

const limiteFormularios = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiados envíos. Inténtalo de nuevo en unos minutos.',
  },
});

// Rutas de la API
app.get('/api/salud', (_req, res) => {
  res.json({
    ok: true,
    servicio: 'API Dino Dent',
    hora: new Date().toISOString(),
  });
});

app.use('/api/servicios', serviciosRouter);
app.use('/api/citas', limiteFormularios, citasRouter);
app.use('/api/contacto', limiteFormularios, contactoRouter);

// ==========================================
// SERVIR EL FRONTEND (Carpeta dist)
// ==========================================
// Ajusta esta ruta si tu carpeta dist está en otro lugar.
// Aquí asumimos que estás dentro de 'backend/' y 'dist/' está al mismo nivel.
const rutaCliente = path.join(__dirname, '..', 'dist');

app.use(express.static(rutaCliente));

// React Router / SPA: Cualquier ruta que no empiece con /api 
// devolverá el index.html para que el frontend maneje las rutas
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Si es una API que no existe, dejará que pase al 404 de abajo
  }
  res.sendFile(path.join(rutaCliente, 'index.html'));
});

// Manejo de rutas /api no encontradas (404)
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Ruta de API no encontrada',
  });
});

// Manejo global de errores del servidor
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
  });
});

app.listen(PORT, () => {
  console.log(`API y Frontend Dino Dent escuchando en http://localhost:${PORT}`);
});