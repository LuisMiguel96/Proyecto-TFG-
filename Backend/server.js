require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Conecta con Strava: http://localhost:${PORT}/api/strava/connect`);
});