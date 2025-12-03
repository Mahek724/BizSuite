// Lightweight helper: try to use mongodb-memory-server, otherwise fall back to a no-op stub.
// Usage in your tests:
// const memoryServer = require('./utils/memoryServer');
// const mongod = await memoryServer.create();
// const uri = await mongod.getUri();
// ... later await mongod.stop();

let hasMongoMemory = true;
let MongoMemoryServer;

try {
  // Use require so this helper works under commonjs/esm test setups
  // If mongodb-memory-server isn't installed this will throw and we'll fall back
  MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
} catch (err) {
  hasMongoMemory = false;
  // eslint-disable-next-line no-console
  console.warn("mongodb-memory-server not installed — tests will use fallback (no-op) memory server.");
}

module.exports = {
  hasMongoMemory,
  async create() {
    if (!hasMongoMemory) {
      // Return a minimal stub implementing the methods tests expect
      return {
        getUri: async () => "mongodb://127.0.0.1:27017/test", // local fallback
        stop: async () => {}, // no-op
      };
    }
    const instance = await MongoMemoryServer.create();
    return instance;
  },
};