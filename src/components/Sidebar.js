import React from 'react'
import { Col} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHatWizard, faQuidditch, faChevronRight, faChevronCircleRight, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import '../scss/sidebar.scss'

library.add(faHatWizard, faQuidditch, faChevronRight, faChevronCircleRight, faSyncAlt);


class Sidebar extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        icon: this.props.icon || 'quidditch',
        name: this.props.name || "Harry Potter",
        quote: this.props.quote,
        selectedQuote: this.props.selectedQuote || 0,
        onQuoteChanged: this.props.onQuoteChanged,
        onCharacterChanged: this.props.onCharacterChanged,
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps !== this.props) {
      this.setState({
        icon: this.props.icon || 'quidditch',
        name: this.props.name || "Harry Potter",
        quote: this.props.quote,
        selectedQuote: this.props.selectedQuote || 0,
      })
    }
  }

  render() {
    return(
        <Col md={3} className="sidebar">
          <FontAwesomeIcon
          className="sidebar--main-icon"
            icon={this.state.icon} size="6x" 
          />
          <div className="sidebar--name">
            { this.state.name }
          </div>
          <div className="sidebar--submenu-wrap">
            { this.props.quote ?
              this.props.quote.map((quoteEntry, idx) => {
                return(
                  <div 
                    className={"sidebar--submenu-item " + (this.state.selectedQuote === idx ? "active" : "inactive") }
                    value={idx}
                    onClick={() => this.state.onQuoteChanged(idx)}
                  >
                    { this.state.selectedQuote === idx ? 
                      <FontAwesomeIcon className="sidebar--submenu-icon active" icon="chevron-circle-right" /> 
                      : <FontAwesomeIcon className="sidebar--submenu-icon inactive" icon="chevron-right" size="xs" />
                    }
                    <strong style={{fontFamily: "Oswald", textTransform: "uppercase"}}> Quote {idx+1} :</strong> {quoteEntry.script.join(" ")}
                  </div>
                )
              })
              :
              null
            }
          </div>
          <div className="sidebar--alt-character" onClick={this.state.onCharacterChanged}>
            <FontAwesomeIcon className="sidebar--alt-character---icon" icon="sync-alt" />
            change character
          </div>
        </Col>
    );
  }
}

export default Sidebar;