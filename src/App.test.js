import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Decimal} from 'decimal.js';
import { wReturnArr, rand, flow, outcome, simRunner, maxDrawdown } from './simulation';
import { test_state } from './components/state.testing';


jest.mock('react-plotly.js', () => ({
  map: () => ({})
}));


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

test('Test rand function', () => {
  const data = {
    bond: [1,2,3,4,5],
    equity: [1,2,3,4,5,6,7]
  }
  const period = 4;
  const random = rand(data, period);
  expect(random.equity).toHaveLength(period *12);
  expect(random.equity).toHaveLength(random.bond.length);
  
  //the following test has a small chance of resulting in a false negative
  expect(random.equity.length).not.toBe(rand(data,period)); 
  
  expect(random.equity).toBeInstanceOf(Array)
  expect(random.equity.filter(i => {
    return Object.prototype.toString.call(i).slice(8, -1) === 'Number'
  })).toHaveLength(period *12)
  expect(random.bond.filter(i => {
    return Object.prototype.toString.call(i).slice(8, -1) === 'Number'
  })).toHaveLength(period *12)  
})

test('Weight returns in accordence with monthly allocations', () =>{
  const return_arrs = {
    equity: ['.005', '-0.06', '-.09'],
    bond: ['.01', '-0.01', '.03'],
  };
  const alloc = {
    beg_equity: '60',
    beg_bond: '40',
    end_equity: '20',
    end_bond: '80'
  }
  const period = 3
  const test_run1 = wReturnArr(return_arrs, alloc, period);
  expect(test_run1).toBeInstanceOf(Array);
  expect(test_run1).toHaveLength(return_arrs.bond.length *12);
})


test('cashflows are withing range', ()=>{
  const savings = '100000';
  const time_to_ret = '5';
  const period = '10';
  const contrib = '1000';
  const dist = '12000';
  const flows = flow(savings, time_to_ret, period, contrib, dist);
  expect(flows.length).toBe(121);
  expect(flows[0]).toBe(savings);
  expect(flows[60].toString()).toBe('1000');
  expect(flows[61].toString()).toBe('-1000');
  expect(flows.reduce((acc, curr) => Decimal(acc).plus(curr)).toString())
  .toBe('100000');
})

test('Returns are properly accrued', ()=> {
  const cashflows1 = [Decimal('100'), Decimal('10'), Decimal('10.8'), Decimal('0')];
  const returns2 = [Decimal('.1'), Decimal('-.09'), Decimal('.2')];
  const test_run1 = outcome(returns2, cashflows1);
  expect(test_run1).toHaveLength(cashflows1.length);
  expect(test_run1).toEqual([Decimal('100'), Decimal('120'), Decimal('120'), Decimal('144')])

  const cashflows2 = [Decimal(0), Decimal('-5'), Decimal(0), Decimal('30')]
  const test_run2 = outcome(returns2, cashflows2);
  expect(test_run2).toHaveLength(cashflows2.length);
  expect(test_run2).toEqual([Decimal('0'), Decimal('0'), Decimal('0'), Decimal('30')])
})

test('Simulation is ran properly', ()=>{
  const sim1 = simRunner(test_state);
  
})

test('Drawdown is calculated properly', ()=>{
  const values = [100, 150, 90, 125, 80, 225].map(i=> Decimal(i));
  const res = maxDrawdown(values);
  expect(res).toBe('46.67')
})