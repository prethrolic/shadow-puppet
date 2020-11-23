import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCogs} from '@fortawesome/free-solid-svg-icons'
import '../scss/sidebar.scss';

library.add(faCogs);


class Sidebar extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        show: this.props.show,
        strictness: true,
    }

    this.handleStrictness = this.handleStrictness.bind(this);
  }

  handleStrictness(e) {
    const strictness = (e.target.value === "exact") ? true:false;
    this.setState({ strictness: strictness });
  }

  render() {
      if (this.state.show) {
        return(
            <Col md={3} className="sidebar">
              <FontAwesomeIcon
              className="sidebar--main-icon"
                icon="cogs" size="6x" 
              />
              <Form className="sidebar--form-wrap">
                <div>
                  <Form.Group>
                    <div>
                      <Form.Label className="sidebar--option-title">strictness</Form.Label>
                    </div>
                    <div key="custom-radio" className="mb-3">
                      <Form.Check custom inline id="custom-radio-1">
                        <Form.Check.Input 
                          type="radio" name="strictness" value="exact"
                          checked={this.state.strictness} 
                          onChange={this.handleStrictness} />
                        <Form.Check.Label
                          bsPrefix= {this.state.strictness ? "sidebar--option-label--active" : "sidebar--option-label"}>
                          exact match
                        </Form.Check.Label>
                      </Form.Check>
                      <Form.Check custom inline id="custom-radio-2">
                        <Form.Check.Input 
                          type="radio" name="strictness" value="pronunciation"
                          checked={!this.state.strictness}
                          onChange={this.handleStrictness} />
                        <Form.Check.Label
                          bsPrefix={this.state.strictness ? "sidebar--option-label" : "sidebar--option-label--active"}>
                          word pronunciation
                        </Form.Check.Label>
                      </Form.Check>
                    </div>
                  </Form.Group>
                </div>
              </Form>
            </Col>
        );
      }
      else return null;
  }
}

export default Sidebar;