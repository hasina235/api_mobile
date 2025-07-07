const express = require('express');
const router = express.Router();
// Assurez-vous que le chemin vers votre modèle est correct
const { Sequelize, Clients } = require('../models'); 

// Fonction d'observation du solde
function getObservation(solde) {
    if (solde < 1000) {
        return "insuffisant";
    } else if (solde >= 1000 && solde <= 5000) {
        return "moyen";
    } else {
        return "élevé";
    }
}

// Route POST pour créer un nouveau client
router.post('/', async (req, res) => {
    const { numCompte, nom, solde } = req.body;

    // Validation des champs requis
    if (!numCompte || !nom || !solde) {
        return res.status(400).json({ success: false, message: 'Tous les champs (numCompte, nom, solde) sont requis.' });
    }

    try {
        const newClient = await Clients.create({
            numCompte,
            nom,
            solde
        });

        // Réponse JSON pour un ajout réussi
        return res.status(201).json({ success: true, message: 'Client ajouté avec succès', client: newClient.toJSON() });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du client:', error);
        // Gestion des erreurs spécifiques (ex: violation de contrainte unique)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ success: false, message: 'Le numéro de compte existe déjà.' });
        }
        // Gestion des erreurs internes du serveur
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de l\'ajout.' });
    }
});

// Route GET pour récupérer tous les clients
router.get('/', async (req, res) => {
    try {
        const clients = await Clients.findAll(); // Récupère toutes les instances de client

        // Mappe les instances Sequelize pour ajouter la propriété 'obs'
        const clientWithObs = clients.map(c => ({
            ...c.toJSON(), // Convertit l'instance Sequelize en objet JavaScript simple
            obs: getObservation(c.solde)
        }));

        // Renvoie un tableau JSON de clients avec observation
        return res.status(200).json(clientWithObs);

    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de la récupération des clients.' });
    }
});

// Route PUT pour modifier un client existant
router.put('/:numCompte', async (req, res) => {
    const numCompteToUpdate = req.params.numCompte;
    const { nom, solde } = req.body;

    // Validation des champs requis pour la modification
    if (!nom || !solde) {
        return res.status(400).json({ success: false, message: 'Les champs nom et solde sont requis pour la modification.' });
    }

    try {
        const [updatedRows] = await Clients.update(
            { nom, solde }, // Champs à mettre à jour
            { where: { numCompte: numCompteToUpdate } } // Condition de mise à jour
        );

        if (updatedRows > 0) {
            // Réponse JSON pour une modification réussie
            return res.status(200).json({ success: true, message: 'Client modifié avec succès' });
        } else {
            // Client non trouvé
            return res.status(404).json({ success: false, message: 'Client non trouvé pour la modification.' });
        }
    } catch (error) {
        console.error('Erreur lors de la modification du client:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de la modification.' });
    }
});

// Route DELETE pour supprimer un client
router.delete('/:numCompte', async (req, res) => {
    const numCompte = req.params.numCompte;

    try {
        const deletedRows = await Clients.destroy({
            where: { numCompte: numCompte }
        });

        if (deletedRows > 0) {
            // Réponse JSON pour une suppression réussie
            return res.status(200).json({ success: true, message: 'Client supprimé avec succès' });
        } else {
            // Client non trouvé
            return res.status(404).json({ success: false, message: 'Client non trouvé pour la suppression' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de la suppression.' });
    }
});

// Route GET pour les statistiques (solde minimal, maximal, total)
router.get('/soldeminmax', async (req, res) => {
    try {
        const soldeStats = await Clients.findAll({
            attributes: [
                [Sequelize.fn('MIN', Sequelize.col('solde')), 'soldeMinimal'], // Utilisation de Sequelize.col
                [Sequelize.fn('MAX', Sequelize.col('solde')), 'soldeMaximal'],
                [Sequelize.fn('SUM', Sequelize.col('solde')), 'soldeTotal'],
            ],
            raw: true, // Pour obtenir des objets JavaScript bruts directement
            limit: 1 // Puisqu'il s'agit d'agrégats, il n'y aura qu'une seule ligne de résultat
        });

        // Le résultat sera un tableau d'un seul objet (ou vide si aucun client)
        const summaryData = soldeStats.length > 0 ? soldeStats[0] : { soldeMinimal: 0, soldeMaximal: 0, soldeTotal: 0 };

        // CORRECTION ICI : Renvoyer un OBJET JSON avec "success" et "summary"
        return res.status(200).json({ success: true, summary: summaryData });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de solde:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur lors de la récupération des statistiques.' });
    }
});

module.exports = router;
