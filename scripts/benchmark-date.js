
const { performance } = require('perf_hooks');

function formatDateOld(date) {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDateNew(date) {
  const d = new Date(date);
  return dateFormatter.format(d);
}

const iterations = 10000;
const date = new Date().toISOString();

const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
  formatDateOld(date);
}
const endOld = performance.now();

const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
  formatDateNew(date);
}
const endNew = performance.now();

console.log(`Old: ${(endOld - startOld).toFixed(3)}ms`);
console.log(`New: ${(endNew - startNew).toFixed(3)}ms`);
console.log(`Improvement: ${((endOld - startOld) / (endNew - startNew)).toFixed(1)}x faster`);
