export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { referenceId } = req.query;

    if (!referenceId) {
      return res.status(400).json({
        error: "referenceId required"
      });
    }

    const response = await fetch(
      `https://api.lipila.dev/api/v1/collections/verify/${referenceId}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "x-api-key": process.env.LIPILA_API_KEY
        }
      }
    );

    const data = await response.json();

    return res.status(200).json({
      status: data.status || "Pending"
    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Verification failed"
    });

  }

}
