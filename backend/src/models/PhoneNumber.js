const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhoneNumber = sequelize.define('PhoneNumber', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    sid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friendlyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = PhoneNumber;
