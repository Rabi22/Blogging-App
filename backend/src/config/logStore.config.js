const logs = [];

const originalLog = console.log;
console.log = (...args) => {
  logs.push(args.join(" "));
  originalLog(...args);
};

export function getLogs() {
  return logs;
}
