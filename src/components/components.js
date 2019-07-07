/* global Plotly:true */

import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory'
import { Decimal } from 'decimal.js';
import { maxDrawdown } from '../simulation';
import Cleave from 'cleave.js/react';


const Field = function FieldArea(props){
    return(
      <div id='form-group row'> 
        <label className='field-name' htmlFor={props.name} >
          <h5>{props.title} </h5>
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

function AboutContent(){
  return (
    <div>
      <h5> What Does This App Do?</h5>
      <p>A <a href='https://www.investopedia.com/terms/m/montecarlosimulation.asp'> Monte Carlo simulator </a> to project your future financial position, given your individual parameters and historical market performance. This simulation supports dynamic changes to asset allocation throughout the simulation period. </p>
      <h5> How Do I Use This Simulator?</h5>
      <p> <strong> Years to Retirement </strong> - The number of years until you expect to retire </p>
      <p> <strong> Duration of Simulation </strong> - The number of years you would like to simulate. This number should be at least your life expectancy. You can click <a href='https://www.ssa.gov/oact/population/longevity.html'>here</a> to estimate your life expectancy</p>
      <p> <strong> Current Savings </strong> - The amount of retirement savings you currently have  </p>
      <p> <strong> Monthly Contribution until Retirement </strong> - The amount you expect to save every month, starting now, towards retirement. The calculator assumes that the monthly contribution will increase at the inflation until the retirement date, at which point contributions will stop</p>
      <p> <strong> Target Annual Retirement Income </strong> - The amount of annual retirement income, in current terms, you expect you will need to support your retirement lifestyle. The calculator assumes that the annual amount will be withdrawn monthly starting at the retirement date. The withdrawals are expected to increase with inflation.</p>
      <p> <strong> Equity/Fixed Income Allocation </strong> - The spilt between equity and fixed income assets in your portfolio. It is generally recommended to have a diversified portfolio with both fixed income and equity investments to acheive long term growth. This calculator uses the historical returns of the <a href='https://en.wikipedia.org/wiki/S%26P_500_Index'>S&P 500</a> for the equity investments and the historical returns from the Vanguard Total Bond Market Index Fund (<a href='https://investor.vanguard.com/mutual-funds/profile/VBMFX'>VBMFX</a>) for the fixed income investments. To account for correlation between the asset classes, the calculator uses the equity and fixed income allocations from the same historical period. </p>
      <p> <strong> Current/Final Allocation </strong> - It is generally recommended to shift the asset allocation of a retirement portfolio from a higher risk portfolio to a lower risk portfolio over time, to allow for better stability in retirement. Equity investments are generally considered higher risk (and are therefore expected to generate a higher return) than fixed income investments. This calculator allows for accounting for this so called <a href='https://www.investopedia.com/terms/g/glide-path.asp'>Glide Path</a>. This calculator assumes that asset allocations will change on a straight line basis from the beginning allocation to the ending allocation between the current date and the retirement date. </p>
      <p> <strong> Assumed inflation (%) </strong> - The annual expected inflation rate. The calculator assumes that your contributions and withdrawals with both increase with the rate of inflation. </p>
      <p> <strong> Number of Simulation Iterations </strong> - The number of times the calculator will run simulate outcomes with your parameters. The more the iteration performed, the more percise the result will be. However, additional iterations can take significatly more time to process. </p>
      <h5> IMPORTANT DISCLAIMERS</h5>
      <p>This project was created for illustrative purposes only. This tool should not be used for financial or investment advice. This tool has not been subject to rigorous testing and may contain errors. This calculator uses historical returns to estimate future market performance. Historical are no guarantee of future results. There are many other factors that may influance financial planning that are not taken into account in this caluclator. You should take into account these and other indivial factors in financial planning. </p>
    </div>
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
  const errors = props.errors.map((i, idx)=> <li key={idx}> {i} </li> )
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

        <Field name='inflation' value={props.state.inflation} onChange={props.handler}
        title='Assumed inflation (%)'></Field>

        <div id='form-group row'> 
          <label className='field-name' htmlFor='num-sim' >
            <h5>Number of Simulation Iterations: </h5>
          </label>
          <select className="form-control" onChange={props.handleSelectChange} value={props.state.simRunsNum}>
            <option value='100'>100</option>
            <option value='500'>500</option>
            <option value='1000'>1,000</option>
            <option value='2500'>2,500</option>
            <option value='5000'>5,000</option>
          </select>
        </div>  

        {props.errors.length > 0  && 
            <ul className='error'> {errors} </ul>  }

        {props.state.loading
        ? <Spinner data={props.state} handler={props.handleSim} /> 
        : <button type='submit' id='submit-btn' className='btn btn-primary'
          disabled={props.errors.length > 0} >Simulate!</button>}        
      </form>
  )
}

export { Field, Results, Spinner, Form, AboutContent } 