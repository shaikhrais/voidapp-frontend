try {
    require('./src/server');
    console.log('Server imported successfully');
} catch (error) {
    console.error('Error importing server:', error);
}
