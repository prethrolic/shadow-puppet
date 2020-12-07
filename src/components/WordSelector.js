import React from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import '../scss/wordselector.scss'

library.add(faQuestionCircle)

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

  renderTooltip = (props) => {
    return (
      <Tooltip id="button-tooltip" {...props}>
        You will be scored only for the words that are selected. We will cut out the audio to only contain the selected words
      </Tooltip>
    )
  };

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
        <OverlayTrigger
            placement="top"
            delay={{ show: 0, hide: 400 }}
            overlay={this.renderTooltip}
          >
            <FontAwesomeIcon className="word-selector--questionmark" icon="question-circle" onClick={this.showExplanation} />
          </OverlayTrigger>
        <div>
          
        </div>
      </div>
    )
  }
}

export default WordSelector;