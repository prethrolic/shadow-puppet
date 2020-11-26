import React from 'react'
import '../scss/wordselector.scss'

class WordSelector extends React.Component {  
  constructor(props) {
    super(props)
    this.state = {
      quote: this.props.quote,
      selectedIndices: this.props.selectedIndices,
    }

    this.toggleSelect = this.toggleSelect.bind(this)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        quote: this.props.quote,
        selectedIndices: this.props.selectedIndices,
      })
    }
  }

  toggleSelect = (idx) => {
    let selectedIndices = this.state.selectedIndices
    if (selectedIndices.includes(idx)) selectedIndices = selectedIndices.filter(i => i !== idx)
    else {
      selectedIndices.push(idx)
    }

    this.props.onSelectedWordChanged(selectedIndices)
  }

  render() {
    let selectedIndices = this.state.selectedIndices

    return (
      <div className="word-selector--wrap">
        {
          this.state.quote.map((word, idx) => {
            return(
              <div
                className={"word-selector--container " + (selectedIndices.includes(idx) ? "active" : "inactive")}
                onClick={() => this.toggleSelect(idx)}  
              >
                { word }
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default WordSelector;