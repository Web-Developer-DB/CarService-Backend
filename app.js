import express from 'express'  
import cors from 'cors'
import { readFile } from 'fs/promises'; // Verwenden Sie fs promises API für modernen, asynchronen Code
import { marked } from 'marked'; // Importieren Sie marked für die Markdown-Konvertierung
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js'
import routes from './src/routes/indexRoute.js'


const app = express()
const PORT = process.env.PORT || 3000


// Middleware
app.use(express.json())
app.use(cors())


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


app.use('/api', routes)  // Verwenden Sie die routes, wenn der Pfad /api ist


// 404 Fehlerbehandlung
app.all('*', (req, res) => {
  console.log(`404 - Die Route ${req.originalUrl} existiert nicht.`);
  res.status(404).send('Die angeforderte Ressource wurde nicht gefunden.');
});

// Verbindung zur Datenbank und Starten des Servers
connectDB().then(() => {
  app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
}
).catch((error) => console.log('Error:', error.message))

export default app // Export für den Test

