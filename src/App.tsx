import { useState } from "react";

import "./App.css";

type Valid = {
  valid: true;
  bits: string;
};

type Invalid = {
  valid: false;
  error: string;
};

type Result = Valid | Invalid;

function parseInput(n: string): Result {
  const asNum = +n;
  if (Number.isNaN(asNum)) return { valid: false, error: "Not a number" };
  return { valid: true, bits: truncate(asNum.toString(2).padStart(32, "0")) };
}

function truncate(s: string): string {
  let diff = s.length - 32;
  return s.slice(diff);
}

const Byte = ({
  value,
  clickedAtIndex,
}: {
  value: number;
  clickedAtIndex: (index: number) => void;
}) => {
  const bits = value.toString(2).padStart(8, "0").split("").reverse();
  return (
    <>
      <div>{value.toString(16).padStart(2, "0")}</div>
      <div
        style={{
          width: "400px",
          transform: "scaleX(-1)",
          border: "solid 1px white",
          height: "60px",
          display: "flex",
          padding: "1px",
        }}
      >
        {bits.map((el, index) => (
          <div
            onClick={() => clickedAtIndex(7 - +index)}
            style={{
              boxSizing: "border-box",
              height: "60px",
              cursor: "pointer",
              border: "solid 1px white",
              background: +el === 1 ? "rgba(255,255,255,0.7)" : "",
              width: `calc(100% / 8)`,
            }}
          ></div>
        ))}
      </div>
    </>
  );
};

function split(base2: Result) {
  if (!base2.valid) return ["", "", "", ""];
  const firstByte = base2.bits.slice(0, 8);
  const secondByte = base2.bits.slice(8, 16);
  const thirdByte = base2.bits.slice(16, 24);
  const fourthByte = base2.bits.slice(24, 32);
  return [firstByte, secondByte, thirdByte, fourthByte].map((el) =>
    Number.parseInt(el, 2)
  );
}

const options = [
  0b11111111_11111111_11111111_11111111, // u32
  0b11111111_11111111, // u16
  0b11111111, // u8
  0b0,
];

const formatter = new Intl.NumberFormat(navigator.language);

function updateBitOfByte(num: number | string, index: number) {
  const byte = (+num).toString(2).padStart(8, "0").split("");
  const current = +byte[index];
  byte[index] = "" + (current === 0 ? 1 : 0);
  return parseInt(byte.join("").padStart(8, "0"), 2);
}

function App() {
  const [input, setInput] = useState("");
  const bytesAsStr = parseInput(input);
  const bytesAsArr = split(bytesAsStr);

  const hex = bytesAsArr
    .map((el) => (+el).toString(16).padStart(2, "0"))
    .join("")
    .padStart(8, "0");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onClickBit = (i: number, j: number) => {
    let copy = [...bytesAsArr];
    copy[i] = updateBitOfByte(copy[i], j);
    const byte = copy.map((el) => (+el).toString(2).padStart(8, "0"));
    const res = byte.join("").padStart(32, "0");
    setInput("" + parseInt(res, 2));
  };

  return (
    <div>
      <h1>UInt32</h1>
      <div style={{ margin: "10px" }}>
        <input type="number" min={0} value={input} onChange={onChange} />
      </div>
      {options.map((option) => (
        <button onClick={() => setInput("" + option)}>
          {formatter.format(option)}
        </button>
      ))}

      <div className="card">
        {bytesAsStr.valid ? bytesAsStr.bits : bytesAsStr.error}
      </div>
      <div className="card">0x{hex}</div>
      <div style={{ display: "flex", width: "800px", gap: "5px" }}>
        {bytesAsArr.map((byte, i) => (
          <Byte
            key={i}
            value={+byte}
            clickedAtIndex={(j) => onClickBit(i, j)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
