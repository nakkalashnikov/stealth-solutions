import { useEffect } from "react";
import { useSequenceStore, useBstSequenceStore } from "./store/sequenceStore.js";
import { useKnapsackStore } from "./store/knapsackStore.js";
import SequenceForm from "./components/SequenceForm.jsx";
import HeapSortSection from "./components/HeapSortSection.jsx";
import QuickSortSection from "./components/QuickSortSection.jsx";
import BstSection from "./components/BstSection.jsx";
import GraphGuideSection from "./components/GraphGuideSection.jsx";
import KnapsackForm from "./components/KnapsackForm.jsx";
import KnapsackSection from "./components/KnapsackSection.jsx";
import ComplexityClassesSection from "./components/ComplexityClassesSection.jsx";

export default function App() {
  const sequence = useSequenceStore((s) => s.sequence);
  const init = useSequenceStore((s) => s.init);

  const bstSequence = useBstSequenceStore((s) => s.sequence);
  const initBst = useBstSequenceStore((s) => s.init);

  const knapsackValue = useKnapsackStore((s) => s.value);
  const initKnapsack = useKnapsackStore((s) => s.init);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { initBst(); }, [initBst]);
  useEffect(() => { initKnapsack(); }, [initKnapsack]);

  return (
    <>
      <header className="site-header">
        <h1>Task Solutions</h1>
        <p>Algorithms &amp; data structures — step-by-step solutions.</p>
      </header>

      <nav className="toc">
        <a href="#task1">Task 1: Heap Sort / Quick Sort</a>
        <a href="#task2">Task 2: BST</a>
        <a href="#task3">Task 3: Graphs</a>
        <a href="#task4">Task 4: Knapsack</a>
        <a href="#task5">Task 5: Complexity classes</a>
      </nav>

      <main>
        <section className="task" id="task1">
          <h2>Task 1</h2>

          <SequenceForm useStore={useSequenceStore} inputId="sequence-input"
                        label="Input sequence" placeholder="e.g. 12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23" />
          <div className="task-input">[{sequence.join(", ")}]</div>

          <h3 className="part-title">A) Heap Sort</h3>
          <HeapSortSection sequence={sequence} />

          <h3 className="part-title">B) Quick Sort</h3>
          <QuickSortSection sequence={sequence} />
        </section>

        <section className="task" id="task2">
          <h2>Task 2</h2>

          <SequenceForm useStore={useBstSequenceStore} inputId="bst-sequence-input"
                        label="Insertion order" placeholder="e.g. 19, 3, 31, 1, 27, 17, 21, 16, 18, 15, 22, 37, 25, 11, 26, 2, 98" />
          <div className="task-input">[{bstSequence.join(", ")}]</div>

          <BstSection sequence={bstSequence} />
        </section>

        <section className="task" id="task3">
          <h2>Task 3</h2>
          <GraphGuideSection />
        </section>

        <section className="task" id="task4">
          <h2>Task 4</h2>

          <KnapsackForm />
          <div className="task-input">
            b = {knapsackValue.capacity}; items = [{knapsackValue.items.map((i) => `${i.size}:${i.value}`).join(", ")}]
          </div>

          <KnapsackSection capacity={knapsackValue.capacity} items={knapsackValue.items} />
        </section>

        <section className="task" id="task5">
          <h2>Task 5</h2>
          <ComplexityClassesSection />
        </section>
      </main>
    </>
  );
}
