const deps = [
    'express',
    'cors',
    'helmet',
    'morgan',
    'express-rate-limit',
    'swagger-ui-express',
    'swagger-jsdoc',
    'sequelize',
    'pg',
    'pg-hstore',
    'sqlite3',
    'jsonwebtoken',
    'bcryptjs',
    'twilio',
    'stripe',
    'express-validator'
];

deps.forEach(dep => {
    try {
        console.log(`Loading ${dep}...`);
        require(dep);
        console.log(`✅ ${dep} loaded`);
    } catch (error) {
        console.error(`❌ Error loading ${dep}:`, error.message);
    }
});
