import React from 'react'
import { Col, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import '../scss/scoreboard.scss'

library.add(faCircleNotch, faQuestionCircle)

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      score: this.props.score || '--',
      explanation: this.props.explanation || '',
      phrase1: this.props.phrase1 || [1],
      phrase2: this.props.phrase1 || [],
      loading: this.props.loading || false,
      showExplanation: false,
    }

    this.showExplanation = this.showExplanation.bind(this)
    this.hideExplanation = this.hideExplanation.bind(this)
    this.renderTooltip = this.renderTooltip.bind(this)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        score: this.props.score,
        phrase1: this.props.phrase1 || [1],
        phrase2: this.props.phrase1 || [],
        showExplanation: false,
      })
    }
  }

  renderTooltip = (props) => {
    const { phrase1, phrase2 } = this.state
    let tooltipText = "explanation"
    if (phrase1.includes('0')) {
      tooltipText = "It seems like you didn't say some of the words in the phrase. Click to see more."
    }
    else {
      tooltipText = "You have spoken all the words correctly. Now try to improve your accent and pronunciation!"
    }

    return (
      <Tooltip id="button-tooltip" {...props}>
        { tooltipText }
      </Tooltip>
    )
};

  showExplanation = () => {
    this.setState({ showExplanation: true })
  }

  hideExplanation = () => {
    this.setState({ showExplanation: false })
  }

  render() {
    return(
      <Col className="scoreboard--wrap">
        <div className="scoreboard--title">
          Similarity
          <OverlayTrigger
            placement="top"
            delay={{ show: 0, hide: 400 }}
            overlay={this.renderTooltip}
          >
            <FontAwesomeIcon className="scoreboard--explanation-trigger" icon="question-circle" onClick={this.showExplanation} />
          </OverlayTrigger>
        </div>
        <div className="scoreboard--score-container">
          {
            this.state.loading ?
            <div className="scoreboard-loader">
                <FontAwesomeIcon icon="circle-notch" spin />
            </div>
            :
            <div className="scoreboard--score">
              {this.state.score}%
            </div>
          }
        </div>

        <Modal show={this.state.showExplanation} onHide={this.hideExplanation}>
        <Modal.Header closeButton>
          <Modal.Title bsPrefix="scoreboard--explanation-title">Explanation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Look, <strike>Hagrid's</strike> our friend. Why <strike>don't</strike> we just go and ask him about it?</div>
          <ul>
            <li><strong>Hagrid's</strong></li> is not pronounced
            <li><strong>don't</strong></li> is not pronounced
          </ul>

        </Modal.Body>
      </Modal>

      </Col>
    )
  }
}
export default Scoreboard;
