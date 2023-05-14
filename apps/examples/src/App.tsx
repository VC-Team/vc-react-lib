import { Tooltip } from "vc-react-tooltip";

function App() {
  return (
    <div style={{ margin: 100 }}>
      <Tooltip placement="right" trigger={["hover"]} title="Popover">
        <span style={{ border: "1px solid red" }}>
          VC-Team is an open source team
        </span>
      </Tooltip>
    </div>
  );
}

export default App;

// - Tìm hiểu thêm về rule của children (content node). Tại sao nó phải là 1 HTML Element hoặc 1 forwardRef
// - Implement 3 props: placement, trigger, title

// What next?
// - Implement hook onClickOutSide
// - Remove findDomNode
// - CSS in JS: Emotion
