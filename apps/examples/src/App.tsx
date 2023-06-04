import { Tooltip } from "vc-react-tooltip";

function App() {
  return (
    <div style={{ margin: 100 }}>
      <Tooltip
        placement="right"
        trigger={["hover"]}
        title={<span style={{ color: "white" }}>Popover</span>}
        defaultOpen
      >
        <span style={{ border: "1px solid red" }}>
          VC-Team is an open source team
        </span>
      </Tooltip>
    </div>
  );
}

export default App;
