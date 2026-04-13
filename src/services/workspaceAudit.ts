import { google } from 'googleapis';

export class WorkspaceAuditService {
  private admin;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/admin.reports.audit.readonly',
        'https://www.googleapis.com/auth/admin.reports.usage.readonly'
      ],
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    this.admin = google.admin({ version: 'reports_v1', auth });
  }

  async monitorLoginAnomalies() {
    try {
      const response = await this.admin.activities.list({
        userKey: 'all',
        applicationName: 'login',
        filters: 'eventName==login_failure'
      });
      
      return this.analyzeForCompromise(response.data.items || []);
    } catch (error) {
      console.error("Workspace Login Audit Failed:", error);
      return [];
    }
  }
  
  async detectEmailForwarding() {
    try {
      const activities = await this.admin.activities.list({
        userKey: 'all',
        applicationName: 'login',
        filters: 'eventName==emailForwardingOutOfDomain'
      });
      
      return activities.data.items?.map(activity => ({
        user: activity.actor?.email,
        time: activity.id?.time,
        severity: 'CRITICAL',
        type: 'ACCOUNT_COMPROMISE_INDICATOR'
      })) || [];
    } catch (error) {
      console.error("Workspace Email Forwarding Audit Failed:", error);
      return [];
    }
  }

  private analyzeForCompromise(items: any[]) {
    return items.map(item => ({
      id: item.id.uniqueQualifier,
      type: 'SUSPICIOUS_LOGIN',
      user: item.actor.email,
      timestamp: item.id.time,
      details: item.events[0].name
    }));
  }
}
