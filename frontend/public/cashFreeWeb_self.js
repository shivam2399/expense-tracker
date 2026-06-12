const cashfree = Cashfree({
    mode: "sandbox",
});

document.getElementById("renderBtn").addEventListener("click", async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert("User not logged in");
    return;
  }

  try {
    // Fetch payment session ID from backend
    const response = await fetch("http://localhost:5000/api/payments/pay", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        frontendUrl: window.location.href
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to start payment");
      return;
    }

    const paymentSessionId = data.paymentSessionId;

    // Initialize checkout options
    let checkoutOptions = {
        paymentSessionId: paymentSessionId,
      
      //? New page payment options
        redirectTarget: "_self",
    };

    // Start the checkout process
    await cashfree.checkout(checkoutOptions);


  } catch (err) {
    console.error("Error:", err);
  }
});
