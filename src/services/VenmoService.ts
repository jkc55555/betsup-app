import {Linking, Alert} from 'react-native';

export interface VenmoPaymentRequest {
  recipientUsername: string;
  amount: number;
  note: string;
  audience?: 'public' | 'friends' | 'private';
}

class VenmoService {
  /**
   * Generate a Venmo deep link for payment
   * This opens the Venmo app with pre-filled payment information
   */
  generateVenmoDeepLink({
    recipientUsername,
    amount,
    note,
    audience = 'private'
  }: VenmoPaymentRequest): string {
    // Remove @ symbol if present
    const cleanUsername = recipientUsername.replace('@', '');
    
    // Encode the note for URL
    const encodedNote = encodeURIComponent(note);
    
    // Create Venmo deep link
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${cleanUsername}&amount=${amount}&note=${encodedNote}&audience=${audience}`;
    
    return venmoUrl;
  }

  /**
   * Generate a Venmo web URL as fallback
   * This opens Venmo in the browser if the app isn't installed
   */
  generateVenmoWebLink({
    recipientUsername,
    amount,
    note,
    audience = 'private'
  }: VenmoPaymentRequest): string {
    const cleanUsername = recipientUsername.replace('@', '');
    const encodedNote = encodeURIComponent(note);
    
    return `https://venmo.com/${cleanUsername}?txn=pay&amount=${amount}&note=${encodedNote}&audience=${audience}`;
  }

  /**
   * Open Venmo payment with fallback to web
   */
  async openVenmoPayment(paymentRequest: VenmoPaymentRequest): Promise<boolean> {
    try {
      const deepLink = this.generateVenmoDeepLink(paymentRequest);
      
      // Check if Venmo app is installed
      const canOpenDeepLink = await Linking.canOpenURL(deepLink);
      
      if (canOpenDeepLink) {
        // Open Venmo app
        await Linking.openURL(deepLink);
        return true;
      } else {
        // Fallback to web version
        const webLink = this.generateVenmoWebLink(paymentRequest);
        const canOpenWeb = await Linking.canOpenURL(webLink);
        
        if (canOpenWeb) {
          await Linking.openURL(webLink);
          return true;
        } else {
          throw new Error('Cannot open Venmo');
        }
      }
    } catch (error) {
      console.error('Error opening Venmo:', error);
      return false;
    }
  }

  /**
   * Validate Venmo username format
   */
  isValidVenmoUsername(username: string): boolean {
    if (!username) return false;
    
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    
    // Venmo usernames are 5-30 characters, alphanumeric, hyphens, and underscores
    const venmoUsernameRegex = /^[a-zA-Z0-9_-]{5,30}$/;
    
    return venmoUsernameRegex.test(cleanUsername);
  }

  /**
   * Format username for display (add @ if not present)
   */
  formatUsernameForDisplay(username: string): string {
    if (!username) return '';
    return username.startsWith('@') ? username : `@${username}`;
  }

  /**
   * Create a payment request with bet context
   */
  createBetPaymentRequest(
    recipientUsername: string,
    amount: number,
    betTitle: string,
    payerName: string
  ): VenmoPaymentRequest {
    const note = `BetBuddies: Payment for "${betTitle}" from ${payerName}`;
    
    return {
      recipientUsername,
      amount,
      note,
      audience: 'private' // Keep bet payments private
    };
  }

  /**
   * Show payment confirmation dialog
   */
  showPaymentConfirmation(
    recipientUsername: string,
    amount: number,
    betTitle: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    const formattedUsername = this.formatUsernameForDisplay(recipientUsername);
    
    Alert.alert(
      'Confirm Payment',
      `Pay ${formattedUsername} $${amount.toFixed(2)} for "${betTitle}"?\n\nThis will open Venmo to complete the payment.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: 'Pay with Venmo',
          onPress: onConfirm
        }
      ]
    );
  }

  /**
   * Handle payment completion callback
   * In a real app, you'd verify the payment through Venmo's API or webhooks
   */
  handlePaymentCompletion(
    paymentRequestId: string,
    onSuccess: () => void,
    onFailure: (error: string) => void
  ): void {
    // This is a simplified version - in reality you'd need to:
    // 1. Listen for app state changes to detect return from Venmo
    // 2. Verify payment through backend API
    // 3. Update payment status in database
    
    Alert.alert(
      'Payment Status',
      'Did you complete the payment in Venmo?',
      [
        {
          text: 'No, Cancel',
          style: 'cancel',
          onPress: () => onFailure('Payment cancelled by user')
        },
        {
          text: 'Yes, I Paid',
          onPress: () => {
            // In a real app, you'd verify this through your backend
            onSuccess();
          }
        }
      ]
    );
  }

  /**
   * Generate a shareable payment link for bet winners
   */
  generateShareablePaymentLink(
    recipientUsername: string,
    amount: number,
    betTitle: string
  ): string {
    const paymentRequest = this.createBetPaymentRequest(
      recipientUsername,
      amount,
      betTitle,
      'BetBuddies User'
    );
    
    return this.generateVenmoWebLink(paymentRequest);
  }

  /**
   * Check if Venmo is available on the device
   */
  async isVenmoAvailable(): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL('venmo://');
      return canOpen;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Venmo app download URL
   */
  getVenmoDownloadUrl(): string {
    return 'https://venmo.com/download';
  }
}

export default new VenmoService();
