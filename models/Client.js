const {Sequelize} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const Clients = sequelize.define("Clients", {
        numCompte : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            allowNull : false,
            unique : true,
        },
        nom : DataTypes.STRING,
        solde : DataTypes.DOUBLE,
    });

    return Clients;
}