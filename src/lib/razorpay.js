                                                                       
                                                                              
                                                                           

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
