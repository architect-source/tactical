import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface LocalThreat {
  id: string;
  name: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TRACKING' | 'ENGAGED' | 'MONITORING' | 'NEUTRALIZED';
  ioc_data: any;
  first_seen?: number;
  last_active?: number;
  source?: string;
  evidence_hash?: string;
}

export class LocalDatabase {
  private db: Database.Database;
  
  constructor(dbPath: string = './data/azrael_tactical.db') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(dbPath);
    this.initTables();
  }
  
  private initTables() {
    // Threats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS threats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        risk_level TEXT CHECK(risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
        status TEXT CHECK(status IN ('TRACKING', 'ENGAGED', 'MONITORING', 'NEUTRALIZED')),
        ioc_data TEXT, -- JSON
        first_seen INTEGER,
        last_active INTEGER,
        source TEXT,
        evidence_hash TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_risk ON threats(risk_level);
      CREATE INDEX IF NOT EXISTS idx_status ON threats(status);
    `);
    
    // Shadow ledger (encrypted at rest)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shadow_ledger (
        id TEXT PRIMARY KEY,
        classification TEXT,
        marker TEXT,
        evidence_path TEXT,
        evidence_hash TEXT,
        timestamp INTEGER DEFAULT (unixepoch()),
        investigator_id TEXT,
        encrypted_notes BLOB -- AES-256 encrypted
      );
    `);
    
    // Null actions log (AZRAEL compliance)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS null_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER DEFAULT (unixepoch()),
        threat_id TEXT,
        reason TEXT,
        constraint_violated TEXT,
        investigator TEXT
      );
    `);
  }
  
  insertThreat(threat: LocalThreat) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO threats 
      (id, name, risk_level, status, ioc_data, first_seen, last_active, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      threat.id,
      threat.name,
      threat.risk_level,
      threat.status,
      JSON.stringify(threat.ioc_data),
      threat.first_seen || Date.now(),
      threat.last_active || Date.now(),
      threat.source || 'LOCAL_INTEL'
    );
  }

  insertNullAction(data: { threat_id: string, reason: string, constraint_violated: string, investigator: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO null_actions (threat_id, reason, constraint_violated, investigator)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(data.threat_id, data.reason, data.constraint_violated, data.investigator);
  }

  insertLedgerEntry(data: {
    id: string,
    classification: string,
    marker: string,
    evidence_path?: string,
    evidence_hash: string,
    investigator_id: string,
    encrypted_notes: Buffer
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO shadow_ledger (id, classification, marker, evidence_path, evidence_hash, investigator_id, encrypted_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.id, data.classification, data.marker, data.evidence_path, data.evidence_hash, data.investigator_id, data.encrypted_notes);
  }

  getRecentThreats(limit: number = 10) {
    const stmt = this.db.prepare(`SELECT * FROM threats ORDER BY last_active DESC LIMIT ?`);
    return stmt.all(limit).map((row: any) => ({
      ...row,
      ioc_data: JSON.parse(row.ioc_data)
    }));
  }

  findThreatByIOC(value: string) {
    const stmt = this.db.prepare(`SELECT * FROM threats WHERE ioc_data LIKE ?`);
    const row: any = stmt.get(`%${value}%`);
    if (row) {
      return {
        ...row,
        ioc_data: JSON.parse(row.ioc_data)
      };
    }
    return null;
  }
}
