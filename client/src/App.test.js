import React from 'react';
import ReactDOM from 'react-dom';

import { configure, shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import toJson from 'enzyme-to-json'
import { DOMElement } from "jsdom";

import App from './App';

configure({ adapter: new Adapter() })

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('on change should remove spotify url', () => {
  const url = "https://open.spotify.com/track/3ZxgKv1s0qWEZOoRuNaxsn"
  const wrapper = mount(<App />);

  wrapper.find('textarea').simulate('change', {
    target: {name: "spotifyIds", value: url}
  })

  // wrapper.instance().handleChange( target )
  console.log( wrapper.state() )
  expect(wrapper.state('spotifyIds')).toContain('3ZxgKv1s0qWEZOoRuNaxsn')
})
