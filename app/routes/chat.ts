import express, { Request } from "express";
import findCompanyChatProviders from "../functions/findCompanyChatProviders";

const router = express.Router();

interface FindRequest extends Request {
  query: {
    companyName?: string;
  };
}

// this endpoint was part of the original app, but the readme specified
// that there should be a /find endpoint.
router.post("/drift", async (req, res) => {
  res.send([{ companyName: "", hasDrift: false }]);
});

// supports a query parameter to find a specific company.
router.post("/find", async (req: FindRequest, res) => {
  const { companyName } = req.query;

  const files = await findCompanyChatProviders(companyName);

  res.send(files);
});

export default router;
