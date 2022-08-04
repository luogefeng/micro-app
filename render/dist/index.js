// 用于在循环语句中打印
const data = ["谢尔顿", "莱纳德", '佩妮']; // 条件判断语句的判断标志

let flag = false; // 包含循环语句的函数，用于测试循环语句

const test_cycle = () => {
  const items = [];

  for (let i = 0; i < data.length; i++) {
    items.push(createElement("li", {
      className: "item",
      key: i
    }, data[i]));
  }

  console.log("items", items);
  return items;
}; // 函数组件


function Item(props) {
  return createElement("li", {
    className: "item",
    style: props.style
  }, props.children, "  ", createElement("a", {
    href: "#",
    onClick: props.onRemoveItem
  }, "\u5220\u9664 "));
} // class组件


class List extends Component {
  constructor(props) {
    super();
    this.state = {
      list: [{
        text: '谢尔顿',
        color: 'blue'
      }, {
        text: '莱纳德',
        color: 'yellow'
      }, {
        text: '佩妮',
        color: 'pink'
      }, {
        text: '霍华德',
        color: 'red'
      }, {
        text: '拉杰',
        color: 'green'
      }]
    };
  } // 移除元素


  handleItemRemove(index) {
    this.setState({
      list: this.state.list.filter((item, i) => i !== index)
    });
  } // 添加元素


  handleAdd() {
    this.setState({
      list: [...this.state.list, {
        text: this.ref.value
      }]
    });
  }

  render() {
    return createElement("div", null, createElement("p", null, "\u4EE5\u4E0B\u662F\u6761\u4EF6\u5224\u65AD\u7684\u5C55\u793A\uFF1A"), flag ? createElement("p", null, "flag\u503C\u4E3Atrue") : createElement("p", null, "flag\u503C\u4E3Afalse"), createElement("p", null, "\u4EE5\u4E0B\u662F\u5FAA\u73AF\u8BED\u53E5\u7684\u5C55\u793A\uFF1A"), createElement("ul", {
      className: "list"
    }, test_cycle()), createElement("p", null, "\u4EE5\u4E0B\u662F\u7EC4\u4EF6\u53CA\u6570\u636E\u66F4\u65B0\u7684\u5C55\u793A\uFF1A"), createElement("ul", {
      className: "list"
    }, this.state.list.map((item, index) => {
      return createElement(Item, {
        style: {
          background: item.color,
          color: this.state.textColor
        },
        onRemoveItem: () => this.handleItemRemove(index)
      }, item.text);
    })), createElement("div", null, createElement("input", {
      ref: ele => {
        this.ref = ele;
      }
    }), createElement("button", {
      onClick: this.handleAdd.bind(this)
    }, "\u6DFB\u52A0")));
  }

}

render(createElement(List, {
  textColor: '#000'
}), document.getElementById('root'));