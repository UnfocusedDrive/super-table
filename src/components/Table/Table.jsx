import React from "react";
import Layout from "../Layout/Layout";
import VirtualScroll from "../VirtualScroll/VirtualScroll";
import "./Table.less";

export default class Table extends React.Component {
  constructor() {
    super();
    this.initRefSync();
  }

  /**
   * Initialize Ref Sync
   * This uses some callback magic that piggy backs off the React ecosystem. It calculates
   * measurement and other things without the need of componentDidMount().
   *
   * e.g. VirtualScroll in this case waits on the parent (Table) to mount before finalizing its
   * initialization. Instead of relying on setState/didMount to perform the async update and trigger
   * an extra render cycle, we capture and store the callback from VirtualScroll here and then fire
   * the callback once the Table has successfully mounted.
   */
  initRefSync() {
    this.pendingCB = null;
    this.scrollContainerRef = null;

    // For Table Scroll Container
    this.syncScrollRef = (ref) => {
      this.scrollContainerRef = ref;

      if (this.pendingCB) {
        this.pendingCB(ref);
        this.pendingCB = null;
      }
    };

    // For VirtualScroll
    this.getScrollRef = (syncCB) => {
      if (!this.scrollContainerRef) {
        this.pendingCB = syncCB;
      }

      return this.scrollContainerRef;
    };
  }

  /**
   * Get Flattened Data
   * Theoretically this would support endless nested rows. But ideal UX?
   * For more performance may consider useMemo...
   * @param {array} data - data to flatten
   * @param {number} depth - current depth of nested data
   * @param {array} keyPath - unique identifier for nested data
   */
  getFlattenedData(data, keyPath = []) {
    const { expandedRows } = this.props;
    let className;
    if (keyPath.length) {
      className = "nested";
    }

    let rows = [];
    for (let i = 0; i < data.length; i++) {
      const { nested } = data[i];
      const newKeyPath = [...keyPath, i];
      const key = newKeyPath.join("-");

      rows.push({
        className,
        key,
        ...data[i]
      });

      // If Nested Content and Expanded
      // TODO: Create a reveal animation on SHOW/HIDE. RTG package could be a good start.
      if (nested && expandedRows.indexOf(key) > -1) {
        rows = [...rows, ...this.getFlattenedData(nested, newKeyPath)];
      }
    }

    return rows;
  }

  renderCols(row, rowIndex) {
    const { columns } = this.props;

    return columns.map((column) => {
      const { dataKey, render, style } = column;

      let value = row[dataKey];
      if (typeof render === "function") {
        value = render(value, row, rowIndex);
      }

      return (
        <td key={dataKey} style={style}>
          {value}
        </td>
      );
    });
  }

  // TODO: Future use
  renderHeader() {
    const { columns } = this.props;

    return (
      <tr>
        {columns.map((column) => {
          const { dataKey, title, style = {} } = column;
          return (
            <th
              style={{
                position: "sticky",
                top: 0,
                ...style
              }}
              key={dataKey}
            >
              {title}
            </th>
          );
        })}
      </tr>
    );
  }

  render() {
    const { data } = this.props;

    return (
      <Layout className="table" containerRef={this.syncScrollRef}>
        <table>
          <VirtualScroll
            scrollTargetRef={this.getScrollRef}
            listContainer={<tbody />}
            listElement={(props, i) => {
              const { key, ref } = props;

              // Include scroll ref to the tr to measure height
              return (
                <tr key={key} ref={ref}>
                  {this.renderCols(props, props.key)}
                </tr>
              );
            }}
            spacerElement={(props) => {
              const { key, ...restProps } = props;
              return <tr key={key}><td {...restProps}/></tr>;
            }}
            data={this.getFlattenedData(data)}
          />
        </table>
      </Layout>
    );
  }
}
