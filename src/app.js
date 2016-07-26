var remote = window.require( "remote" );
var dialog = remote.require("dialog");
var shell = require('shell')

import React from "react"
import { fetchWeather, fetchCityImage } from "./utils/api"
import fetch from "whatwg-fetch"
import _ from "lodash"
import randomColor from "randomcolor";
import EventEmitter from 'events'

import WeekWeather from "./components/WeekWeather"

import ipc from 'ipc';

import "./css/style.styl";


export default class App extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      city: "Bucharest",
      searchedCity: "Bucharest",
      weekWeather: []
    };
  }

  componentWillMount() {
    this.getWeather();
  }

  getWeather(searchedCity = this.state.city) {
    fetchWeather(searchedCity)
      .then((response) => {
        var weather = _.map(response.list, (dayWeather) => {
          return {
            dayWeather,
            country: response.city.country,
            city: response.city.name
          }
        });

        this.setState({
          weekWeather: weather,
          city: this.state.searchedCity,
          color: randomColor({luminosity: "light", format: "hex"}),
          responsedCity: response.city.name
        });

        ipc.send('set-title', {
          temperature: weather[0].dayWeather.temp.max,
          location: `${response.city.name}, ${response.city.country}`
        });

        fetchCityImage(response.city.name)
          .then((result) => {
            const results = result.responseData.results;

            console.log(_.pluck(results, "unescapedUrl")[0])
            this.setState({
              cityImage: _.pluck(results, "unescapedUrl")[0]
            });
          })
      })

  }

  render() {
    var style = {
      backgroundImage: `url("${this.state.cityImage}")`
    }

    return <div className="weather-container" style={style}>
      <p>{this.state.cityImage}</p>
      {_.isEmpty(this.state.weekWeather) ? "no data" :
        <WeekWeather color={this.state.color}
                     weekWeather={this.state.weekWeather} />}
      {this._renderForm()}
      {this._renderBlockquote()}
    </div>;
  }

  _renderBlockquote() {
    return <small className="copyrights">
      Created by
      <a
        href="#"
        onClick={() => shell.openExternal('http://twitter.com/mironcatalin')}
      > @mironcatalin</a>.
      Github
      <a
        href="#"
        onClick={() => shell.openExternal('http://github.com/catalinmiron')}
      >catalinmiron</a>
    </small>
  }

  _renderForm() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <fieldset>
          <legend>Enter your city</legend>
          <input className="form-input"
                 ref="locationName"
                 type="text"
                 defaultValue={this.state.searchedCity}/>
        </fieldset>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    const searchedCity = this.refs.locationName.getDOMNode().value;

    if (searchedCity === this.state.city) {
      return;
    }

    this.getWeather(searchedCity);
  }
};


React.render(<App />, document.body);
