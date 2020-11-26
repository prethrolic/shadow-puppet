import React from 'react'
import '../scss/videoplayer.scss'

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      videoUrl: this.props.videoUrl,
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        videoUrl: this.props.videoUrl,
      })
    }
  }

  render() {
    return (
      <div className="video-player--wrap">
        <iframe src={this.state.videoUrl} className="flex-grow-1" frameBorder="0"/>
      </div>
    )
  }
}

export default VideoPlayer;