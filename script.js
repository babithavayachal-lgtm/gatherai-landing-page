// Configuration
const APP_URL = 'https://app.gatherai.in';
const BACKEND_URL = 'https://app.gatherai.in/api';

// Razorpay Test Key (will be switched to live key in production)
const RAZORPAY_KEY = 'rzp_test_SDBwiuKckbGJMZ';
const STRIPE_KEY = ''; // Not configured yet

// Launch App
function launchApp() {
    window.location.href = APP_URL;
}

// Start Free Trial
function startFreeTrial() {
    // Show payment modal
    document.getElementById('paymentModal').style.display = 'flex';
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Proceed with Razorpay
async function proceedWithRazorpay() {
    if (!RAZORPAY_KEY) {
        alert('Payment integration is being set up. Please try again soon!');
        return;
    }

    try {
        // Create subscription order
        const response = await fetch(`${BACKEND_URL}/subscription/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_gateway: 'razorpay'
            })
        });

        const orderData = await response.json();

        // Initialize Razorpay with order
        const options = {
            key: orderData.key || RAZORPAY_KEY,
            amount: orderData.amount * 100, // Amount in paise
            currency: orderData.currency || 'INR',
            order_id: orderData.order_id,
            name: 'Smart Homework Solutions',
            description: 'Monthly Subscription - ₹299/month (7 Days Free Trial)',
            image: '', // Add your logo URL here
            handler: function(response) {
                // Payment successful
                verifyPayment(response.razorpay_payment_id, orderData.order_id, 'razorpay');
            },
            prefill: {
                email: '',
                contact: ''
            },
            notes: {
                plan: 'monthly',
                price: '₹299/month',
                trial_period: '7 days'
            },
            theme: {
                color: '#2563EB'
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();

        razorpay.on('payment.failed', function(response) {
            alert('Payment failed. Please try again.');
        });

    } catch (error) {
        console.error('Payment error:', error);
        alert('Something went wrong. Please try again.');
    }
}

// Proceed with Stripe
async function proceedWithStripe() {
    if (!STRIPE_KEY) {
        alert('Payment integration is being set up. Please try again soon!');
        return;
    }

    try {
        // Create Stripe checkout session
        const response = await fetch(`${BACKEND_URL}/subscription/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_gateway: 'stripe'
            })
        });

        const { checkout_url } = await response.json();

        // Redirect to Stripe checkout
        window.location.href = checkout_url;

    } catch (error) {
        console.error('Payment error:', error);
        alert('Something went wrong. Please try again.');
    }
}

// Verify Payment
async function verifyPayment(paymentId, subscriptionId, gateway) {
    try {
        const response = await fetch(`${BACKEND_URL}/payment/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_id: paymentId,
                subscription_id: subscriptionId,
                gateway: gateway
            })
        });

        const result = await response.json();

        if (result.success) {
            // Redirect to app
            window.location.href = `${APP_URL}?trial_started=true`;
        } else {
            alert('Payment verification failed. Please contact support.');
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert('Verification failed. Please contact support.');
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close modal on outside click
document.getElementById('paymentModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closePaymentModal();
    }
});

// Load Razorpay script if key is available
if (RAZORPAY_KEY) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);
}

