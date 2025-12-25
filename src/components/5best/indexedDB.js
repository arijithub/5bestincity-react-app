import { openDB } from 'idb';

// 1. Open or create the IndexedDB database and declare the schema
export const openDatabase = async () => {
  return await openDB('ReviewsDatabase', 1, {
    upgrade(db) {
      // Create an object store (table) called 'likes' with 'review_id' as the primary key
      if (!db.objectStoreNames.contains('likes')) {
        db.createObjectStore('likes', {
          keyPath: 'review_id', // Declare review_id as the key
        });
      }
    },
  });
};

// 2. Add or update a like in IndexedDB by review_id
export const setLike = async (reviewId, liked) => {
  const db = await openDatabase();
  const tx = db.transaction('likes', 'readwrite'); // Start a read/write transaction
  const store = tx.objectStore('likes'); // Access the 'likes' store
  await store.put({ review_id: reviewId, liked }); // Insert or update the like state
  await tx.done; // Ensure the transaction is completed
};

// 3. Get the like status from IndexedDB by review_id
export const getLike = async (reviewId) => {
  const db = await openDatabase();
  const tx = db.transaction('likes', 'readonly'); // Start a readonly transaction
  const store = tx.objectStore('likes'); // Access the 'likes' store
  const result = await store.get(reviewId); // Get the record by review_id
  return result ? result.liked : false; // Return true if liked, false if no record exists
};

// 4. Remove a like from IndexedDB by review_id
export const removeLike = async (reviewId) => {
  const db = await openDatabase();
  const tx = db.transaction('likes', 'readwrite'); // Start a read/write transaction
  const store = tx.objectStore('likes'); // Access the 'likes' store
  await store.delete(reviewId); // Remove the like by review_id
  await tx.done; // Ensure the transaction is completed
};
