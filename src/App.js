import React from 'react';
//import logo from './logo.svg';
import './App.css';
import { simRunner, survival } from './simulation';
import { Form, Results, AboutContent } from './components/components.js';
import { Decimal } from 'decimal.js';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Data extends React.Component{
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAllocChange = this.handleAllocChange.bind(this);
    this.handleSim = this.handleSim.bind(this);
    this.handleSimNumChange = this.handleSimNumChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.state = {
      loaded: false,
      loading: false,
      error_list: [],
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
    this.state.error_list.push(error)
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
    this.setState({
      allocation : alloc
    }, 
      this.validateForm()
    )};

  validateForm(){
    const errors = [];
    const alloc = this.state.allocation;
    if((Decimal(alloc.beg_bond).add(alloc.beg_equity)).greaterThan(100)){
      errors.push(`Beginning allocations must be less than or equal to 100%. It is currently ${Decimal(alloc.beg_bond).add(alloc.beg_equity)}%`);
    } if((Decimal(alloc.end_bond).add(alloc.end_equity)).greaterThan(100)){
      errors.push(`Endining allocations must be less than or equal to 100%  It is currently ${Decimal(alloc.end_bond).add(alloc.end_equity)}%`);
    }    
    return this.setState({
      error_list: errors,
    });
  };
  

  render(){
    return (
      <div className='container-fluid'>
        <p>A <a href='https://www.investopedia.com/terms/m/montecarlosimulation.asp'> Monte Carlo simulator </a> to project your future financial position, given your individual parameters and historical market performance. This simulation supports dynamic changes to asset allocation throughout the simulation period. </p>
        <p>This project is for illustrative purposes only. This tool should not be used for financial or investment advice. This tool has not been subject to rigorous testing and may contain errors.</p>
        <Form handleSubmit={this.handleSubmit} handler={this.handleChange} 
            state={this.state} handleAllocChange={this.handleAllocChange}
            handleSim={this.handleSim}  handleSelectChange={this.handleSimNumChange}
            errors={this.state.error_list} />
        

        {this.state.loaded && <Results title={this.state.outcomes.survival} 
          data={this.state.outcomes} duration={this.state.duration} 
          outcomes={this.state.outcomes} />}

      </div>      
    )
  }
}

function Header(){
  return(
    <header data-spy="affix" data-offset-top="80" className="header-main --default affix">
      <div className="--wrap header-container">
          <h1 className='header'>
            <Link to='/'> 
              Monte Carlo Retirement Simulator 
            </Link> 
          </h1>
          <h4 className='header'> 
            <Link to='/about'> About </Link>
          </h4>
      </div>
    </header>
  )
}

function App(){
  return (
    <Router>
      <React.Fragment>
        <Header/>
        <Route exact path='/' component={Home} />
        <Route exact path='/about' component={About} />
      </React.Fragment>
    </Router>
  )
}

function Home(){
  return (
    <div className='container'>
      <Data/>
    </div>
  )
}

function About(){
  return(
    <div className='container'>
      <AboutContent/>
    </div>
  )
}


export default App ;

