import { useState } from "react";
import { knapsackDP, backtrace, fractionalKnapsack } from "../lib/knapsack.js";

export default function KnapsackSection({ capacity, items }) {
  const table = knapsackDP(items, capacity);
  const { chosenItems, optimalValue, steps: backtraceSteps } = backtrace(table, items, capacity);
  const totalChosenSize = chosenItems.reduce((sum, i) => sum + items[i - 1].size, 0);

  const [lookupN, setLookupN] = useState(Math.min(4, items.length));
  const [lookupB, setLookupB] = useState(Math.min(5, capacity));
  const safeLookupN = Math.max(0, Math.min(lookupN, items.length));
  const safeLookupB = Math.max(0, Math.min(lookupB, capacity));

  const { ranked, steps, totalValue: fractionalTotal } = fractionalKnapsack(items, capacity);

  // which (i, c) cells are on the optimal-value backtrace path, for highlighting
  const pathCells = new Set();
  {
    let c = capacity;
    for (let i = items.length; i > 0; i--) {
      pathCells.add(`${i}-${c}`);
      if (table[i][c] !== table[i - 1][c]) c -= items[i - 1].size;
    }
    pathCells.add(`0-${c}`);
  }

  return (
    <div>
      <h4>a) Recursive function used in DP</h4>
      <pre className="diagram">{`DP[i][c] = DP[i-1][c]                            if size[i] > c
DP[i][c] = max(DP[i-1][c], DP[i-1][c-size[i]] + value[i])   if size[i] <= c

DP[0][c] = 0  (no elements)
DP[i][0] = 0  (capacity 0)`}</pre>

      <p>Full table for capacity <strong>b = {capacity}</strong> and all {items.length} items.
        The green cells are every <code>(i, c)</code> visited while tracing back from{" "}
        <code>DP[{items.length}][{capacity}]</code> to <code>DP[0][...]</code> below — not
        only the cells where an item was taken, but the whole path the backtrace walked to
        find the answer:</p>

      <div className="dp-table-wrap">
        <table className="dp-table">
          <thead>
            <tr>
              <th>i \ c</th>
              {Array.from({ length: capacity + 1 }, (_, c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <th>{i}</th>
                {row.map((val, c) => (
                  <td key={c} className={pathCells.has(`${i}-${c}`) ? "on-path" : undefined}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>b) Chosen elements for the optimal solution</h4>
      <p>Reading the answer back out of the table: start at <code>DP[{items.length}][{capacity}]</code>{" "}
        and walk up to <code>i = 0</code>. At each <code>i</code>, compare <code>DP[i][c]</code>{" "}
        to <code>DP[i-1][c]</code> (the value <em>without</em> item <code>i</code>):</p>
      <ul className="steps">
        {backtraceSteps.map((s) => (
          <li key={s.i}>
            <code>i={s.i}, c={s.cBefore}</code>: DP[{s.i}][{s.cBefore}]={s.dpWith} vs DP[{s.i - 1}][{s.cBefore}]={s.dpWithout}
            {" → "}
            {s.taken
              ? <>different → <strong>item {s.i} taken</strong> → move to i={s.i - 1}, c={s.cAfter} (capacity drops by item {s.i}'s size)</>
              : <>equal → item {s.i} <strong>not</strong> taken → move to i={s.i - 1}, c={s.cAfter}</>}
          </li>
        ))}
      </ul>
      <p>
        {chosenItems.length === 0
          ? "No item fits within the capacity."
          : <>Item{chosenItems.length > 1 ? "s" : ""} <strong>{chosenItems.join(", ")}</strong>{" "}
              (size = {totalChosenSize}, value = {optimalValue})</>}
      </p>

      <h4>c) Optimal value</h4>
      <div className="answer-box">DP[{items.length}][{capacity}] = {optimalValue}</div>

      <h4>d) Reading a sub-problem's value directly from the table</h4>
      <p>DP's whole point: the value for <em>any</em> smaller capacity and <em>any</em> prefix
        of the items is already sitting in the table above — no recomputation needed. Try it:</p>

      <form className="sequence-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="lookup-n">first n items</label>
        <input id="lookup-n" type="number" min="0" max={items.length} value={lookupN}
               onChange={(e) => setLookupN(Number(e.target.value))} style={{ maxWidth: "4rem" }} />
        <label htmlFor="lookup-b">capacity b</label>
        <input id="lookup-b" type="number" min="0" max={capacity} value={lookupB}
               onChange={(e) => setLookupB(Number(e.target.value))} style={{ maxWidth: "4rem" }} />
      </form>
      <div className="answer-box">DP[{safeLookupN}][{safeLookupB}] = {table[safeLookupN][safeLookupB]}</div>

      <h4>Fractional Knapsack</h4>
      <p>Rank items by <strong>value / size</strong> (profit ratio), then greedily fill the
        knapsack — taking a fraction of the item that would overflow it.</p>

      <table className="partition-log">
        <thead><tr><th>Item</th><th>size</th><th>value</th><th>ratio</th></tr></thead>
        <tbody>
          {ranked.map((r) => (
            <tr key={r.index}>
              <td>{r.index}</td><td>{r.size}</td><td>{r.value}</td><td>{r.ratio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Greedy fill order: <strong>{ranked.map((r) => r.index).join(", ")}</strong></p>
      <table className="partition-log">
        <thead><tr><th>Item</th><th>Taken</th><th>Value gained</th></tr></thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.index}>
              <td>{s.index}</td>
              <td>{s.fraction === 1 ? "fully" : s.fraction === 0 ? "none" : `${(s.fraction * 100).toFixed(0)}%`}</td>
              <td>{s.takenValue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="answer-box">Total value = {fractionalTotal.toFixed(2)}</div>

      <h4>Complexity</h4>
      <p className="note"><strong>0/1 Knapsack (DP): O(n·b).</strong> The table has
        {" "}(n+1)×(b+1) cells, and each cell takes O(1) to fill — it only compares two
        already-computed values.</p>
      <p className="note"><strong>Fractional Knapsack: O(n log n).</strong> Dominated by
        sorting items by ratio; the greedy fill itself is a single O(n) pass.</p>
    </div>
  );
}
