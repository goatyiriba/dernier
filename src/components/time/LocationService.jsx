// Service pour gérer la géolocalisation et les informations de localisation
export class LocationService {
  static async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée par ce navigateur.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Erreur géolocalisation:', error);
          // Ne pas rejeter complètement, juste signaler l'erreur
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Modifié pour éviter les timeouts
          timeout: 5000, // Réduit à 5 secondes
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      // Timeout pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'FlowHR-TimeTracking'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.warn('Impossible d\'obtenir l\'adresse depuis les coordonnées:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  static async getPublicIPAddress() {
    try {
      // Multiple services de fallback
      const services = [
        'https://api64.ipify.org?format=json',
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/'
      ];

      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(service, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            return data.ip || data.query || 'Unknown';
          }
        } catch (serviceError) {
          console.warn(`Service IP ${service} failed:`, serviceError);
          continue;
        }
      }
      
      throw new Error('All IP services failed');
    } catch (error) {
      console.warn('Impossible d\'obtenir l\'adresse IP:', error);
      return 'IP non disponible';
    }
  }

  static getDeviceInfo() {
    try {
      const userAgent = navigator.userAgent;
      let deviceType = 'Desktop';
      let browser = 'Unknown';
      let os = 'Unknown';

      // Detect device type
      if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Mobile';
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'Tablet';
      }

      // Detect browser
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
      } else if (userAgent.includes('Opera')) {
        browser = 'Opera';
      }

      // Detect OS
      if (userAgent.includes('Windows NT')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac OS X')) {
        os = 'macOS';
      } else if (userAgent.includes('Linux') && !userAgent.includes('Android')) {
        os = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
      } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
      }

      return `${deviceType} - ${browser} sur ${os}`;
    } catch (error) {
      console.warn('Erreur détection appareil:', error);
      return 'Appareil inconnu';
    }
  }

  static async getAllLocationData() {
    try {
      console.log('🌍 Récupération données de localisation...');
      
      // Récupérer IP et position en parallèle avec timeout global
      const locationPromise = Promise.race([
        Promise.all([
          this.getCurrentPosition(),
          this.getPublicIPAddress()
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout global')), 8000)
        )
      ]);

      const [position, ipAddress] = await locationPromise;

      let locationData = {
        ip_address: ipAddress || 'IP non disponible',
        device_info: this.getDeviceInfo()
      };

      if (position && position.latitude && position.longitude) {
        locationData.latitude = position.latitude;
        locationData.longitude = position.longitude;
        
        // Obtenir l'adresse depuis les coordonnées
        try {
          locationData.address = await this.getAddressFromCoordinates(
            position.latitude, 
            position.longitude
          );
          locationData.location = locationData.address; // Compatibilité
        } catch (addressError) {
          console.warn('Impossible d\'obtenir l\'adresse:', addressError);
          locationData.location = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
          locationData.address = locationData.location;
        }
      } else {
        locationData.location = 'Localisation non disponible';
        locationData.address = 'Adresse non disponible';
      }

      console.log('✅ Données de localisation récupérées:', locationData);
      return locationData;
    } catch (error) {
      console.error('❌ Erreur récupération données de localisation:', error);
      
      // Retourner des données minimales en cas d'erreur
      return {
        ip_address: 'IP non disponible',
        device_info: this.getDeviceInfo(),
        location: 'Localisation non disponible',
        address: 'Adresse non disponible',
        error: error.message
      };
    }
  }
}