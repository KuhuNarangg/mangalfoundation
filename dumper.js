const fs = require('fs');
const fd = fs.openSync('dumper_output.txt', 'w');

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(path, options) {
  fs.writeSync(fd, "readFileSync called with path: " + path + "\n");
  try {
    const res = originalReadFileSync.apply(this, arguments);
    fs.writeSync(fd, "readFileSync FINISHED for: " + path + "\n");
    return res;
  } catch (err) {
    fs.writeSync(fd, "readFileSync ERROR for: " + path + " - " + err.message + "\n");
    throw err;
  }
};

const originalReadSync = fs.readSync;
fs.readSync = function(fd_in, buffer, offset, length, position) {
  fs.writeSync(fd, "readSync called with fd: " + fd_in + "\n");
  try {
    const res = originalReadSync.apply(this, arguments);
    fs.writeSync(fd, "readSync FINISHED for fd: " + fd_in + "\n");
    return res;
  } catch (err) {
    fs.writeSync(fd, "readSync ERROR for fd: " + fd_in + " - " + err.message + "\n");
    throw err;
  }
};
