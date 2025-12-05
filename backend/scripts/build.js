const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const frontendDir = path.join(__dirname, '../../frontend');
const backendDir = path.join(__dirname, '..');
const publicDir = path.join(backendDir, 'public');

console.log('🚀 Starting Build Process...');

try {
    // 1. Install Frontend Dependencies
    console.log('📦 Installing Frontend Dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

    // 2. Build Frontend
    console.log('🛠️  Building Frontend...');
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

    // 3. Prepare Public Directory
    console.log('📂 Preparing Public Directory...');
    if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicDir);

    // 4. Copy Build Artifacts
    console.log('📋 Copying Build Artifacts...');
    const distDir = path.join(frontendDir, 'dist');

    // Function to copy directory recursively
    const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest);
            fs.readdirSync(src).forEach((childItemName) => {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    copyRecursiveSync(distDir, publicDir);

    console.log('✅ Build Complete! Frontend assets are ready in backend/public');

} catch (error) {
    console.error('❌ Build Failed:', error);
    process.exit(1);
}
