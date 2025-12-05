try {
    console.log('Attempting to require sqlite3...');
    const sqlite3 = require('sqlite3');
    console.log('sqlite3 loaded successfully');
} catch (error) {
    console.error('Error loading sqlite3:', error);
}
