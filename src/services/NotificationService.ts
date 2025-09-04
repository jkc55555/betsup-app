import {Alert} from 'react-native';
import PushNotification from 'react-native-push-notification';

export interface NotificationData {
  betId?: string;
  paymentId?: string;
  groupId?: string;
  type: 'bet_created' | 'bet_joined' | 'bet_ready_for_resolution' | 'bet_resolved' | 'payment_required' | 'payment_received' | 'neutral_party_assigned';
  title: string;
  message: string;
  data?: any;
}

class NotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        // In a real app, send this token to your backend
      },

      onNotification: (notification) => {
        console.log('Notification received:', notification);
        
        if (notification.userInteraction) {
          // User tapped on notification
          this.handleNotificationTap(notification);
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  /**
   * Send a local notification
   */
  sendLocalNotification(data: NotificationData) {
    PushNotification.localNotification({
      title: data.title,
      message: data.message,
      userInfo: {
        betId: data.betId,
        paymentId: data.paymentId,
        groupId: data.groupId,
        type: data.type,
        ...data.data,
      },
      playSound: true,
      soundName: 'default',
    });
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  handleNotificationTap(notification: any) {
    const {type, betId, paymentId} = notification.userInfo || {};

    switch (type) {
      case 'bet_ready_for_resolution':
      case 'neutral_party_assigned':
        if (betId) {
          // Navigate to bet details
          // This would be handled by your navigation service
          console.log('Navigate to bet:', betId);
        }
        break;
      
      case 'payment_required':
        if (paymentId) {
          // Navigate to payment screen
          console.log('Navigate to payment:', paymentId);
        }
        break;
      
      default:
        console.log('Unknown notification type:', type);
    }
  }

  /**
   * Notify neutral party that they've been assigned to a bet
   */
  notifyNeutralPartyAssigned(neutralPartyId: string, betTitle: string, betId: string) {
    // In a real app, this would send a push notification through your backend
    // For demo purposes, we'll show a local notification
    
    this.sendLocalNotification({
      type: 'neutral_party_assigned',
      title: 'You\'ve been chosen as a neutral party!',
      message: `You've been selected to decide the winner of "${betTitle}". You'll be notified when the bet is ready for resolution.`,
      betId,
    });
  }

  /**
   * Notify neutral party that bet is ready for resolution
   */
  notifyBetReadyForResolution(neutralPartyId: string, betTitle: string, betId: string) {
    this.sendLocalNotification({
      type: 'bet_ready_for_resolution',
      title: 'Bet ready for your decision',
      message: `The bet "${betTitle}" is ready for resolution. Tap to review evidence and declare a winner.`,
      betId,
    });
  }

  /**
   * Notify participants that bet has been resolved
   */
  notifyBetResolved(participantIds: string[], betTitle: string, winner: string, betId: string) {
    this.sendLocalNotification({
      type: 'bet_resolved',
      title: 'Bet resolved!',
      message: `"${betTitle}" has been resolved. Winner: ${winner}`,
      betId,
    });
  }

  /**
   * Notify user they need to make a payment
   */
  notifyPaymentRequired(userId: string, amount: number, betTitle: string, paymentId: string) {
    this.sendLocalNotification({
      type: 'payment_required',
      title: 'Payment required',
      message: `You need to pay $${amount.toFixed(2)} for "${betTitle}". Tap to pay with Venmo.`,
      paymentId,
    });
  }

  /**
   * Notify user they received a payment
   */
  notifyPaymentReceived(userId: string, amount: number, betTitle: string, fromUser: string) {
    this.sendLocalNotification({
      type: 'payment_received',
      title: 'Payment received!',
      message: `You received $${amount.toFixed(2)} from ${fromUser} for "${betTitle}".`,
    });
  }

  /**
   * Notify participants when someone joins a bet
   */
  notifyBetJoined(participantIds: string[], joinerName: string, betTitle: string, betId: string) {
    this.sendLocalNotification({
      type: 'bet_joined',
      title: 'Someone joined your bet!',
      message: `${joinerName} joined "${betTitle}".`,
      betId,
    });
  }

  /**
   * Notify invited users about new bet
   */
  notifyBetCreated(invitedUserIds: string[], creatorName: string, betTitle: string, betId: string) {
    this.sendLocalNotification({
      type: 'bet_created',
      title: 'You\'ve been invited to a bet!',
      message: `${creatorName} invited you to "${betTitle}". Tap to join!`,
      betId,
    });
  }

  /**
   * Schedule a reminder notification
   */
  scheduleReminder(data: NotificationData, delayMinutes: number) {
    const date = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    PushNotification.localNotificationSchedule({
      title: data.title,
      message: data.message,
      date,
      userInfo: {
        betId: data.betId,
        paymentId: data.paymentId,
        type: data.type,
        ...data.data,
      },
    });
  }

  /**
   * Cancel all notifications for a specific bet
   */
  cancelBetNotifications(betId: string) {
    // In a real app, you'd track notification IDs and cancel them
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Request notification permissions (iOS)
   */
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  /**
   * Check if notifications are enabled
   */
  async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  /**
   * Show alert if notifications are disabled
   */
  async promptForPermissions() {
    const hasPermissions = await this.checkPermissions();
    
    if (!hasPermissions) {
      Alert.alert(
        'Enable Notifications',
        'Get notified about bet updates, payments, and when you need to make decisions as a neutral party.',
        [
          {text: 'Not Now', style: 'cancel'},
          {
            text: 'Enable',
            onPress: async () => {
              await this.requestPermissions();
            }
          }
        ]
      );
    }
  }
}

export default new NotificationService();
