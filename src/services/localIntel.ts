import { readFileSync, watch, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { LocalDatabase, LocalThreat } from '../db/local';

export class LocalThreatIntel {
  private db: LocalDatabase;
  private intelPath: string;
  
  constructor(db: LocalDatabase, intelPath: string = './intel/') {
    this.db = db;
    this.intelPath = intelPath;
    if (!existsSync(this.intelPath)) {
      mkdirSync(this.intelPath, { recursive: true });
    }
    this.loadStaticFeeds();
    this.watchForUpdates();
  }
  
  private loadStaticFeeds() {
    const feeds = [
      './intel/mitre-attack.json',
      './intel/openphish.txt',
      './intel/custom-signatures.json'
    ];
    
    for (const feed of feeds) {
      try {
        if (existsSync(feed)) {
          const data = readFileSync(feed, 'utf8');
          this.parseAndStore(feed, data);
        }
      } catch (err) {
        console.log(`Feed processing failed: ${feed}`, err);
      }
    }
  }
  
  private watchForUpdates() {
    watch(this.intelPath, (eventType, filename) => {
      if (filename && (filename.endsWith('.json') || filename.endsWith('.txt'))) {
        console.log(`Intel update detected: ${filename}`);
        this.loadStaticFeeds();
      }
    });
  }
  
  private parseAndStore(source: string, data: string) {
    try {
      let threats: any[] = [];
      if (source.endsWith('.json')) {
        const parsed = JSON.parse(data);
        threats = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Simple line-based parsing for txt
        threats = data.split('\n').filter(line => line.trim()).map(line => ({
          name: `IOC_MATCH: ${line.trim()}`,
          risk_level: 'HIGH',
          status: 'TRACKING',
          ioc_data: { type: 'domain', value: line.trim() }
        }));
      }

      const sourceHash = createHash('sha256').update(source).digest('hex').slice(0, 16);
      
      for (const t of threats) {
        this.db.insertThreat({
          id: t.id || createHash('md5').update(JSON.stringify(t.ioc_data)).digest('hex'),
          name: t.name || 'UNNAMED_THREAT',
          risk_level: t.risk_level || 'MEDIUM',
          status: t.status || 'MONITORING',
          ioc_data: t.ioc_data,
          source: `LOCAL_${sourceHash}`
        });
      }
    } catch (error) {
      console.error(`Error parsing source ${source}:`, error);
    }
  }
}
