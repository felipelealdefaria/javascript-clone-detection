import { Component } from 'react'

export class Counter extends Component {
  state = { count: 0 }

  increment = () => {
    this.setState((prev) => ({ count: prev.count + 1 }))
  }

  render() {
    return (
      <div>
        <span>{this.state.count}</span>
        <button onClick={this.increment}>+1</button>
      </div>
    )
  }
}
