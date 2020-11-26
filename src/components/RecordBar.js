import React from 'react'
import WordSelector from './WordSelector'
import { Row, Col, Button } from 'react-bootstrap'
import { ReactMediaRecorder } from "react-media-recorder"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMicrophone, faCircleNotch} from '@fortawesome/free-solid-svg-icons'
import '../scss/recordbar.scss'


library.add(faMicrophone, faCircleNotch);


class RecordBar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      quote: this.props.quote,
      selectedIndices: this.props.quote.script.map((_, idx) => idx),
    }

    this.onSelectedWordChanged = this.onSelectedWordChanged.bind(this)
    this.getEvaluation = this.getEvaluation.bind(this)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        quote: this.props.quote,
        selectedIndices: this.props.quote.script.map((_, idx) => idx),
      })
    }
  }

  onSelectedWordChanged = (selectedIndices) => {
    this.setState({ selectedIndices })
    // TODO: get new evaluation every time the selected word change. probably should be done after we did the evaluation thingy
    // this.getEvaluation()
  }

  getEvaluation = () => {
    // TODO: 
    //    1. implement audio upload
    //    2. return evaluation and set states
  }

  render() {
    return(
      <div className="record-bar">
        <WordSelector quote={this.state.quote.script} selectedIndices={this.state.selectedIndices} onSelectedWordChanged={this.onSelectedWordChanged} />
        <Row className="justify-content-md-center">
          <ReactMediaRecorder
            audio
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
              <div className="record-bar--wrap">
                <Row className="justify-content-md-center align-items-center">
                  <Col>
                    {
                      status === "recording" ? 
                        <Button
                          bsPrefix="record-bar--round-button active"
                          onClick={() => {stopRecording(); this.getEvaluation()}}
                        >
                            <FontAwesomeIcon icon="microphone" size="lg" />
                        </Button>
                        :
                        status === "stopping" ?
                        <Button
                          bsPrefix="record-bar--round-button loading"
                        >
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
                  </Col>
                  <Col>
                    <audio className="record-bar--player" src={mediaBlobUrl} controls />
                  </Col>
                </Row>
              </div>
            )}
          />
        </Row>
      </div>
    );
  }
}

export default RecordBar;