import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { LocalDatabase } from "./src/db/local";
import { LocalThreatIntel } from "./src/services/localIntel";
import { LocalAZRAELController } from "./src/services/localAzraelController";
import { EncryptedShadowLedger } from "./src/services/encryptedLedger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // Initialize Local Infrastructure
  const db = new LocalDatabase(process.env.LOCAL_DB_PATH || './data/azrael_tactical.db');
  const intel = new LocalThreatIntel(db, process.env.INTEL_PATH || './intel/');
  const ledger = new EncryptedShadowLedger(db);
  
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  const tacticalController = new LocalAZRAELController(db, broadcast);

  // Start the operational loop in the background
  tacticalController.operationalLoop().catch(err => {
    console.error("Tactical Controller Loop Failed:", err);
  });

  // Local threat feed ingestion
  app.post("/api/intel/ingest", async (req, res) => {
    const threat = req.body;
    db.insertThreat({
      id: threat.id || Math.random().toString(36).substring(7),
      name: threat.name || "MANUAL_INGEST",
      risk_level: threat.risk || "MEDIUM",
      status: "TRACKING",
      ioc_data: threat.ioc || {},
      source: "MANUAL_API"
    });
    res.json({ status: "INGESTED", timestamp: new Date().toISOString() });
  });

  // Encrypted shadow ledger recording
  app.post("/api/ledger/record", async (req, res) => {
    const entry = req.body;
    await ledger.recordEvidence({
      id: Math.random().toString(36).substring(7),
      classification: entry.classification,
      marker: entry.marker,
      notes: entry.notes || {},
      investigator_id: entry.investigator || "AZRAEL-LOCAL"
    });
    res.json({ status: "RECORDED_ENCRYPTED" });
  });

  // WebSocket for real-time threat alerts
  wss.on("connection", (ws: WebSocket) => {
    console.log("Investigator connected to neural link.");
    
    // Simulate real-time alerts
    const alertInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "THREAT_ALERT",
          data: {
            id: `ALERT-${Math.floor(Math.random() * 1000)}`,
            severity: "HIGH",
            source: "ABUSE_IP_DB",
            message: "Malicious IP detected in honey pot sector."
          }
        }));
      }
    }, 10000);

    ws.on("close", () => clearInterval(alertInterval));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`AZRAEL_CORE_SENTRY running on http://localhost:${PORT}`);
  });
}

startServer();
