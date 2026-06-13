export const env = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    AWS_BASE_URL: import.meta.env.VITE_S3_BASE_URL || 'https://your-bucket.s3.amazonaws.com',
    RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
    CONDITIONS_API_URL: import.meta.env.VITE_CONDITIONS_API_URL,
    MEDICINE_API_URL: import.meta.env.VITE_MEDICINE_API_URL,
}
