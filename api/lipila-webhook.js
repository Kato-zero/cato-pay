export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }

  try {

    const payload = req.body;

    console.log(
      "Webhook received:",
      JSON.stringify(payload, null, 2)
    );

    if (payload.status === "success") {

      console.log(
        "Payment successful:",
        payload.referenceId
      );

      // Save payment
      // Update database
      // Send receipt

    }

    return res.status(200).json({
      message: "Webhook received"
    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Webhook error"
    });

  }

}
