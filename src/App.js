import React from "react";
import Header from "./components/Header/Header";
import Body from "./components/Body/Body";
import Layout from "./components/Layout/Layout";
import Table from "./components/Table/Table";
import Tag from "./components/Tag/Tag";
import "./styles.less";

// Generate Sample Data set of 10k
function generateData(count = 10000, depth = 0) {
  let nested = [];
  if (!depth) {
    nested = generateData(4, 1);
  }

  const data = [];
  for (let i = 0; i < count; i++) {
    let name = `name ${i}`;
    if (depth) {
      name = `nested name ${i}`;
    }

    const obj = {
      name,
      gender: i % 2 ? "M" : "F",
      age: i
    };

    if (!depth && i % 3 === 0) {
      obj.nested = [...nested];
    }

    data.push(obj);
  }

  return data;
}

const data = generateData();

export default function App() {
  // Track which rows are expanded (only supports one level deep currently)
  const [expandedRows, setExpandedRows] = React.useState(["3"]);

  function updateExpandedRows(rowIndex) {
    let newRows = [...expandedRows];
    const indexPosition = expandedRows.indexOf(rowIndex);

    if (indexPosition > -1) {
      newRows.splice(indexPosition, 1);
    } else {
      newRows.push(rowIndex);
    }

    setExpandedRows(newRows);
  }

  return (
    <div className="App">
      <Header />
      <Body>
        <Layout
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Layout
            style={{
              display: "flex",
              padding: 20,
              flexDirection: "column",
              flex: 0
            }}
          >
            <h1>
              Super Table
            </h1>
            <h2>
              Are you <span className="cyan">super</span>{" "}
              enough to handle this table?
            </h2>
          </Layout>
          <Table
            columns={[
              // Render Expand Icon
              {
                dataKey: "expand",
                render(value, row) {
                  const { key, nested } = row;

                  if (nested) {
                    let transform = "rotate(0deg)";
                    if (expandedRows.indexOf(key) > -1) {
                      transform = "rotate(90deg)";
                    }

                    return (
                      <span
                        onClick={() => updateExpandedRows(key)}
                        className="expand-icon"
                        style={{
                          transform
                        }}
                      >
                        <span>
                          <a href="#" className="chevron chevron--right" />
                        </span>
                      </span>
                    );
                  }

                  return null;
                },
                style: {
                  verticalAlign: "bottom",
                  width: 56
                }
              },
              {
                dataKey: "name",
                title: "Name",
                render(name, row) {
                  const { key, className } = row;
                  const content = (
                    <Layout display="flex">
                      <Tag>ISS-{key}</Tag> <span>{name}</span>
                    </Layout>
                  );

                  if (className === "nested") {
                    return <div style={{ paddingLeft: 20 }}>{content}</div>;
                  }
                  return content;
                }
              },
              { dataKey: "gender", title: "Gender" },
              { dataKey: "age", title: "Age", style: { textAlign: "right" } }
            ]}
            data={data}
            expandedRows={expandedRows}
          />
        </Layout>
      </Body>
    </div>
  );
}
