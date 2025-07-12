import { sendSlackNotification } from "@/api/functions";

export class SlackNotifier {
  static async sendLeaveRequest(leaveRequest, employee, settings) {
    if (!settings?.integrations?.slack?.enabled) return;
    
    const config = settings.integrations.slack.config;
    if (!config?.notifications?.leave_requests) return;

    try {
      await sendSlackNotification({
        webhook_url: config.webhook_url,
        message: `Nouvelle demande de congé de ${employee.first_name} ${employee.last_name}`,
        type: 'leave_request',
        data: {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          leave_type: leaveRequest.leave_type,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
          reason: leaveRequest.reason,
          days_requested: leaveRequest.days_requested
        }
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  static async sendNewEmployee(employee, settings) {
    if (!settings?.integrations?.slack?.enabled) return;
    
    const config = settings.integrations.slack.config;
    if (!config?.notifications?.new_employees) return;

    try {
      await sendSlackNotification({
        webhook_url: config.webhook_url,
        message: `👋 Bienvenue à ${employee.first_name} ${employee.last_name} qui rejoint l'équipe !`,
        type: 'new_employee',
        data: {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          department: employee.department,
          position: employee.position,
          start_date: employee.start_date
        }
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  static async sendUrgentAnnouncement(announcement, settings) {
    if (!settings?.integrations?.slack?.enabled) return;
    
    const config = settings.integrations.slack.config;
    if (!config?.notifications?.urgent_announcements) return;

    try {
      await sendSlackNotification({
        webhook_url: config.webhook_url,
        message: `🚨 Annonce urgente: ${announcement.title}`,
        type: 'urgent_announcement',
        data: {
          title: announcement.title,
          content: announcement.content
        }
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  static async sendPerformanceReview(review, employee, settings) {
    if (!settings?.integrations?.slack?.enabled) return;
    
    const config = settings.integrations.slack.config;
    if (!config?.notifications?.performance_reviews) return;

    try {
      await sendSlackNotification({
        webhook_url: config.webhook_url,
        message: `⭐ Nouvelle évaluation de performance pour ${employee.first_name} ${employee.last_name}`,
        type: 'performance_review',
        data: {
          employee_name: `${employee.first_name} ${employee.last_name}`,
          rating: review.overall_rating,
          review_period: review.review_period
        }
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}