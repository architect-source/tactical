import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';
import { LocalDatabase } from '../db/local';

export interface LedgerEntry {
  id: string;
  classification: string;
  marker: string;
  notes: any;
  evidence_path?: string;
  investigator_id: string;
}

export class EncryptedShadowLedger {
  private db: LocalDatabase;
  private key: Buffer;
  
  constructor(db: LocalDatabase, passphrase: string = 'AZRAEL_DEFAULT_PASS') {
    this.db = db;
    // Derive key from passphrase - never stored
    this.key = scryptSync(passphrase, 'azrael_salt', 32);
  }
  
  async recordEvidence(entry: LedgerEntry) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(entry.notes), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    const evidence_hash = createHash('sha256').update(JSON.stringify(entry.notes)).digest('hex');

    // Store encrypted blob
    this.db.insertLedgerEntry({
      id: entry.id,
      classification: entry.classification,
      marker: entry.marker,
      evidence_path: entry.evidence_path,
      evidence_hash: evidence_hash,
      investigator_id: entry.investigator_id,
      encrypted_notes: Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')])
    });

    console.log(`Evidence recorded for ${entry.id}. Hash: ${evidence_hash}`);
  }

  private hashEvidence(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
