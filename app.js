import express from 'express'  
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { readFile } from 'fs/promises'; // Verwenden Sie fs promises API für modernen, asynchronen Code
import { marked } from 'marked'; // Importieren Sie marked für die Markdown-Konvertierung
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js'
import routes from './src/routes/indexRoute.js'
import { errorHandler, notFound } from './src/middleware/errorHandler.js'


const app = express()
const PORT = process.env.PORT || 3000


// Middleware
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(helmet())

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});


// Konvertieren __dirname in einem ES Module Kontext
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.get('/', async (req, res) => {
  try {
    // Pfad zur README.md Datei
    const mdPath = path.join(__dirname, 'README.md');
    
    // Lesen der Markdown-Datei
    const markdown = await readFile(mdPath, 'utf8');
    
    // Konvertieren von Markdown zu HTML
    const html = marked(markdown);
    
    // Senden des konvertierten HTML-Inhalts
    res.send(html);
  } catch (err) {
    res.status(500).send('Fehler beim Lesen der Markdown-Datei');
  }
});


app.use('/api', apiLimiter, routes)  // Verwenden Sie die routes, wenn der Pfad /api ist

app.use(notFound)
app.use(errorHandler)

// Verbindung zur Datenbank und Starten des Servers
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    })
  }).catch((error) => console.log('Error:', error.message))
}

export default app // Export für den Test
