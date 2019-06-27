/* global Plotly:true */

import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory'
import { Decimal } from 'decimal.js';
import { maxDrawdown } from '../simulation';
import Cleave from 'cleave.js/react';


const Field = function FieldArea(props){
    return(
      <div id='form-group row'> 
        <label className='' htmlFor={props.name} >
          <h5>{props.title}: </h5>
        </label>
        <Cleave value={props.value} name={props.name}
                id={props.name} className='form-control'
                options={{numeral: true,
                numeralThousandsGroupStyle: 'thousand'}}
                onChange={props.onChange}/>
      </div>  
    );
};

const Results = class SimulationResults extends React.Component{
  constructor(props){
    super(props);
    this.myRef = React.createRef();
  }
  componentDidMount(){
    setTimeout(()=>{
      const chart_top = document.querySelector('.js-plotly-plot');
      chart_top.scrollIntoView({behavior: "smooth"});
    },10)
  }

  render(){
    const outcomes = this.props.outcomes
    return(
      <React.Fragment>
        <Chart data={this.props.data} duration={this.props.duration}/>
        <h6> In {outcomes.runs} simulations, the Portfolio survived 
          in {`${Math.floor(outcomes.survival * outcomes.runs/100)}`} {`(${outcomes.survival}%)`} of cases </h6>
        <StatTable data={this.props.data} />
      </React.Fragment>
    )
  }
}

const Chart = function Chart(props) {
  const chart_x_axis = Array.from({length: props.duration * 12 +1},(v,k)=>k/12);
  const data = [{
    x: chart_x_axis,
    y: props.data.median.map( i => parseInt(i.toString())),
    type: 'scatter',
    name: '50th Percentile',
  },
  {
    x: chart_x_axis,
    y: props.data.buttom25.map( i => parseInt(i.toString())),
    type: 'scatter',
    name: '25th Percentile'
  },
  {
    x: chart_x_axis,
    y: props.data.top25.map( i => parseInt(i.toString())),
    type: 'scatter',
    name: '75th Percentile'
  },]
  return (
      React.createElement(createPlotlyComponent(Plotly),{
          data: data,
          config: { 
            displaylogo: false, 
            displayModeBar: false,
            scrollZoom: false,
          },
          layout: {
            title:{ text: 'Simulated Portfolio Balances' },
            legend: { orientation: "h" },
            autosize: true,
            margin:{ r: 30, l: 40, t: 80, b: 40 },
          },
          useResizeHandler: true,
          style: {
            width: "100%",
            height: "100%",
            overflow: "auto",
          },
      })
  )   
}

const StatTable = function SummaryStatTable(props){
  const length = props.data.median.length;
  Decimal.set({rounding:0})
  return(
    <div className='table-responsive'>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">10th Percentile	</th>
            <th scope="col">25th Percentile	</th>
            <th scope="col">50th Percentile	</th>
            <th scope="col">75th Percentile	</th>
            <th scope="col">90th Percentile	</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Ending Balance</th>
            <td>{ Intl.NumberFormat().format(props.data.buttom10[length -1].round())  } </td>
            <td>{ Intl.NumberFormat().format(props.data.buttom25[length -1].round())  } </td>
            <td>{ Intl.NumberFormat().format(props.data.median[length -1].round())  } </td>
            <td>{ Intl.NumberFormat().format(props.data.top25[length -1].round())  } </td>
            <td>{ Intl.NumberFormat().format(props.data.top10[length -1].round())  } </td>
          </tr>
          <tr>
            <th scope="row">Maximum Drawdown</th>
            <td>{ `-${maxDrawdown(props.data.buttom10)}%` } </td>
            <td>{ `-${maxDrawdown(props.data.buttom25)}%` } </td>
            <td>{ `-${maxDrawdown(props.data.median)}%` }</td>
            <td>{ `-${maxDrawdown(props.data.top25)}%` } </td>
            <td>{ `-${maxDrawdown(props.data.top10)}%` } </td>
          </tr>
        </tbody>
      </table>
    </div>

  )
}

const Spinner = class SpinnerButton extends React.Component{
    componentDidMount(){
        //TODO: need to fix this code - works in chrome, but not other browsers
        setTimeout(this.props.handler,50)
    }

    render(){
        const classes = `fas fa-spinner`;
        return (
            <button type='submit' id='submit-btm' className='btn btn-primary' disabled>
              <i className={classes}></i> Simulating
            </button>
        )
    }
}

const Form = function InputForm(props) {
  return(
      <form className='form-horizontal' onSubmit={props.handleSubmit}>  
        <Field name='years_to_ret' value={props.state.years_to_ret} 
          onChange={props.handler} title='Years to Retirement' />
        
        <Field name='duration' value={props.state.duration} 
        onChange={props.handler} title='Duration of Simulation' />
        
        <Field name='savings' value={(props.state.savings)} 
        onChange={props.handler} title='Current Savings' />

        <Field name='contribution' value={props.state.contribution}
        onChange={props.handler} title='Monthly Contribution until Retirement' />

        <Field name='ret_income' value={props.state.ret_income} 
        onChange={props.handler} title='Target Annual Retirement Income' />

        <Field name='beg_equity' value={props.state.allocation.beg_equity}
        onChange={props.handleAllocChange} title='Current Equity Allocation (%)' />

        <Field name='beg_bond' value={props.state.allocation.beg_bond}
        onChange={props.handleAllocChange} title='Current Fixed Income Allocation (%)' />
        
        <Field name='end_equity' value={props.state.allocation.end_equity}
        onChange={props.handleAllocChange} title='Final Equity Allocation (%)' />

        <Field name='end_bond' value={props.state.allocation.end_bond}
        onChange={props.handleAllocChange} title='Final Fixed Income Allocation (%)' />

        <div id='form-group row'> 
          <label className='' htmlFor='num-sim' >
            <h5>Number of Simulation Runs: </h5>
          </label>
          <select className="form-control" onChange={props.handleSelectChange} value={props.state.simRunsNum}>
            <option value='100'>100</option>
            <option value='500'>500</option>
            <option value='1000'>1,000</option>
            <option value='2500'>2,500</option>
            <option value='5000'>5,000</option>
          </select>
        </div>  

        <div id='logger'></div>
        {props.state.loading
        ? <Spinner data={props.state} handler={props.handleSim} /> 
        : <button type='submit' id='submit-btn' 
          className='btn btn-primary'>Simulate!</button>}        
      </form>
  )
}

export { Field, Results, Spinner, Form } 