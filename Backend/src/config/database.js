const mongoose = require('mongoose');

const connectDB = () => {
  const clusterUri = process.env.MONGODB_CLUSTER_URI;
  const dbName = process.env.MONGODB_DATABASE_NAME;
  
  if (!clusterUri || !dbName) {
    console.error('❌ Faltan variables de entorno MONGODB_CLUSTER_URI o MONGODB_DATABASE_NAME');
    process.exit(1);
  }
  
  const fullUri = `${clusterUri}/${dbName}`;
  
  return mongoose.connect(fullUri)
    .then(() => {
      console.log('MongoDB conectado exitosamente');
      console.log(`Base de datos: ${dbName}`);
    })
    .catch(err => {
      console.error('❌ Error al conectar MongoDB:', err.message);
      process.exit(1);
    });
};

module.exports = connectDB;