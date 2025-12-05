const sequelize = require('./src/config/database');

async function testDB() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Authenticated.');

        console.log('Syncing...');
        await sequelize.sync({ force: true }); // Try force sync to reset
        console.log('Synced.');

        process.exit(0);
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
}

testDB();
