require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Checking credentials...');
console.log(`Account SID: ${accountSid ? 'Set' : 'Missing'}`);
console.log(`Auth Token: ${authToken ? 'Set' : 'Missing'}`);
console.log(`Phone Number: ${phoneNumber ? 'Set' : 'Missing'}`);

if (!accountSid || !authToken) {
    console.error('Error: Missing Twilio credentials.');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function verify() {
    try {
        console.log('Fetching account details...');
        const account = await client.api.accounts(accountSid).fetch();
        console.log(`Account Status: ${account.status}`);
        console.log(`Account Type: ${account.type}`);

        if (phoneNumber) {
            console.log(`Verifying phone number: ${phoneNumber}...`);
            const numbers = await client.incomingPhoneNumbers.list({ phoneNumber: phoneNumber });
            if (numbers.length > 0) {
                console.log('Phone number found in account.');
                console.log(`Friendly Name: ${numbers[0].friendlyName}`);
                console.log(`Capabilities: ${JSON.stringify(numbers[0].capabilities)}`);
            } else {
                console.warn('Warning: Phone number NOT found in this account.');
            }
        }

        console.log('Credentials appear valid.');
    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
    }
}

verify();
