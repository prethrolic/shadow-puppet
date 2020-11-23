import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Row, Col } from 'react-bootstrap';
import { ReactMediaRecorder } from "react-media-recorder";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCogs} from '@fortawesome/free-solid-svg-icons';
import '../scss/recordbar.scss';


library.add(faCogs);


class RecordBar extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0
        }
      }
    }
  }

  render() {
    return(
      <Row className="record-bar justify-content-md-center">
        <ReactMediaRecorder
          audio
          render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
            <div className="record-bar--wrap">
              <audio src={mediaBlobUrl} controls />
              <p>{status}</p>
              <button onClick={startRecording}>Start Recording</button>
              <button onClick={stopRecording}>Stop Recording</button>
            </div>
          )}
        />
      </Row>
    );
  }
}

export default RecordBar;