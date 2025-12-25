const DB_NAME = 'linkTrackingDB';
const DB_VERSION = 1;
const LINK_STORE = 'linkStore';

let db = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    console.log('Initializing IndexedDB...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      console.log('IndexedDB opened successfully');
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('Creating/upgrading object stores');
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(LINK_STORE)) {
        const store = db.createObjectStore(LINK_STORE, { 
          keyPath: 'link_id',
          autoIncrement: false
        });
        
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('clickCount', 'clickCount', { unique: false });
        store.createIndex('hiddenFrom', 'hiddenFrom', { unique: false });
        console.log('Object store created');
      }
    };
  });
};

const trackLinkClick = async (linkData) => {
  try {
    console.log('Tracking link click:', linkData);
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LINK_STORE, 'readwrite');
      const store = transaction.objectStore(LINK_STORE);
      
      const request = store.get(linkData.link_id);
      
      request.onerror = (event) => {
        console.error('Error getting link data:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const existingData = event.target.result;
        const newData = {
          ...linkData,
          timestamp: Date.now(),
          clickCount: (existingData?.clickCount || 0) + 1,
          hiddenFrom: existingData?.hiddenFrom || [] // Preserve hidden status
        };

        console.log('Saving link data:', newData);
        const putRequest = store.put(newData);

        putRequest.onsuccess = () => {
          console.log('Link data saved successfully');
          resolve(newData);
        };

        putRequest.onerror = (event) => {
          console.error('Error saving link data:', event.target.error);
          reject(event.target.error);
        };
      };
    });
  } catch (error) {
    console.error('Error in trackLinkClick:', error);
    throw error;
  }
};

const getRecentlyViewed = async (limit = 10) => {
  try {
    console.log('Getting recently viewed links...');
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LINK_STORE, 'readonly');
      const store = transaction.objectStore(LINK_STORE);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results = [];

      request.onerror = (event) => {
        console.error('Error getting recent links:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Only include items that aren't hidden from recently viewed
          const item = cursor.value;
          const hiddenFrom = item.hiddenFrom || [];
          if (!hiddenFrom.includes('recent') && results.length < limit) {
            results.push(item);
          }
          cursor.continue();
        } else {
          console.log('Retrieved recently viewed links:', results);
          resolve(results);
        }
      };
    });
  } catch (error) {
    console.error('Error in getRecentlyViewed:', error);
    throw error;
  }
};

const getMostViewed = async (limit = 10) => {
  try {
    console.log('Getting most viewed links...');
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LINK_STORE, 'readonly');
      const store = transaction.objectStore(LINK_STORE);
      const index = store.index('clickCount');
      const request = index.openCursor(null, 'prev');
      const results = [];

      request.onerror = (event) => {
        console.error('Error getting most viewed links:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Only include items that aren't hidden from most viewed
          const item = cursor.value;
          const hiddenFrom = item.hiddenFrom || [];
          if (!hiddenFrom.includes('most') && results.length < limit) {
            results.push(item);
          }
          cursor.continue();
        } else {
          console.log('Retrieved most viewed links:', results);
          resolve(results);
        }
      };
    });
  } catch (error) {
    console.error('Error in getMostViewed:', error);
    throw error;
  }
};

export const removeFromRecentlyViewed = async (linkId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(LINK_STORE, 'readwrite');
    const store = tx.objectStore(LINK_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(linkId);
      
      getRequest.onsuccess = (event) => {
        const existingData = event.target.result;
        if (existingData) {
          const hiddenFrom = existingData.hiddenFrom || [];
          if (!hiddenFrom.includes('recent')) {
            hiddenFrom.push('recent');
          }
          
          const updatedData = {
            ...existingData,
            hiddenFrom
          };
          
          const putRequest = store.put(updatedData);
          putRequest.onsuccess = () => {
            console.log('Link hidden from recently viewed successfully');
            resolve(true);
          };
          
          putRequest.onerror = (event) => {
            console.error('Error updating link data:', event.target.error);
            reject(event.target.error);
          };
        } else {
          console.warn(`Link with id ${linkId} not found for hiding from recently viewed.`);
          resolve(false);
        }
      };
      
      getRequest.onerror = (event) => {
        console.error('Error getting link data:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    throw error;
  }
};

export const removeFromMostViewed = async (linkId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(LINK_STORE, 'readwrite');
    const store = tx.objectStore(LINK_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(linkId);
      
      getRequest.onsuccess = (event) => {
        const existingData = event.target.result;
        if (existingData) {
          const hiddenFrom = existingData.hiddenFrom || [];
          if (!hiddenFrom.includes('most')) {
            hiddenFrom.push('most');
          }
          
          const updatedData = {
            ...existingData,
            hiddenFrom
          };
          
          const putRequest = store.put(updatedData);
          putRequest.onsuccess = () => {
            console.log('Link hidden from most viewed successfully');
            resolve(true);
          };
          
          putRequest.onerror = (event) => {
            console.error('Error updating link data:', event.target.error);
            reject(event.target.error);
          };
        } else {
          console.warn(`Link with id ${linkId} not found for hiding from most viewed.`);
          resolve(false);
        }
      };
      
      getRequest.onerror = (event) => {
        console.error('Error getting link data:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error removing from most viewed:', error);
    throw error;
  }
};

// Initialize the database when the module loads
initDB().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});

export { trackLinkClick, getRecentlyViewed, getMostViewed };