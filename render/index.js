// 用于在循环语句中打印
const data = ["谢尔顿", "莱纳德",'佩妮'];

// 条件判断语句的判断标志
let flag = false;

// 包含循环语句的函数，用于测试循环语句
const test_cycle = () => {
  const items = [];
  for (let i = 0; i < data.length; i++) {
    items.push(
      <li className="item" key={i}>
        {data[i]}
      </li>
    );
  }

  console.log("items", items);

  return items;
}

// 函数组件
function Item(props) {
    return <li className="item" style={props.style}>{props.children}  <a href="#" onClick={props.onRemoveItem}>删除 </a></li>;
}

// class组件
class List extends Component {
    constructor(props) {
        super();
        this.state = {
            list: [
                {
                    text: '谢尔顿',
                    color: 'blue'
                },
                {
                    text: '莱纳德',
                    color: 'yellow'
                },
                {
                    text: '佩妮',
                    color: 'pink'
                },
                {
                    text: '霍华德',
                    color: 'red'
                },
                {
                    text: '拉杰',
                    color: 'green'
                }
            ]
        }
    }

    // 移除元素
    handleItemRemove(index) {
        this.setState({
            list: this.state.list.filter((item, i) => i !== index)
        });
    }
    
    // 添加元素
    handleAdd() {
        this.setState({
            list: [
                ...this.state.list, 
                {
                    text: this.ref.value
                }
            ]
        });
    }

    render() {
        return <div>
            <p>以下是条件判断的展示：</p>
            {flag ? (
            <p>flag值为true</p>
            ) : (
            <p>flag值为false</p>
            )}

            <p>以下是循环语句的展示：</p>
            <ul className="list">{test_cycle()}</ul>
            
            <p>以下是组件及数据更新的展示：</p>
            <ul className="list">
                {this.state.list.map((item, index) => {
                    return <Item style={{ background: item.color, color: this.state.textColor}} onRemoveItem={() => this.handleItemRemove(index)}>{item.text}</Item>
                })}
            </ul>
            <div>
                <input ref={(ele) => {this.ref = ele}}/>
                <button onClick={this.handleAdd.bind(this)}>添加</button>
            </div>
        </div>;
    }
}

render(<List textColor={'#000'}/>, document.getElementById('root'));
