const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
const baseName = "positeasy-staff-login-credentials";

const storeName = "login-credentials";

function connectDB(f, storeName) {
  const request = indexedDB.open(baseName, 1);
  request.onerror = function (err) {
    console.log(err);
  };
  request.onsuccess = function () {
    f(request.result);
  };
  request.onupgradeneeded = function (e) {
    const Db = e.currentTarget.result;

    if (!Db.objectStoreNames.contains(storeName)) {
      Db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
    connectDB(f);
  };
}

const loginCredentials = {
  /**
   * get all login credentials
   * @param {function} callback
   */
  getAllLoginCredentials(f) {
    return new Promise((resolve, reject) => {
      connectDB(function (db) {
        const rows = [];
        const store = db
          .transaction([storeName], "readonly")
          .objectStore(storeName);

        if (store.mozGetAll)
          store.mozGetAll().onsuccess = function (e) {
            f(e.target.result);
          };
        else
          store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
              rows.push(cursor.value);
              cursor.continue();
            } else {
              resolve(rows);
            }
          };
        store.openCursor().onerror = function (err) {
          reject(err);
        };
      }, storeName);
    });
  },
  /**
   *  add login credentials
   * @param {object} loginCredentials
   */
  addLoginCredentials(obj) {
    return new Promise((resolve, reject) => {
      connectDB((db) => {
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const objectStoreRequest = objectStore.add(obj);
        objectStoreRequest.onerror = function (err) {
          reject(err);
        };
        objectStoreRequest.onsuccess = function (res) {
          resolve(res);
        };
      }, storeName);
    });
  },
  /**
   * delete particular login credentials by id
   * @param {(number|string)} id
   */
  deleteLoginCredentials(id) {
    return new Promise((resolve, reject) => {
      connectDB((db) => {
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const objectStoreRequest = objectStore.delete(id);
        objectStoreRequest.onerror = function (err) {
          reject(err);
        };
        objectStoreRequest.onsuccess = function (res) {
          resolve(res);
        };
      }, storeName);
    });
  },

  /**
   * edit particular login credentials
   * @param {object} Customer
   */
  editParticularLoginCredentials(obj) {
    return new Promise((resolve, reject) => {
      connectDB((db) => {
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const objectStoreRequest = objectStore.put(obj);
        objectStoreRequest.onerror = function (err) {
          reject(err);
        };
        objectStoreRequest.onsuccess = function (res) {
          resolve(res);
        };
      }, storeName);
    });
  },
};
export default loginCredentials;
