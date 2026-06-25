import { useEffect } from "react";
import { useSequenceStore } from "./store/sequenceStore.js";
import SequenceForm from "./components/SequenceForm.jsx";
import HeapSortSection from "./components/HeapSortSection.jsx";
import QuickSortSection from "./components/QuickSortSection.jsx";

export default function App() {
  const sequence = useSequenceStore((s) => s.sequence);
  const init = useSequenceStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  return (
    <>
      <header className="site-header">
        <h1>Task Solutions</h1>
        <p>Algorithms &amp; data structures — step-by-step solutions.</p>
      </header>

      <nav className="toc">
        <a href="#task1">Task 1: Heap Sort / Quick Sort</a>
      </nav>

      <main>
        <section className="task" id="task1">
          <h2>Task 1</h2>

          <SequenceForm />
          <div className="task-input">[{sequence.join(", ")}]</div>

          <h3 className="part-title">A) Heap Sort</h3>
          <HeapSortSection sequence={sequence} />

          <h3 className="part-title">B) Quick Sort</h3>
          <QuickSortSection sequence={sequence} />
        </section>
      </main>
    </>
  );
}
