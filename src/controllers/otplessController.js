const axios = require('axios');

async function sendOtp(phoneNumber) {
    const clientId = '';
    const clientSecret = '';

    const data = {
        phoneNumber: phoneNumber,
        channels: ["SMS"],  // specify channels for OTP delivery
        expiry: 300, // OTP expiry in seconds
        otpLength: 6, // OTP length, e.g., 4 or 6
    };

    try {
        const response = await axios.post('https://auth.otpless.app/auth/v1/initiate/otp', data, {
            headers: {
                'clientId': clientId,
                'clientSecret': clientSecret,
                'Content-Type': 'application/json'
            }
        });
        console.log('OTP sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending OTP:', error.response ? error.response.data : error.message);
    }
}

module.exports = { sendOtp };
