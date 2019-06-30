import { Decimal } from 'decimal.js';

const rand = function pickRandom(data, period){
    /**
     * takes historical data and returns randomized pair of returns
     * @param {Object} - histrocial data
     * @return {Object} - random returns for each asset class
     */
    const equity = data.equity;
    const bond = data.bond;
    const range = Math.min(bond.length, equity.length) -1;
    const bond_returns = [];
    const equity_returns = [];
    for (let i = 0; i < period *12; i+= 1){
        const random = Math.floor(Math.random() * (range + 1));
        bond_returns.push(bond[bond.length - random -1]);
        equity_returns.push(equity[equity.length - random -1]);
    }
    return { 
        bond: bond_returns, 
        equity: equity_returns,
    } ;
}

const wReturnArr =  function generateWeightedReturnArr(data, alloc, period){
    /**
     * Takes random return arrays and inital and ending allocations returns weighted returns
     * @param {Object} return_arrs - object with return arrays for each asset class
     * @param {Object} alloc - object with inital and ending allocations
     * @param {Number} period - number representing the time until retirment
     * @returns {Array} - weighted return array
     */
    const equity_delta = Decimal(alloc.end_equity - alloc.beg_equity).div(period -1);
    const bond_delta = Decimal(alloc.end_bond - alloc.beg_bond).div(period -1);
    const return_arrs = rand(data, period)
    return return_arrs.equity.map( (i,j) =>{
        const equity_alloc = j< period 
            ? Decimal( alloc.beg_equity).plus(equity_delta.times(j))
            : Decimal(alloc.end_equity);        
        const bond_alloc = j< period 
            ? Decimal(alloc.beg_bond).plus(bond_delta.times(j))
            : Decimal(alloc.end_bond);  
        const equity_return = Decimal(return_arrs.equity[j]).div(100)
            .times(equity_alloc);
        const bond_return = Decimal(return_arrs.bond[j]).div(100)
            .times(bond_alloc);
        return equity_return.plus(bond_return)
    })
}

const flow = function generateCashFlows (savings, time_to_ret, period, contrib, dist, infl=0){
    /**
    * Takes inital savings, 
    * @param {string} savings - inital savings
    * @param {string} time_to_ret - years making contributions before taking distributions
    * @param {string} period - number of years to perform simulation over
    * @param {string} contrib - monthly contribution over time_to_ret starting at the end of the first month
    * @param {string} dist - annual distribution after time_to_ret
    * @param {string} infl - annual inflation rate
    * @return {Array} - listing of monthly cashflows during simulation period
    */
   const cashflows = Array(period * 12 +1).fill(0);
   const breakpoint = time_to_ret * 12;
   const inf_factor = (Decimal(1).plus(Decimal(infl).div(100))).pow(Decimal(1/12));
   return cashflows.map( (i, j) => {
       if (j === 0){
           return savings;
       }else if (j <= breakpoint){
           return Decimal(contrib).times(inf_factor.pow(j));
       }else{
           return Decimal(dist).div('-12').times(inf_factor.pow(j));
       }
   } )
}

const outcome = function calcOutcome (returns, cashflows ){
    /**
     * Takes cashflows and returns and returns future cash levels
     * @param {Array} returns - returns over the period
     * @param {Array} cashflows - cashflows at the end of each month
     * @return {Array} - value of assets at each point during the period
     */
    if (returns.length +1 !== cashflows.length){
        throw new Error('Invalid input - cashflows must equal the length of returns')
    }
    const asset_levels = [Decimal(cashflows[0])];
    cashflows.reduce((acc, curr, idx) => {
        const earnings = Decimal('1').add(returns[idx -1]);
        const post_mkt_return = Decimal(acc).times(earnings);
        const next = Decimal.max( post_mkt_return.plus(curr), 0);
        asset_levels.push(next);
        return next;
    })
    return asset_levels;
}

const simRunner = function runSimulation(state){
    return new Promise((resolve)=>{
        const cashflows = flow(state.savings, state.years_to_ret, state.duration,
            state.contribution, state.ret_income, state.inflation);
        const iterations = parseInt(state.simRunsNum);
        const results = [];
        const asset_data = JSON.parse(window.localStorage.getItem('asset_data'));
        for (let i = 0; i < iterations; i += 1){
            const returns =  wReturnArr(asset_data, state.allocation, state.duration);
            results.push(outcome(returns, cashflows ));
        }
        resolve(results.sort((arr1, arr2)=>arr1[arr1.length -1] - arr2[arr2.length-1]))
    })
}

const survival = function calcSurvivalRate(scenarios){
    const zeros_count = scenarios.reduce((acc, curr)=>{
        const is_zero = parseInt(curr[curr.length-1]) === 0 ? 1 : 0;
        return acc + is_zero
    },0);
    const fail_rate = Decimal(zeros_count).div(scenarios.length /100);
    return Decimal(100).minus(fail_rate).toString();
}

const maxDrawdown = function calcMaxDrawdown(values){
  let MMD = Decimal(0);
  let peak = Decimal(-Infinity);
  for (let i = 0; i < values.length; i += 1){
    peak = values[i].greaterThan(peak) ? values[i] : peak;
    const step1 = peak.minus(values[i]);
    const step2 = step1.div(peak);
    const DD = step2.times(100);
    MMD = DD.greaterThan(MMD) ? DD : MMD;
  }
  return MMD.toDecimalPlaces(2).toString();
}

export {rand, wReturnArr, flow, outcome, simRunner, survival, maxDrawdown};