// Test password hashing to verify super admin credentials
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Test the password
const password = 'Rsoft@999';
hashPassword(password).then(hash => {
    console.log('Password:', password);
    console.log('Hash:', hash);
});
