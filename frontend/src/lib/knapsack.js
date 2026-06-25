// 0/1 Knapsack via DP table + backtrace, and Fractional Knapsack via greedy
// ratio-sort — pure functions over plain {size, value} item objects.

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 12;

// DP[i][c] = best value using the first i items with capacity c.
// Recurrence (matches the conspect):
//   DP[i][c] = DP[i-1][c]                                   if size_i > c
//   DP[i][c] = max(DP[i-1][c], DP[i-1][c-size_i] + value_i)  if size_i <= c
export function knapsackDP(items, capacity) {
  const n = items.length;
  const table = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { size, value } = items[i - 1];
    for (let c = 0; c <= capacity; c++) {
      if (size > c) {
        table[i][c] = table[i - 1][c];
      } else {
        table[i][c] = Math.max(table[i - 1][c], table[i - 1][c - size] + value);
      }
    }
  }
  return table;
}

// Walks the table from [n][capacity] back to [0][0] to find which items were
// taken — standard DP backtrace, doesn't re-derive anything already in the table.
export function backtrace(table, items, capacity) {
  const chosen = [];
  let c = capacity;
  for (let i = items.length; i > 0; i--) {
    if (table[i][c] !== table[i - 1][c]) {
      chosen.push(i); // 1-indexed, matches the conspect's "item i"
      c -= items[i - 1].size;
    }
  }
  chosen.reverse();
  return { chosenItems: chosen, optimalValue: table[items.length][capacity] };
}

// Sort by value/size ratio (descending), then greedily fill the capacity,
// taking a fraction of the item that would overflow it.
export function fractionalKnapsack(items, capacity) {
  const ranked = items
    .map((item, index) => ({ ...item, index: index + 1, ratio: item.value / item.size }))
    .sort((a, b) => b.ratio - a.ratio);

  let remaining = capacity;
  let totalValue = 0;
  const steps = [];

  for (const item of ranked) {
    if (remaining <= 0) {
      steps.push({ ...item, fraction: 0, takenValue: 0 });
      continue;
    }
    if (item.size <= remaining) {
      steps.push({ ...item, fraction: 1, takenValue: item.value });
      totalValue += item.value;
      remaining -= item.size;
    } else {
      const fraction = remaining / item.size;
      const takenValue = item.value * fraction;
      steps.push({ ...item, fraction, takenValue });
      totalValue += takenValue;
      remaining = 0;
    }
  }

  return { ranked, steps, totalValue };
}
