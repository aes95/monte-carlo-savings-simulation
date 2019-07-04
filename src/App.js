import React from 'react';
//import logo from './logo.svg';
import './App.css';
import { simRunner, survival } from './simulation';
import { Form, Results } from './components/components.js';
import { string, object } from 'yup'; 

class Data extends React.Component{
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAllocChange = this.handleAllocChange.bind(this);
    this.handleSim = this.handleSim.bind(this);
    this.handleSimNumChange = this.handleSimNumChange.bind(this);
    this.state = {
      loaded: false,
      loading: false,
      years_to_ret: '30',
      duration: '45',
      savings: '100000',
      contribution: '1200',
      ret_income: '100000',
      allocation: {
        beg_equity: '75',
        beg_bond: '25',
        end_equity: '20',
        end_bond: '80'
      },
      simRunsNum: '1000',
      inflation: '1.8',
      outcomes: {},
    };
  };

  componentDidMount(){
    if (window.localStorage.getItem('asset_data')){
      if (window.localStorage.getItem('asset_data').length > 500){
        return
      }
    }
    fetch('https://calc-project.herokuapp.com/api/index/')
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
      window.localStorage.setItem('asset_data', JSON.stringify(asset_data));
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
          runs: this.state.simRunsNum,
          median: scenarios[Math.floor(scenarios.length /2)],
          buttom10:  scenarios[Math.floor(scenarios.length /10)],
          buttom25:  scenarios[Math.floor(scenarios.length /100 *25)],
          top25:  scenarios[Math.floor(scenarios.length /100 * 75)],
          top10:  scenarios[Math.floor(scenarios.length /10 * 9)],
          survival: survival(scenarios),
        },
      })
    })
  };

handleSimNumChange(e){
  e.preventDefault();
  this.setState({
    simRunsNum: e.target.value
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
    const value = Math.max(e.target.rawValue,0);
    const new_value = !Number.isNaN(value) ? value : this.state[field]
    this.setState({[field] : new_value.toString()});
  }

  handleAllocChange(e){
    const field = e.target.name;
    const value = Math.max(e.target.rawValue,0);
    const alloc = this.state.allocation;
    alloc[field] = value.toString(); 
    this.setState({allocation : alloc});
  }
  

  render(){
    return (
      <div className='container-fluid'>
        <p>A <a href='https://www.investopedia.com/terms/m/montecarlosimulation.asp'> Monte Carlo simulator </a> to project your future financial position, given your individual parameters and historical market performance. This simulation supports dynamic changes to asset allocation throughout the simulation period. </p>
        <p>This project is for illustrative purposes only. This tool should not be used for financial or investment advice. This tool has not been subject to rigorous testing and may contain errors.</p>
        <Form handleSubmit={this.handleSubmit} handler={this.handleChange} 
            state={this.state} handleAllocChange={this.handleAllocChange}
            handleSim={this.handleSim}  handleSelectChange={this.handleSimNumChange}/>

        {this.state.loaded && <Results title={this.state.outcomes.survival} 
          data={this.state.outcomes} duration={this.state.duration} 
          outcomes={this.state.outcomes} />}

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

