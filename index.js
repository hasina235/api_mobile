const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3000;

const clientRoute = require("./routes/ClientRoute");
app.use('/client', clientRoute); // Toutes les routes client seront sous /client (ex: /client/, /client/add, /client/summary)

const db = require('./models');
db.sequelize.sync().then(() => {
    // SUPPRIMEZ CETTE LIGNE :
    // app.get('/', async(req, res) => {res.send('pret à ecouter sur le port 3000')});

    app.listen(port, () => {
        console.log(`serveur pret a ecouter sur le port : ${port}`);
    });
}).catch(err => {
    console.error('Erreur de synchronisation de la base de données:', err);
    // Gérer l'erreur de synchronisation, peut-être quitter l'application
});

// OPTIONNEL MAIS RECOMMANDÉ: Gérer les routes non trouvées (404)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée. Veuillez vérifier l\'URL.' });
});

// OPTIONNEL MAIS RECOMMANDÉ: Gérer les erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur. Veuillez réessayer plus tard.' });
});