import React from "react";
// Use something already made for PoC
import { throttle } from "lodash";

// Constant
const SCROLL_CONTEXT = {
  SCROLL_TOP: 0,
  ITEM_HEIGHT: 1
};

const LIFECYCLE = {
  MOUNT: "mount",
  UPDATE: " update"
};

export default class VirtualScroll extends React.Component {
  constructor(props) {
    super(props);
    const { data } = props;

    // Reduce the payload frequencey
    this.handleScroll = throttle(this.handleScroll, 5).bind(this);

    this.state = {
      // Only for uncontrolled usage
      scrollIndex: -1
    };

    // Track scroll container
    this.scrollRef = React.createRef();
    // Track item list refs (or <tr/s> in this specific example)
    this.listRef = [];
    this.updateListRef(data);
    // Track positioning of all this.listRef items (or cached items)
    this.scrollContext = null;
    // Track current virtualization state
    this.instance = null;
  }

  componentDidMount() {
    /**
     * Wait until the parent has been mouted, then fire this callback when ready.
     * Note: The child is always mounted before the parent in most cases.
     */
    const syncWithTargetMount = (target) => {
      if (target) {
        target.addEventListener("scroll", this.handleScroll);
        this.instance = this.getInstance(LIFECYCLE.MOUNT);
        this.setState({ scrollIndex: this.instance.scrollIndex });
      }
    };

    this.getScrollTarget(syncWithTargetMount);
  }

  componentDidUpdate() {
    this.updateListRef();
    this.instance = this.getInstance(LIFECYCLE.UPDATE);

    console.log("componentDidUpdate", this.getScrollTarget().scrollHeight);

    if (this.getScrollTarget().scrollHeight !== 22680) {
      debugger;
    }
  }

  componentWillUnmount() {
    const target = this.getScrollTarget();
    if (target) {
      target.removeEventListener("scroll", this.handleScroll);
    }
  }

  /**
   * Get Band Sizes
   * There are 3 bands (or ranges). The head spacer, the data range, and
   * the tail spacer. This is used render the sample set.
   */
  getBandSizes() {
    const dataLength = this.props.data.length;
    const renderRange = this.getRenderRange();

    return [[0, renderRange[0]], renderRange, [renderRange[1], dataLength]];
  }

  getAvgItemHeight() {
    const { clientHeight } = this.getScrollTarget();

    // Get index of closest item to the fold (clientHeight) and divide the scrollTop by the index. If all items
    // are the same height then the result should equal exactly to SCROLL_CONTEXT.ITEM_HEIGHT value.
    // Note: The proper way to do it based on the current viewport of the scroll position but for the POC we will
    // not go this far.
    // Note 2: Can optimize further to stop once the closest index has been hit since the scroll context is
    // already sorted.
    const closestIndex = this.scrollContext.reduce((prevIndex, nextItem, i) => {
      return Math.abs(nextItem[SCROLL_CONTEXT.SCROLL_TOP] - clientHeight) <
        Math.abs(
          this.scrollContext[prevIndex][SCROLL_CONTEXT.SCROLL_TOP] -
            clientHeight
        )
        ? i
        : prevIndex;
    }, 0);

    return (
      this.scrollContext[closestIndex][SCROLL_CONTEXT.SCROLL_TOP] / closestIndex
    );
  }

  getInstance(lifeCycle) {
    if (lifeCycle) {
      this.scrollContext = this.generateScrollContext();
    }
    // Use to prerender rows above and below the viewbox. Think pagination but without delay.
    const bufferPageRatio = 2;
    const { clientHeight, scrollTop, scrollHeight } = this.getScrollTarget();
    const avgItemHeight = this.getAvgItemHeight();
    const pageSize = this.getVirtualPageSize(clientHeight, avgItemHeight);
    const scrollIndex = this.getScrollContextIndex(scrollTop);

    return {
      bufferPageRatio,
      clientHeight,
      scrollTop,
      avgItemHeight,
      pageSize,
      scrollContext: this.scrollContext,
      scrollIndex,
      scrollHeight
    };
  }

  getRenderRange() {
    if (!this.updatePending()) {
      const { bufferPageRatio, scrollIndex, pageSize } = this.instance;
      const pageSizeFm = Math.ceil(pageSize);

      // final ver
      const startIndex = 0;
      // TODO: There is an onScroll that is triggered only when the head spacer is generated and a shift in contnet.
      // Working on resolution. It may be as simple as getting a diff on snapshot and applying it on componentDidMount.
      // const startIndex = Math.max(
      //   0,
      //   scrollIndex - Math.ceil(pageSizeFm * bufferPageRatio)
      // );

      const endIndex = Math.min(
        scrollIndex + pageSizeFm + Math.ceil(pageSizeFm * bufferPageRatio),
        this.props.data.length
      );

      // const endIndex = this.props.data.length;

      return [startIndex, endIndex];
    }

    return [0, this.props.data.length];
  }

  getScrollContextIndex(scrollTop) {
    return this.scrollContext.reduce((prevIndex, curItem, i) => {
      return curItem[SCROLL_CONTEXT.SCROLL_TOP] <= scrollTop ? i : prevIndex;
    }, 0);
  }

