/* global Plotly:true */

import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory'

const Field = function FieldArea(props){
    return(
      <div id='form-group row'> 
        <label className='' htmlFor={props.name} >
          <h5>{props.title}: </h5>
        </label>
        <input type='number' onChange={props.onChange} name={props.name} 
        value ={props.value} id={props.name} className='form-control' /> 
      </div>  
    );
};

const Results = class SimulationResults extends React.Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){

  }

  render(){
    return(
      <Chart data={this.props.data} />
    )
  }
}

const Chart = function Chart(props) {
  return (
      React.createElement(createPlotlyComponent(Plotly),{
          data: props.data,
          layout: {
              title:{
                  text: 'Simulated Portfolio Balances',
              }
          }
      })
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
        
        <Field name='savings' value={props.state.savings} 
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

        <div id='logger'></div>
        {props.state.loading
        ? <Spinner data={props.state} handler={props.handleSim} /> 
        : <button type='submit' id='submit-btn' 
          className='btn btn-primary'>Submit!</button>}
        
      </form>
  )
}

export { Field, Results, Spinner, Form } 