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
      selectedCharacter: this.props.selectedCharacter,
      selectedQuote: this.props.selectedQuote,
      phrase1: this.props.phrase1,
      phrase2: null,
      loading: false,
    }

    this.onSelectedWordChanged = this.onSelectedWordChanged.bind(this)
    this.getEvaluation = this.getEvaluation.bind(this)
    this.enableEvaluation = this.enableEvaluation.bind(this)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      if (prevProps.quote !== this.props.quote) {
        this.setState({
          audio: null,
          quote: this.props.quote,
          selectedIndices: this.props.quote.script.map((_, idx) => idx),
          score: null,
          evaluationEnabled: false,
          phrase1: null,
          loading: false,
          phrase2: null,
        })
      }
      else {
        this.setState({
          quote: this.props.quote,
          selectedIndices: this.props.quote.script.map((_, idx) => idx),
        })
      }
    }
  }

  onSelectedWordChanged = (selectedIndices) => {
    this.setState({ selectedIndices })
    // TODO: get new evaluation every time the selected word change. probably should be done after we did the evaluation thingy
    // this.getEvaluation()
  }

  getEvaluation = (url) => {
    // TODO: 
    //    1. implement audio upload
    //    2. return evaluation and set states
    if (this.state.audio != null) {
      this.setState({ loading: true })
      //load blob
      var xhr_get_audio = new XMLHttpRequest();
      const par = this;
      xhr_get_audio.open('GET', url, true);
      xhr_get_audio.responseType = 'blob';
      xhr_get_audio.onload = function(e) {
          if (this.status === 200) {
              var blob = this.response;
              //send the blob to the server
              var filename = "filename0" 
              var fd = new FormData();
              var indices = par.state.selectedIndices.join("-");
              fd.append("words", indices);
              fd.append("audio_data", blob, filename);
              fd.append("character", par.props.selectedCharacter);
              fd.append("quote", par.props.selectedQuote);
              axios.post('https://143.248.150.127:8080/score', 
                          fd, 
              {headers: {'Content-Type': 'multipart/form-data'}})
              .then(
                res => par.setState({
                  score: res.data.score,
                  //phrase1: res.data.phrase_1,
                  phrase2: res.data.phrase_2,
                  loading: false,
                })
              );
          }
      };
      xhr_get_audio.send();
    }
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
              onStop = {mediaBlobUrl => this.setState({audio: mediaBlobUrl}) }
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
                    bsPrefix={"record-bar--round-button long " +  (this.state.audio != null? "inactive" : "disabled")}
                    onClick={() => {this.getEvaluation(mediaBlobUrl)}}
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
        <Scoreboard 
          script={this.state.quote.script}
          score={this.state.score} 
          phrase1={this.state.phrase1} 
          phrase2={this.state.phrase2}
          loading={this.state.loading} />
      </Row>
    )
  }
}

export default RecordBar;
