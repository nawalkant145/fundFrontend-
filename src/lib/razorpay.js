// Loads the Razorpay Checkout script once and opens the payment modal.
// Returns a Promise that resolves with the payment handler payload on success
// and rejects if the user dismisses the modal or the script fails to load.

let scriptPromise = null;

function loadScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Razorpay checkout"));
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Open the Razorpay checkout modal.
 * @param {object} opts
 * @param {string} opts.keyId      Razorpay public key (from the order response)
 * @param {object} opts.order      Razorpay order ({ id, amount, currency })
 * @param {string} opts.name       Merchant / product name shown in the modal
 * @param {string} opts.description
 * @param {object} [opts.prefill]  { name, email, contact }
 * @returns {Promise<object>} resolves with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function openRazorpayCheckout({
  keyId,
  order,
  name = "EXPGLO FUND",
  description = "",
  prefill = {},
  theme = { color: "#1B5E3F" },
}) {
  await loadScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name,
      description,
      order_id: order.id,
      prefill,
      theme,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.on("payment.failed", (resp) =>
      reject(new Error(resp?.error?.description || "Payment failed")),
    );
    rzp.open();
  });
}
