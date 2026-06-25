export default function ArrayRow({ snapshot, pivotIndex = null, i = null, j = null, swapPair = [], fixedRange = null }) {
  const needsPtrRow = i !== null || j !== null;

  return (
    <>
      {needsPtrRow && (
        <div className="array-row ptr-row">
          {snapshot.map((_, idx) => {
            let label = "";
            if (idx === i && idx === j) label = "i j";
            else if (idx === i) label = "i";
            else if (idx === j) label = "j";
            return <span className="ptr" key={idx}>{label}</span>;
          })}
        </div>
      )}
      <div className="array-row">
        {snapshot.map((val, idx) => {
          const cls = ["cell"];
          if (idx === pivotIndex) cls.push("pivot");
          else if (swapPair.includes(idx)) cls.push("swap");
          else if (fixedRange && (idx < fixedRange[0] || idx > fixedRange[1])) cls.push("fixed");
          return <span className={cls.join(" ")} key={idx}>{val}</span>;
        })}
      </div>
    </>
  );
}
