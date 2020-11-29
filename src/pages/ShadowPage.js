import React from 'react'
import { Container, Row, Col} from 'react-bootstrap'
import Sidebar from '../components/Sidebar'
import RecordBar from '../components/RecordBar'
import VideoPlayer from '../components/VideoPlayer'
import { MOVIE_SCRIPT } from '../constants/script'

class ShadowPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      character: MOVIE_SCRIPT.character1,
      selectedCharacter: 0,
      selectedQuote: 0,
    }

    this.onQuoteChanged = this.onQuoteChanged.bind(this)
    this.onCharacterChanged = this.onCharacterChanged.bind(this)
  }

  onQuoteChanged = (idx) => {
    this.setState({ selectedQuote: idx })
  }

  onCharacterChanged = () => {
    let selectedCharacter = this.state.selectedCharacter
    let selectedQuote = 0
    let character
    if (selectedCharacter === 0) {
      character = MOVIE_SCRIPT.character2
      selectedCharacter = 1
    }
    else {
      character = MOVIE_SCRIPT.character1
      selectedCharacter = 0
    }

    this.setState({ selectedCharacter, selectedQuote, character })
  }

  render() {
    return(
      <Container fluid className="App-wrap">
        <Row style={{ height: "100vh"}}>
          <Sidebar 
            name={this.state.character.name}
            icon={this.state.character.icon}
            quote={this.state.character.quote}
            selectedQuote={this.state.selectedQuote}
            onQuoteChanged={this.onQuoteChanged}
            onCharacterChanged={this.onCharacterChanged}
          />
          <Col>
            <Row style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
              <VideoPlayer videoUrl={this.state.character.quote[this.state.selectedQuote].video_url} />
              <RecordBar quote={this.state.character.quote[this.state.selectedQuote]} selectedCharacter={this.state.selectedCharacter} selectedQuote={this.state.selectedQuote} />
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default ShadowPage
