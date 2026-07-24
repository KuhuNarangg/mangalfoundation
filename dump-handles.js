const inspector = require('inspector');
const session = new inspector.Session();
session.connect();
session.post('Runtime.evaluate', { expression: 'process._getActiveHandles().map(h => h.constructor.name).join(", ")' }, (err, res) => {
  console.log("Handles:", res.result.value);
  session.post('Runtime.evaluate', { expression: 'process._getActiveRequests().map(h => h.constructor.name).join(", ")' }, (err, res) => {
    console.log("Requests:", res.result.value);
    process.exit();
  });
});
