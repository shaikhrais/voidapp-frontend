const express = require('express');
const app = express();
const PORT = 3006;

app.get('/', (req, res) => res.send('Hello'));

try {
    app.listen(PORT, () => {
        console.log(`Minimal Server running on port ${PORT}`);
        process.exit(0);
    });
} catch (error) {
    console.error('Server failed:', error);
    process.exit(1);
}
