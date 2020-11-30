import React from 'react'
import axios from 'axios'
import Scoreboard from './Scoreboard'
import WordSelector from './WordSelector'
import { Row, Col, Button } from 'react-bootstrap'
import { ReactMediaRecorder } from "react-media-recorder"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMicrophone, faCircleNotch, faSpellCheck } from '@fortawesome/free-solid-svg-icons'
import '../scss/recordbar.scss'


library.add(faMicrophone, faCircleNotch, faSpellCheck);


class RecordBar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      quote: this.props.quote,
      selectedIndices: this.props.quote.script.map((_, idx) => idx),
      score: null,
      evaluationEnabled: false,
    }

    this.onSelectedWordChanged = this.onSelectedWordChanged.bind(this)
    this.getEvaluation = this.getEvaluation.bind(this)
    this.enableEvaluation = this.enableEvaluation.bind(this)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        quote: this.props.quote,
        selectedIndices: this.props.quote.script.map((_, idx) => idx),
        score: null,
        evaluationEnabled: false,
      })
    }
  }

  onSelectedWordChanged = (selectedIndices) => {
    this.setState({ selectedIndices })
    // TODO: get new evaluation every time the selected word change. probably should be done after we did the evaluation thingy
    // this.getEvaluation()
  }

  getEvaluation = (name) => {
    // TODO: 
    //    1. implement audio upload
    //    2. return evaluation and set states

    const user = {
      username: name
    };
    axios.post('https://143.248.150.127:8080/score', {user}).then(
      res => this.setState({score: res.data.username})
      );
  }

  enableEvaluation = () => {
    this.setState({ evaluationEnabled: true })
  }

  render() {
    return(
      <Row className="record-bar no-gutters">
        <Col>
          <WordSelector quote={this.state.quote.script} selectedIndices={this.state.selectedIndices} onSelectedWordChanged={this.onSelectedWordChanged} />
          <div className="justify-content-md-center">
            <ReactMediaRecorder
              audio
              render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                <div className="record-bar--wrap">
                  {
                  status === "recording" ? 
                    <Button
                      bsPrefix="record-bar--round-button active"
                      onClick={() => {stopRecording(); this.enableEvaluation(); }}
                    >
                        <FontAwesomeIcon icon="microphone" size="lg" />
                    </Button>
                    :
                    status === "stopping" ?
                    <Button bsPrefix="record-bar--round-button loading">
                        <FontAwesomeIcon icon="circle-notch" size="lg" spin />
                    </Button>
                    :
                    <Button
                      bsPrefix="record-bar--round-button inactive"
                      onClick={startRecording}
                    >
                        <FontAwesomeIcon icon="microphone" size="lg" />
                    </Button>
                  }
                  <Button
                    bsPrefix={"record-bar--round-button long " +  (this.state.evaluationEnabled ? "inactive" : "disabled")}
                    onClick={() => {this.getEvaluation("jyp")}}
                  >
                      <FontAwesomeIcon icon="spell-check" size="lg" />
                      <div className="record-bar--round-button--label">evaluate</div>
                  </Button>
                  <audio className="record-bar--player" src={mediaBlobUrl} controls />
                </div>
              )}
            />
          </div>
        </Col>
        <Scoreboard />
      </Row>
    );
  }
}

export default RecordBar;
