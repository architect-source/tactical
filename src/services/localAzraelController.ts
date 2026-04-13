import { LocalDatabase, LocalThreat } from '../db/local';
import { ICAdapter } from './icAdapter';

export interface Action {
  type: string;
  payload: any;
}

export class LocalAZRAELController {
  private db: LocalDatabase;
  private constraintThreshold: number;
  private broadcastCallback: (data: any) => void;
  private icAdapter: ICAdapter;
  private survivalKey: string | undefined;
  
  constructor(db: LocalDatabase, broadcastCallback: (data: any) => void) {
    this.db = db;
    this.constraintThreshold = parseFloat(process.env.AZRAEL_DRIFT_THRESHOLD || '0.85');
    this.broadcastCallback = broadcastCallback;
    this.icAdapter = new ICAdapter();
    this.survivalKey = process.env.AZRAEL_SURVIVAL_KEY;
  }
  
  async evaluateAction(threat: LocalThreat, proposedAction: Action) {
    const riskScore = this.calculateRisk(proposedAction);
    
    // Check for Survival Key Override
    const hasOverride = this.survivalKey && this.survivalKey !== "[Your_Forged_Key]";

    if (riskScore > this.constraintThreshold && !hasOverride) {
      // DRIFT MODE: Log null action, do not execute
      this.db.insertNullAction({
        threat_id: threat.id,
        reason: 'Risk threshold exceeded',
        constraint_violated: `THRESHOLD_${this.constraintThreshold}`,
        investigator: process.env.INVESTIGATOR_ID || 'AZRAEL-LOCAL'
      });
      
      // Notify via local WebSocket
      this.broadcastCallback({
        type: 'NULL_ACTION',
        data: {
          threat: threat.name,
          reason: 'Safety constraint triggered',
          requires_human: true,
          timestamp: new Date().toISOString()
        }
      });
      
      return { executed: false, drift: true };
    }
    
    // Execute action (Simulated)
    console.log(`Executing ${proposedAction.type} for threat ${threat.id}`);
    
    // Sync to IC if possible
    await this.icAdapter.syncToCanister({ threat, action: proposedAction });

    return { executed: true, drift: false, override: hasOverride };
  }

  private calculateRisk(action: Action): number {
    // Logic to determine risk of an action
    // For now, random or based on action type
    if (action.type === 'DESTRUCTIVE_ERASE') return 0.95;
    if (action.type === 'MONITOR_ONLY') return 0.1;
    return Math.random();
  }

  async operationalLoop() {
    console.log("AZRAEL_LOCAL_CONTROLLER: Operational loop started.");
    while (true) {
      const recentThreats = this.db.getRecentThreats(5);
      if (recentThreats.length > 0) {
        this.broadcastCallback({
          type: 'THREAT_ALERT',
          data: recentThreats[0]
        });
      }
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15s polling interval
    }
  }
}
