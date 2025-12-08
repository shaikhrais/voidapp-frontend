// Test login endpoint
const testLogin = async () => {
    const response = await fetch('https://voipapp.itpro-mohammed.workers.dev/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'itpro.mohammed@gmail.com',
            password: 'Rsoft@999'
        })
    });

    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));
    console.log('\nUser Role:', data.user?.role);
    console.log('Organization ID:', data.user?.organization_id);
    console.log('Expected Role: super_admin');
    console.log('Expected Org: org-super-admin');
};

testLogin();
