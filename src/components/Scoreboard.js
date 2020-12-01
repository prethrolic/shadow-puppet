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
      script: this.props.script || [],
      score: this.props.score || '--',
      phrase1: this.props.phrase1 || [],
      phrase2: this.props.phrase2 || [],
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
        script: this.props.script || [],
        score: this.props.score || '--',
        phrase1: this.props.phrase1 || [],
        phrase2: this.props.phrase2 || [],
        loading: this.props.loading,
        showExplanation: false,
      })
    }
  }

  renderTooltip = (props) => {
    const { phrase1 } = this.state
    let tooltipText = "explanation"

    if (phrase1.length < 1 || phrase1 === undefined) return(<div /> )

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
    const { phrase1 } = this.state
    if (phrase1 === null || !phrase1.includes('0')) return
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
            <div className="scoreboard--loader">
                <FontAwesomeIcon icon="circle-notch" size="2x" spin />
            </div>
            :
            <div className="scoreboard--score">
              {this.state.score}%
            </div>
          }
        </div>

        <Modal
          show={this.state.showExplanation}
          onHide={this.hideExplanation}
          dialogClassName="scoreboard--modal" 
        >
        <Modal.Header closeButton>
          <Modal.Title bsPrefix="scoreboard--explanation-title">Explanation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ margin: "16px 0"}}>
            <i className="scoreboard--explanation-caption match">color scheme</i>;&nbsp; 
            <span className="scoreboard--explanation-caption no-select">grey-unselected</span>,&nbsp;
            <span className="scoreboard--explanation-caption no-match">red-no match</span>,&nbsp;
            <span className="scoreboard--explanation-caption match">dark-match</span>,&nbsp;
          </div>
          <div>
            <strong>Original Script:&nbsp;</strong>
          </div>
          <div>
            {
              this.state.script.map((word, idx) => {
                return(
                  <div
                    className={"scoreboard--explanation-sentence " + 
                    ( 
                      this.state.phrase1[idx] === '-1'? "no-select" : 
                      this.state.phrase1[idx] === '1'? "match" : "no-match"
                    )
                    }
                  >
                    { word }&nbsp;
                  </div>
                )
              })
            }
          </div>
          <div style={{ marginTop: "16px" }}>
          <strong>User's Dialogue</strong>
          </div>
          <div style={{ marginBottom: "32px" }}>
            {
              this.state.phrase2.map((el) => {
                const word = el[0]
                const status = el[1]
                console.log(this.state)
                return(
                  <div
                    className={"scoreboard--explanation-sentence " + 
                    ( 
                      status === '-1'? "no-select" : 
                      status === '1'? "match" : "no-match"
                    )
                    }
                  >
                    { word }&nbsp;
                  </div>
                )
              })
            }
          </div>
        </Modal.Body>
      </Modal>
      </Col>
    )
  }
}
export default Scoreboard;
