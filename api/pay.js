import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      accountNumber,
      amount,
      currency
    } = req.body;

    if (!accountNumber || !amount) {
      return res.status(400).json({
        error: "Missing fields"
      });
    }

    const referenceId =
      crypto.randomUUID();

    const payload = {

      callbackUrl:
        "https://cato-pay.vercel.app/api/lipila-webhook",

      referenceId,

      amount: parseFloat(amount),

      narration:
        "Payment via Cato Pay",

      accountNumber,

      currency: currency || "ZMW"

    };

    console.log("Sending payment:", payload);

    const response =
      await fetch(
        "https://api.lipila.dev/api/v1/collections/mobile-money",
        {
          method: "POST",

          headers: {
            "accept": "application/json",
            "Content-Type": "application/json",

            "x-api-key":
              process.env.LIPILA_API_KEY
          },

          body: JSON.stringify(payload)
        }
      );

    const data =
      await response.json();

    console.log("Lipila:", data);

    if (!response.ok) {

      return res.status(response.status)
        .json(data);

    }

    return res.status(200).json({
      success: true,
      referenceId
    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

}
