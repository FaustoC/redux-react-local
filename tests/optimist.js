/* global describe, it, beforeEach, afterEach */

import React, {PropTypes, Component} from 'react' ;

import {render, unmountComponentAtNode} from 'react-dom';

import {createStore, combineReducers} from 'redux';
import {connect, Provider} from 'react-redux';

import {Optimist} from '../src/optimist';
import optimist from 'redux-optimist';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

class LocalRoot extends Component{
  store = createStore(
    optimist(combineReducers({
      app(state = {x: 0, y: 0, z: 0}, {type, payload} = {}){
        switch (type){
          case 'act': return {...state, x: 1, y: 2, w: payload.w};
          case 'act:commit': return {...state, x: 2, z: 3, w: payload.w};
          case 'act:revert': return {...state, y: 5, z: 9, w: payload.w};
        }
        return state;
      }
    }))
  );
  render(){
    return <Provider store={this.store}>
      <Optimist>
        {this.props.children}
      </Optimist>
    </Provider>;
  }
}

describe('react-redux-optimist', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));

  it('commits', () => {

    @connect(state => state)
    class App extends Component{
      static contextTypes = {
        optimist: PropTypes.func
      };
      componentDidMount(){
        let {dispatch} = this.props;
        let o = this.context.optimist('act');

        dispatch(o.begin({payload: {w: 1}}));
        dispatch(o.commit({payload: {w: 5}}));
      }
      render(){
        return <div>{JSON.stringify(this.props.app)}</div>;
      }
    }
    render(<LocalRoot><App /></LocalRoot>, node);

    expect(node.innerText).toEqual(JSON.stringify({
      x: 2, y: 2, z: 3, w: 5
    }));

  });


  it('reverts', () => {

    @connect(state => state)
    class App extends Component{
      static contextTypes = {
        optimist: PropTypes.func
      };
      componentDidMount(){
        let {dispatch} = this.props;
        let o = this.context.optimist('act');

        dispatch(o.begin({payload: {w: 1}}));
        dispatch(o.revert({payload: {w: 5}}));
      }
      render(){
        return <div>{JSON.stringify(this.props.app)}</div>;
      }
    }
    render(<LocalRoot><App /></LocalRoot>, node);

    expect(node.innerText).toEqual(JSON.stringify({
      x: 0, y: 5, z: 9, w: 5
    }));

  });

});
