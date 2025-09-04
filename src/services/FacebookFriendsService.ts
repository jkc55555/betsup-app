import {GraphRequest, GraphRequestManager, AccessToken} from 'react-native-fbsdk-next';

export interface FacebookFriend {
  id: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookFriendsResponse {
  data: FacebookFriend[];
  paging?: {
    next?: string;
    previous?: string;
  };
}

class FacebookFriendsService {
  /**
   * Fetch Facebook friends who are also using the app
   * Note: Due to Facebook's API restrictions, this will only return friends
   * who have also authorized your app and granted the user_friends permission
   */
  async getFriends(): Promise<FacebookFriend[]> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if user has a valid access token
        const accessToken = await AccessToken.getCurrentAccessToken();
        if (!accessToken) {
          reject(new Error('No Facebook access token available'));
          return;
        }

        // Create request to get friends
        const request = new GraphRequest(
          '/me/friends',
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string: 'id,name,picture.type(small)'
              }
            }
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              const response = result as FacebookFriendsResponse;
              resolve(response.data || []);
            }
          }
        );

        // Execute the request
        new GraphRequestManager().addRequest(request).start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get user's Facebook profile information
   */
  async getUserProfile(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const accessToken = await AccessToken.getCurrentAccessToken();
        if (!accessToken) {
          reject(new Error('No Facebook access token available'));
          return;
        }

        const request = new GraphRequest(
          '/me',
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string: 'id,name,email,picture.type(large)'
              }
            }
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        new GraphRequestManager().addRequest(request).start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send app request (invitation) to Facebook friends
   * This creates a Facebook app request that appears in the recipient's notifications
   */
  async sendAppRequest(friendIds: string[], message: string, data?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = new GraphRequest(
          '/me/apprequests',
          {
            httpMethod: 'POST',
            parameters: {
              message: {
                string: message
              },
              to: {
                string: friendIds.join(',')
              },
              data: {
                string: JSON.stringify(data || {})
              }
            }
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );

        new GraphRequestManager().addRequest(request).start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create a shareable link for a bet that can be posted to Facebook
   */
  createBetShareLink(betId: string, betTitle: string): string {
    // This would be your app's deep link or web link
    const baseUrl = 'https://betbuddies.app'; // Replace with your actual domain
    return `${baseUrl}/bet/${betId}?title=${encodeURIComponent(betTitle)}`;
  }

  /**
   * Share bet to Facebook timeline (requires publish_actions permission)
   * Note: Facebook has deprecated this permission for most apps
   */
  async shareBetToTimeline(betId: string, betTitle: string, description: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const shareLink = this.createBetShareLink(betId, betTitle);
        
        const request = new GraphRequest(
          '/me/feed',
          {
            httpMethod: 'POST',
            parameters: {
              message: {
                string: `Check out this bet: ${betTitle}`
              },
              link: {
                string: shareLink
              },
              description: {
                string: description
              }
            }
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );

        new GraphRequestManager().addRequest(request).start();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new FacebookFriendsService();
