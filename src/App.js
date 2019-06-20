import React from 'react';
//import logo from './logo.svg';
import './App.css';
import { simRunner, survival } from './simulation';
import { Results, Form } from './components/components.js';

class Data extends React.Component{
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAllocChange = this.handleAllocChange.bind(this);
    this.handleSim = this.handleSim.bind(this);
    this.state = {
      loaded: false,
      loading: false,
      years_to_ret: '30',
      duration: '50',
      savings: '50000',
      contribution: '1000',
      ret_income: '100000',
      allocation: {
        beg_equity: '60',
        beg_bond: '40',
        end_equity: '20',
        end_bond: '80'
      },
      returns: [],
      outcomes: {},
    };
  }

  componentDidMount(){
    fetch('http://127.0.0.1:8000/api/index/')
    .then((res) => {
      if (!res.ok){
        throw new Error('Network response was not ok.');
      }
      return res.json()
    })
    .then((data) => {
      const equity_data = [];
      const bond_data = [];
      data.forEach((i) => {
        if (i.index_name === 'SPX'){
          equity_data.push(i.mo_return);
        }else{
          bond_data.push(i.mo_return);
        }
      })
      if (bond_data.length < 1 || equity_data.length <1){
        throw new Error('API call returned no data')
      }
      const asset_data = {
        bond: bond_data,
        equity: equity_data,
      }
      window.localStorage.setItem('asset_data', JSON.stringify(asset_data))
  })
  .catch((error) => {
    console.log(error);
    document.getElementById('logger').innerHTML = error;
  })
}

  handleSim(){
    simRunner(this.state)
    .then((scenarios)=>{
      this.setState({
        loaded: true,
        loading: false,
        outcomes: {
          median: scenarios[Math.floor(scenarios.length /2)],
          buttom10:  scenarios[Math.floor(scenarios.length /10)],
          top10:  scenarios[Math.floor(scenarios.length /10 * 9)],
          survival: survival(scenarios),
        },
      })
    })
  }

  handleSubmit(e){
    e.preventDefault();
    this.setState({
      loading: true,
    })
  }

  handleChange(e){
    const field = e.target.name;
    const value = Math.max(e.target.value,0);
    this.setState({[field] : value.toString()});
  }

  handleAllocChange(e){
    const field = e.target.name;
    const value = Math.max(e.target.value,0);
    const alloc = this.state.allocation;
    alloc[field] = value.toString(); 
    this.setState({allocation : alloc});
  }
  

  render(){
    const chart_x_axis = Array.from({length: this.state.duration * 12 +1},(v,k)=>k/12);
    return (
      <div className='container-fluid'>

        <Form handleSubmit={this.handleSubmit} handler={this.handleChange} 
            state={this.state} handleAllocChange={this.handleAllocChange}
            handleSim={this.handleSim}  />

        {this.state.loaded && <Results title={this.state.outcomes.survival} data={
          [{
            x: chart_x_axis,
            y: this.state.outcomes.median.map( i => parseInt(i.toString())),
            type: 'scatter',
            name: '50th Percentile',
          },
          {
            x: chart_x_axis,
            y: this.state.outcomes.buttom10.map( i => parseInt(i.toString())),
            type: 'scatter',
            name: '10th Percentile'
          },
          {
            x: chart_x_axis,
            y: this.state.outcomes.top10.map( i => parseInt(i.toString())),
            type: 'scatter',
            name: '90th Percentile'
          },]
        }   />}

      </div>      
    )
  }
}

function App(){
  return (
    <div className='container'>
      <Data/>
    </div>
  )
}

export default App ;