  getVirtualPageSize(containerHeight, avgRowHeight) {
    return Math.max(containerHeight / avgRowHeight, 1);
  }

  /**
   * Generate Scroll Context
   * @returns {array} of context
   * eg.
   * [
   *   [
   *     scrollTop, itemHeight
   *   ],
   *   ...
   * ]
   *  PROPS:
   *  scrollTop -- Used to track scroll distance of element to top of container
   *  itemHeight -- Track item height for virtualization (creating the "artificial" scroll)
   *  ref -- debugging purposes (not needed for prod use)
   *
   */
  generateScrollContext() {
    let scrollTop = 0;
    return this.listRef.map((el, i) => {
      let nextItem = [];
      if (el instanceof Element) {
        const { offsetHeight } = el;
        nextItem = [scrollTop, offsetHeight, el];
        scrollTop += offsetHeight;
        return nextItem;
        // Get Cached Item (no longer rendered in DOM)
      } else if (this.scrollContext[i]) {
        const [prevScrollTop, offsetHeight, ref] = this.scrollContext[i];
        nextItem = [scrollTop, offsetHeight, ref];
        scrollTop += offsetHeight;
      }

      return nextItem;
    });
  }

  /**
   * Get Height from the Provided Range
   * This is used to generate space height
   * @param {array} range - range of render
   */
  getScrollHeight(range) {
    // Must be at least 1 item
    if (this.scrollContext && range[0] < range[1]) {
      const lastItem = this.scrollContext[Math.max(range[1] - 1, 0)];
      return (
        lastItem[SCROLL_CONTEXT.SCROLL_TOP] +
        lastItem[SCROLL_CONTEXT.ITEM_HEIGHT] -
        this.scrollContext[range[0]][SCROLL_CONTEXT.SCROLL_TOP]
      );
    }

    return 0;
  }

  getScrollTarget(syncBack) {
    const { scrollTargetRef } = this.props;

    if (typeof scrollTargetRef === "function") {
      return scrollTargetRef(syncBack);
    } else if (scrollTargetRef.current) {
      return scrollTargetRef.current;
    }
    return {};
  }

  handleScroll() {
    this.instance = this.getInstance();
    this.setState({
      scrollIndex: this.instance.scrollIndex
    });
  }

  /**
   * Update List Ref
   * This is used to map an equal amount of refs to the current data provided.
   * @param {array} initialData - A mirror of {this.props.data} from constructor
   */
  updateListRef(initialData) {
    let dataLength;
    if (initialData) {
      dataLength = initialData.length;
    } else {
      dataLength = this.props.data.length;
    }
    if (this.listRef.length !== dataLength) {
      this.listRef = Array(dataLength)
        .fill(null)
        .map((_, i) => this.listRef[i] || React.createRef());
    }
  }

  updatePending() {
    if (this.instance) {
      // There is a data change so wipe the cache and rerender the full list once
      if (this.scrollContext.length !== this.props.data.length) {
        this.instance = null;
        this.scrollContext = null;

        return true;
      }

      return false;
    }

    return true;
  }

  renderChildren() {
    const bandSizes = this.getBandSizes();
    const [headSpacerRange, dataRange, tailSpacerRange] = bandSizes;

    const children = [
      // this.renderSpacer(headSpacerRange, "head-spacer"),
      ...this.renderDataList(dataRange),
      this.renderSpacer(tailSpacerRange, "tail-spacer")
    ];

    const testHeight =
      this.getScrollHeight(dataRange) + this.getScrollHeight(tailSpacerRange);

    // console.log("children", children);
    console.log(
      "children",
      // this.getScrollTarget(),
      this.getScrollTarget()?.scrollHeight,
      testHeight,
      this.instance?.scrollHeight
    );

    if (testHeight && this.getScrollTarget()?.scrollHeight !== testHeight) {
      debugger;
    }

    return children;

    // return [
    //   this.renderSpacer(headSpacerRange, "head-spacer"),
    //   ...this.renderDataList(dataRange),
    //   this.renderSpacer(tailSpacerRange, "tail-spacer")
    // ];
  }

  renderDataList(range) {
    const { data, listElement } = this.props;

    const list = [];
    for (let i = range[0]; i < range[1]; i++) {
      const { key, ...restProps } = data[i];

      // console.log("key", key);
      list.push(
        this.renderElement(
          listElement,
          {
            key: key || i,
            ref: (el) => (this.listRef[i] = el),
            ...restProps
          },
          i
        )
      );
    }

    return list;
  }

  renderElement(element, props, i) {
    if (typeof element === "function") {
      return element(props, i);
    }

    return React.cloneElement(element, props);
  }

  renderSpacer(range, key) {
    const height = this.getScrollHeight(range);

    if (height) {
      const { spacerElement } = this.props;
      return this.renderElement(spacerElement, {
        key,
        style: {
          height
        }
      });
    }

    return null;
  }

  render() {
    return this.renderElement(this.props.listContainer, {
      children: this.renderChildren()
    });
  }
}
