import * as aq from 'arquero';
//import { group } from 'd3-array';
import locale from "@reuters-graphics/d3-locale";

const loc = new locale('en');

import * as vaccines from "../public/vaccines_data.json"
export function textvalues(){
    const data = vaccines.default
    // console.log('DATA -----',data)

/*     const today = loc.formatTime('%B %e, %Y')(new Date())
    const today_raw = (new Date(data.reverse()[0]['fecha']))
    var d = new Date(today_raw);
 */
    const today = loc.formatTime('%B %e, %Y')(new Date("10/01/2021"));
    const today_raw = (new Date(data.reverse()[0]['fecha']));
    var d = new Date(today_raw);
    
    const prev_month = loc.formatTime('%B')(d.setMonth(d.getMonth() - 1))
    const curr_month = loc.formatTime('%B')(today_raw)
    console.log(prev_month,curr_month)

    const national_data = data.filter(d => d.ccaa === 'Total España'|| d.ccaa === 'Totales')
    const total_population = national_data[0]['pop_total'] 
    console.log('POPULATION -----',total_population)
    
    // aq.from(national_data).print()

    const total_millions = loc.format(',.2f')(aq.from(national_data).orderby(aq.desc('fecha')).objects()[0]['administradas']/1000000) 
    const total_dose2 = aq.from(national_data).orderby(aq.desc('fecha')).objects()[0]['dose2']
    const total_dose1 = aq.from(national_data).orderby(aq.desc('fecha')).objects()[0]['dose1']
    console.log('DOSE1-dose2 -----', total_dose1, total_dose2)
    
    const vacc_over_pop_100_2dose = Math.round(total_dose2/total_population*100)
    const vacc_over_pop_100_1dose = Math.round(total_dose1/total_population*100)
    console.log(vacc_over_pop_100_2dose +' people out of 100 complete vaccination' )
    console.log(vacc_over_pop_100_1dose +' people out of 100 at least 1 dose' )
    
    const current_month_data = national_data.filter(d=>new Date(d.fecha).getMonth() === today_raw.getMonth()  )
    const previous_month_data = national_data.filter(d=>new Date(d.fecha).getMonth() === today_raw.getMonth()-1)
    console.log(current_month_data)
    console.log(previous_month_data)

    const daily_avg_current_month = aq.from(national_data)
        .orderby('fecha').select('fecha','administradas')
        .derive({diff:d => d.administradas - op.lag(d.administradas, 0, -1) } )
        .filter(aq.escape(d=>new Date(d.fecha).getMonth() === today_raw.getMonth()))
        .derive({daily_avg: d=> op.sum(d.diff)/op.date(op.now())})
        .select('daily_avg').groupby('daily_avg')
        .objects()[0].daily_avg        
  
    const daily_avg_previous_month = aq.from(national_data)
        .orderby('fecha').select('fecha','administradas')
        .derive({diff:d => d.administradas - op.lag(d.administradas, 0, -1) } )
        .filter(aq.escape(d=>new Date(d.fecha).getMonth() === today_raw.getMonth()-1))
        .derive({daily_avg: d=> op.sum(d.diff)/30})
        .select('daily_avg').groupby('daily_avg')
        .objects()[0].daily_avg        

    // const daily_avg_previous_month = aq.from(previous_month_data)
    //     .orderby('fecha').select('fecha','administradas')
    //     .derive({diff:d => d.administradas - op.lag(d.administradas, 0, -1) } )
    //     .slice(1,-1)
    //     .derive({daily_avg: d=> op.sum(d.diff)/30})
    //     .orderby(aq.desc('fecha'))
    //     .select('daily_avg').groupby('daily_avg')
    //     .objects()[0].daily_avg
    
    // const daily_avg_current_month = aq.from(current_month_data)
    //     .orderby('fecha').select('fecha','administradas')
    //     .derive({diff:d => d.administradas - op.lag(d.administradas, 0, -1) } )
    //     // .slice(1,-1)
    //     .derive({daily_avg: d=> op.sum(d.diff)/op.date(op.now())})
    //     .orderby(aq.desc('fecha'))
    //     .select('daily_avg').groupby('daily_avg')
    //     // .print()
    //     .objects()[0].daily_avg
    
        
    const daily_avg_increase = loc.format('%')(( daily_avg_current_month - daily_avg_previous_month ) / daily_avg_current_month *100)
        
    const daily_avg_curr_formatted = loc.format(',.0f')(daily_avg_current_month)
    const daily_avg_prev_formatted = loc.format(',.0f')(daily_avg_previous_month)
    const daily_avg_increase_formatted = loc.format(',.2f')(daily_avg_increase)
    
    const days_until_70pct =  (total_population *0.7-total_dose2) / daily_avg_current_month
    const days_until_100pct =  (total_population -total_dose2) / daily_avg_current_month
//    const end_date_70pct = loc.formatTime('%B %e, %Y')(new Date().setDate(today_raw.getDate()+days_until_70pct))
    const end_date_70pct = "September 4, 2021"; //Hack to doesn't do the estimation
    const end_date_100pct = loc.formatTime('%B %e, %Y')(new Date().setDate(today_raw.getDate()+days_until_100pct))
    console.log('days until 70%', days_until_70pct)
    console.log('date end 70%', end_date_70pct)
    console.log('days until 100%', days_until_100pct)
    console.log('date end 100%', end_date_100pct)

    console.log('daily avg previous month',daily_avg_previous_month)
    console.log('daily avg current month',daily_avg_current_month)
    console.log(daily_avg_increase > 0 ? '▲ '+daily_avg_increase+' increase': '▼ '+daily_avg_increase+' decrease')
    
    let text = {
        today, 
        prev_month,
        curr_month,
        vacc_over_pop_100_2dose,
        vacc_over_pop_100_1dose,
        total_millions,
        daily_avg_curr_formatted,
        daily_avg_prev_formatted,
        daily_avg_increase_formatted,
        days_until_70pct,
        days_until_100pct,
        end_date_70pct,
        end_date_100pct,
    }
    console.log('CURRENT DATE -----',text.today)
    return text   
}

// Rolling average calculation-> https://observablehq.com/@uwdata/working-with-window-queries?collection=@uwdata/arquerohttps://observablehq.com/@uwdata/working-with-window-queries?collection=@uwdata/arquero
export function multiline_data(_data){
    let dataCases = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .select(['ccaa','fecha',aq.matches('cases')])
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha')
        .pivot('key',{value:d => op.sum(d.value) })
    
    
        ///// ROLLING-AVG /////
        .derive({cases_50to59 : aq.rolling(d=> op.average(d.cases_50to59), [-3,3])})
        .derive({cases_60to69 : aq.rolling(d=> op.average(d.cases_60to69), [-3,3])})
        .derive({cases_70to79 : aq.rolling(d=> op.average(d.cases_70to79), [-3,3])})
        .derive({cases_above80 : aq.rolling(d=> op.average(d.cases_above80), [-3,3])})
        .derive({cases_under50 : aq.rolling(d=> op.average(d.cases_under50), [-3,3])})
        ///// RELATIVE VALUE V. MAX PEAK /////
        .derive({peak_cases_50to59 : d=> (d.cases_50to59/op.max(d.cases_50to59))})
        .derive({peak_cases_60to69 : d=> (d.cases_60to69/op.max(d.cases_60to69))})
        .derive({peak_cases_70to79 : d=> (d.cases_70to79/op.max(d.cases_70to79))})
        .derive({peak_cases_above80 : d=> (d.cases_above80/op.max(d.cases_above80))})
        .derive({peak_cases_under50 : d=> (d.cases_under50/op.max(d.cases_under50))})
        .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        .orderby('fecha')
        .objects()

    let dataDeaths = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .select(['ccaa','fecha', aq.matches('deat')])
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha')
        .pivot('key',{value:d => op.sum(d.value) })
        
    
        ///// ROLLING-AVG /////
        .derive({deaths_50to59 : aq.rolling(d=> op.average(d.deaths_50to59), [-3,3])})
        .derive({deaths_60to69 : aq.rolling(d=> op.average(d.deaths_60to69), [-3,3])})
        .derive({deaths_70to79 : aq.rolling(d=> op.average(d.deaths_70to79), [-3,3])})
        .derive({deaths_above80 : aq.rolling(d=> op.average(d.deaths_above80), [-3,3])})
        .derive({deaths_under50 : aq.rolling(d=> op.average(d.deaths_under50), [-3,3])})

        ///// RELATIVE VALUE V. MAX PEAK /////
        .derive({peak_deaths_50to59 : d=> (d.deaths_50to59/op.max(d.deaths_50to59))})
        .derive({peak_deaths_60to69 : d=> (d.deaths_60to69/op.max(d.deaths_60to69))})
        .derive({peak_deaths_70to79 : d=> (d.deaths_70to79/op.max(d.deaths_70to79))})
        .derive({peak_deaths_above80 : d=> (d.deaths_above80/op.max(d.deaths_above80))})
        .derive({peak_deaths_under50 : d=> (d.deaths_under50/op.max(d.deaths_under50))})
        .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        .orderby('fecha')
        .objects()
        
    let dataHosp = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .select(['ccaa','fecha', aq.matches('hosp')])
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha')
        .pivot('key',{value:d => op.sum(d.value) })
        
    
        ///// ROLLING-AVG /////
        .derive({hosp_50to59 : aq.rolling(d=> op.average(d.hosp_50to59), [-3,3])})
        .derive({hosp_60to69 : aq.rolling(d=> op.average(d.hosp_60to69), [-3,3])})
        .derive({hosp_70to79 : aq.rolling(d=> op.average(d.hosp_70to79), [-3,3])})
        .derive({hosp_above80 : aq.rolling(d=> op.average(d.hosp_above80), [-3,3])})
        .derive({hosp_under50 : aq.rolling(d=> op.average(d.hosp_under50), [-3,3])})

        ///// RELATIVE VALUE V. MAX PEAK /////
        .derive({peak_hosp_50to59 : d=> (d.hosp_50to59/op.max(d.hosp_50to59))})
        .derive({peak_hosp_60to69 : d=> (d.hosp_60to69/op.max(d.hosp_60to69))})
        .derive({peak_hosp_70to79 : d=> (d.hosp_70to79/op.max(d.hosp_70to79))})
        .derive({peak_hosp_above80 : d=> (d.hosp_above80/op.max(d.hosp_above80))})
        .derive({peak_hosp_under50 : d=> (d.hosp_under50/op.max(d.hosp_under50))})
        .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        .orderby('fecha')
        .objects()
    
    let dataICU = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .select(['ccaa','fecha',aq.matches('uci')])
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha')
        .pivot('key',{value:d => op.sum(d.value) })
        
    
        ///// ROLLING-AVG /////
        .derive({uci_50to59 : aq.rolling(d=> op.average(d.uci_50to59), [-3,3])})
        .derive({uci_60to69 : aq.rolling(d=> op.average(d.uci_60to69), [-3,3])})
        .derive({uci_70to79 : aq.rolling(d=> op.average(d.uci_70to79), [-3,3])})
        .derive({uci_above80 : aq.rolling(d=> op.average(d.uci_above80), [-3,3])})
        .derive({uci_under50 : aq.rolling(d=> op.average(d.uci_under50), [-3,3])})

        ///// RELATIVE VALUE V. MAX PEAK /////
        .derive({peak_uci_50to59 : d=> (d.uci_50to59/op.max(d.uci_50to59))})
        .derive({peak_uci_60to69 : d=> (d.uci_60to69/op.max(d.uci_60to69))})
        .derive({peak_uci_70to79 : d=> (d.uci_70to79/op.max(d.uci_70to79))})
        .derive({peak_uci_above80 : d=> (d.uci_above80/op.max(d.uci_above80))})
        .derive({peak_uci_under50 : d=> (d.uci_under50/op.max(d.uci_under50))})
        .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        .orderby('fecha')
        .objects()
        // .print({offset:200})
    // console.log(data)
    return ({
        Cases: dataCases,
        Deaths: dataDeaths,
        Hospitalized: dataHosp,
        ICU: dataICU
    })
}

// Rolling average calculation-> https://observablehq.com/@uwdata/working-with-window-queries?collection=@uwdata/arquerohttps://observablehq.com/@uwdata/working-with-window-queries?collection=@uwdata/arquero
export function multiline_data_old(_data){
    let data = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .select(['ccaa','fecha',aq.matches('cases'), aq.matches('deat'), aq.matches('hosp'),aq.matches('uci')])
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha')
        .pivot('key',{value:d => op.sum(d.value) })
        
    
        ///// ROLLING-AVG /////
        .derive({cases_50to59 : aq.rolling(d=> op.average(d.cases_50to59), [-3,3])})
        .derive({cases_60to69 : aq.rolling(d=> op.average(d.cases_60to69), [-3,3])})
        .derive({cases_70to79 : aq.rolling(d=> op.average(d.cases_70to79), [-3,3])})
        .derive({cases_above80 : aq.rolling(d=> op.average(d.cases_above80), [-3,3])})
        .derive({cases_under50 : aq.rolling(d=> op.average(d.cases_under50), [-3,3])})
        .derive({deaths_50to59 : aq.rolling(d=> op.average(d.deaths_50to59), [-3,3])})
        .derive({deaths_60to69 : aq.rolling(d=> op.average(d.deaths_60to69), [-3,3])})
        .derive({deaths_70to79 : aq.rolling(d=> op.average(d.deaths_70to79), [-3,3])})
        .derive({deaths_above80 : aq.rolling(d=> op.average(d.deaths_above80), [-3,3])})
        .derive({deaths_under50 : aq.rolling(d=> op.average(d.deaths_under50), [-3,3])})
        .derive({hosp_50to59 : aq.rolling(d=> op.average(d.hosp_50to59), [-3,3])})
        .derive({hosp_60to69 : aq.rolling(d=> op.average(d.hosp_60to69), [-3,3])})
        .derive({hosp_70to79 : aq.rolling(d=> op.average(d.hosp_70to79), [-3,3])})
        .derive({hosp_above80 : aq.rolling(d=> op.average(d.hosp_above80), [-3,3])})
        .derive({hosp_under50 : aq.rolling(d=> op.average(d.hosp_under50), [-3,3])})
        .derive({uci_50to59 : aq.rolling(d=> op.average(d.uci_50to59), [-3,3])})
        .derive({uci_60to69 : aq.rolling(d=> op.average(d.uci_60to69), [-3,3])})
        .derive({uci_70to79 : aq.rolling(d=> op.average(d.uci_70to79), [-3,3])})
        .derive({uci_above80 : aq.rolling(d=> op.average(d.uci_above80), [-3,3])})
        .derive({uci_under50 : aq.rolling(d=> op.average(d.uci_under50), [-3,3])})

        ///// RELATIVE VALUE V. MAX PEAK /////
        .derive({peak_cases_50to59 : d=> (d.cases_50to59/op.max(d.cases_50to59))})
        .derive({peak_cases_60to69 : d=> (d.cases_60to69/op.max(d.cases_60to69))})
        .derive({peak_cases_70to79 : d=> (d.cases_70to79/op.max(d.cases_70to79))})
        .derive({peak_cases_above80 : d=> (d.cases_above80/op.max(d.cases_above80))})
        .derive({peak_cases_under50 : d=> (d.cases_under50/op.max(d.cases_under50))})
        .derive({peak_deaths_50to59 : d=> (d.deaths_50to59/op.max(d.deaths_50to59))})
        .derive({peak_deaths_60to69 : d=> (d.deaths_60to69/op.max(d.deaths_60to69))})
        .derive({peak_deaths_70to79 : d=> (d.deaths_70to79/op.max(d.deaths_70to79))})
        .derive({peak_deaths_above80 : d=> (d.deaths_above80/op.max(d.deaths_above80))})
        .derive({peak_deaths_under50 : d=> (d.deaths_under50/op.max(d.deaths_under50))})
        .derive({peak_hosp_50to59 : d=> (d.hosp_50to59/op.max(d.hosp_50to59))})
        .derive({peak_hosp_60to69 : d=> (d.hosp_60to69/op.max(d.hosp_60to69))})
        .derive({peak_hosp_70to79 : d=> (d.hosp_70to79/op.max(d.hosp_70to79))})
        .derive({peak_hosp_above80 : d=> (d.hosp_above80/op.max(d.hosp_above80))})
        .derive({peak_hosp_under50 : d=> (d.hosp_under50/op.max(d.hosp_under50))})
        .derive({peak_uci_50to59 : d=> (d.uci_50to59/op.max(d.uci_50to59))})
        .derive({peak_uci_60to69 : d=> (d.uci_60to69/op.max(d.uci_60to69))})
        .derive({peak_uci_70to79 : d=> (d.uci_70to79/op.max(d.uci_70to79))})
        .derive({peak_uci_above80 : d=> (d.uci_above80/op.max(d.uci_above80))})
        .derive({peak_uci_under50 : d=> (d.uci_under50/op.max(d.uci_under50))})
        .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        .orderby('fecha')
        .objects()
        // .print({offset:200})
    // console.log(data)
    return data
}

/* export function rolling_peak_national(_data){
    let data = aq.from(_data.reverse())
        ///// NATIONAL VALUES /////
        .fold(aq.not('fecha','ccaa'))
        .groupby('fecha','key')
        .pivot('ccaa','value')
        // .rollup({   
        //     cases_50to59 : d=> aq.op.sum(d.cases_50to59),
        //     cases_60to69 : d=> op.sum(d.cases_60to69),
        //     cases_70to79 : d=> op.sum(d.cases_70to79),
        //     cases_above80 : d=> op.sum(d.cases_above80),
        //     cases_under50 : d=> op.sum(d.cases_under50),
        //     deaths_under50 : d=> op.sum(d.deaths_under50),
        //     deaths_50to59 : d=> op.sum(d.deaths_50to59),
        //     deaths_60to69 : d=> op.sum(d.deaths_60to69),
        //     deaths_70to79 : d=> op.sum(d.deaths_70to79),
        //     deaths_above80 : d=> op.sum(d.deaths_above80),
        //     hosp_under50 : d=> op.sum(d.hosp_under50),
        //     hosp_50to59 : d=> op.sum(d.hosp_50to59),
        //     hosp_60to69 : d=> op.sum(d.hosp_60to69),
        //     hosp_70to79 : d=> op.sum(d.hosp_70to79),
        //     hosp_above80 : d=> op.sum(d.hosp_above80),
        //     uci_under50 : d=> op.sum(d.uci_under50),
        //     uci_50to59 : d=> op.sum(d.uci_50to59),
        //     uci_60to69 : d=> op.sum(d.uci_60to69),
        //     uci_70to79 : d=> op.sum(d.uci_70to79),
        //     uci_above80 : d=> op.sum(d.uci_above80),
        //     pfizer : d=> op.sum(d.pfizer),
        //     moderna : d=> op.sum(d.moderna),
        //     astrazeneca : d=> op.sum(d.astrazeneca),
        //     janssen : d=> op.sum(d.janssen),
        //     entregadas : d=> op.sum(d.entregadas),
        //     administradas : d=> op.sum(d.administradas),
        //     admin_entregadas : d=> op.sum(d.admin_entregadas),
        //     dose1 : d=> op.sum(d.dose1),
        //     dose2 : d=> op.sum(d.dose2),
        //     hasta : d=> op.sum(d.hasta),
        //     dose1_above80 : d=> op.sum(d.dose1_above80),
        //     // dose1_pct_above80 : d=> (op.sum(d.dose1_pct_above80)/d.pop_above80*100),
        //     dose1_70to79 : d=> op.sum(d.dose1_70to79),
        //     // dose1_pct_70to79 : d=> (op.sum(d.dose1_pct_70to79)/d.pop_70to79*100),
        //     dose1_60to69 : d=> op.sum(d.dose1_60to69),
        //     // dose1_pct_60to69 : d=> (op.sum(d.dose1_pct_60to69)/d.pop_60to69*100),
        //     dose1_50to59 : d=> op.sum(d.dose1_50to59),
        //     // dose1_pct_50to59 : d=> (op.sum(d.dose1_pct_50to59)/d.pop_50to59*100),
        //     dose1_40to49 : d=> op.sum(d.dose1_40to49),
        //     // dose1_pct_40to49 : d=> (op.sum(d.dose1_pct_40to49)/d.pop_40to49*100),
        //     dose1_25 : d=> op.sum(d.dose1_25),
        //     perc_25 : d=> op.sum(d.perc_25),
        //     dose1_18 : d=> op.sum(d.dose1_18),
        //     perc_18 : d=> op.sum(d.perc_18),
        //     dose1_16 : d=> op.sum(d.dose1_16),
        //     perc_16 : d=> op.sum(d.perc_16),
        //     dose1_total : d=> op.sum(d.dose1_total),
        //     pop_total : d=> op.sum(d.pop_total),
        //     // dose1_pct_total : d=> (op.sum(d.dose1_pct_total)/d.pop_total*100),
        //     dose1_under50 : d=> op.sum(d.dose1_under50),
        //     // dose1_pct_under50 : d=> (op.sum(d.dose1_pct_under50)/d.pop_under50*100),
        //     dose2_above80 : d=> op.sum(d.dose2_above80),
        //     // dose2_pct_above80 : d=> (op.sum(d.dose2_pct_above80)/d.pop_above80*100),
        //     dose2_70to79 : d=> op.sum(d.dose2_70to79),
        //     // dose2_pct_70to79 : d=> (op.sum(d.dose2_pct_70to79)/d.pop_70to79*100),
        //     dose2_60to69 : d=> op.sum(d.dose2_60to69),
        //     // dose2_pct_60to69 : d=> (op.sum(d.dose2_pct_60to69)/d.pop_60to69*100),
        //     dose2_50to59 : d=> op.sum(d.dose2_50to59),
        //     // dose2_pct_50to59 : d=> (op.sum(d.dose2_pct_50to59)/d.pop_50to59*100),
        //     dose2_40to49 : d=> op.sum(d.dose2_40to49),
        //     // dose2_pct_40to49 : d=> (op.sum(d.dose2_pct_40to49)/d.pop_40to49*100),
        //     dose2_25 : d=> op.sum(d.dose2_25),
        //     dose2_18 : d=> op.sum(d.dose2_18),
        //     dose2_16 : d=> op.sum(d.dose2_16),
        //     dose2_total : d=> op.sum(d.dose2_total),
        //     // dose2_pct_total : d=> (op.sum(d.dose2_pct_total)/d.pop_total*100),
        //     dose2_under50 : d=> op.sum(d.dose2_under50),
        //     // dose2_pct_under50 : d=> (op.sum(d.dose2_pct_under50)/d.pop_under50*100),
        //     pop_under50 : d=> op.sum(d.pop_under50) ,
        //     })
        
        //      ///// ROLLING-AVG /////
        //     .derive({cases_50to59 : aq.rolling(d=> aq.op.average(d.cases_50to59), [-3,3])})    
        //     .derive({cases_60to69 : aq.rolling(d=> op.average(d.cases_60to69), [-3,3])})
        //     .derive({cases_70to79 : aq.rolling(d=> op.average(d.cases_70to79), [-3,3])})
        //     .derive({cases_above80 : aq.rolling(d=> op.average(d.cases_above80), [-3,3])})
        //     .derive({cases_under50 : aq.rolling(d=> op.average(d.cases_under50), [-3,3])})
        //     .derive({deaths_under50 : aq.rolling(d=> op.average(d.deaths_under50), [-3,3])})
        //     .derive({deaths_50to59 : aq.rolling(d=> op.average(d.deaths_50to59), [-3,3])})
        //     .derive({deaths_60to69 : aq.rolling(d=> op.average(d.deaths_60to69), [-3,3])})
        //     .derive({deaths_70to79 : aq.rolling(d=> op.average(d.deaths_70to79), [-3,3])})
        //     .derive({deaths_above80 : aq.rolling(d=> op.average(d.deaths_above80), [-3,3])})
        //     .derive({hosp_under50 : aq.rolling(d=> op.average(d.hosp_under50), [-3,3])})
        //     .derive({hosp_50to59 : aq.rolling(d=> op.average(d.hosp_50to59), [-3,3])})
        //     .derive({hosp_60to69 : aq.rolling(d=> op.average(d.hosp_60to69), [-3,3])})
        //     .derive({hosp_70to79 : aq.rolling(d=> op.average(d.hosp_70to79), [-3,3])})
        //     .derive({hosp_above80 : aq.rolling(d=> op.average(d.hosp_above80), [-3,3])})
        //     .derive({uci_under50 : aq.rolling(d=> op.average(d.uci_under50), [-3,3])})
        //     .derive({uci_50to59 : aq.rolling(d=> op.average(d.uci_50to59), [-3,3])})
        //     .derive({uci_60to69 : aq.rolling(d=> op.average(d.uci_60to69), [-3,3])})
        //     .derive({uci_70to79 : aq.rolling(d=> op.average(d.uci_70to79), [-3,3])})
        //     .derive({uci_above80 : aq.rolling(d=> op.average(d.uci_above80), [-3,3])})
        //     .derive({pfizer : aq.rolling(d=> op.average(d.pfizer), [-3,3])})
        //     .derive({moderna : aq.rolling(d=> op.average(d.moderna), [-3,3])})
        //     .derive({astrazeneca : aq.rolling(d=> op.average(d.astrazeneca), [-3,3])})
        //     .derive({janssen : aq.rolling(d=> op.average(d.janssen), [-3,3])})
        //     .derive({entregadas : aq.rolling(d=> op.average(d.entregadas), [-3,3])})
        //     .derive({administradas : aq.rolling(d=> op.average(d.administradas), [-3,3])})
        //     .derive({admin_entregadas : aq.rolling(d=> op.average(d.admin_entregadas), [-3,3])})
        //     .derive({dose1 : aq.rolling(d=> op.average(d.dose1), [-3,3])})
        //     .derive({dose2 : aq.rolling(d=> op.average(d.dose2), [-3,3])})
        //     .derive({hasta : aq.rolling(d=> op.average(d.hasta), [-3,3])})
        //     .derive({dose1_above80 : aq.rolling(d=> op.average(d.dose1_above80), [-3,3])})
        //     .derive({dose1_pct_above80 : aq.rolling(d=> op.average(d.dose1_pct_above80), [-3,3])})
        //     .derive({dose1_70to79 : aq.rolling(d=> op.average(d.dose1_70to79), [-3,3])})
        //     .derive({dose1_pct_70to79 : aq.rolling(d=> op.average(d.dose1_pct_70to79), [-3,3])})
        //     .derive({dose1_60to69 : aq.rolling(d=> op.average(d.dose1_60to69), [-3,3])})
        //     .derive({dose1_pct_60to69 : aq.rolling(d=> op.average(d.dose1_pct_60to69), [-3,3])})
        //     .derive({dose1_50to59 : aq.rolling(d=> op.average(d.dose1_50to59), [-3,3])})
        //     .derive({dose1_pct_50to59 : aq.rolling(d=> op.average(d.dose1_pct_50to59), [-3,3])})
        //     .derive({dose1_40to49 : aq.rolling(d=> op.average(d.dose1_40to49), [-3,3])})
        //     .derive({dose1_pct_40to49 : aq.rolling(d=> op.average(d.dose1_pct_40to49), [-3,3])})
        //     .derive({dose1_25 : aq.rolling(d=> op.average(d.dose1_25), [-3,3])})
        //     .derive({perc_25 : aq.rolling(d=> op.average(d.perc_25), [-3,3])})
        //     .derive({dose1_18 : aq.rolling(d=> op.average(d.dose1_18), [-3,3])})
        //     .derive({perc_18 : aq.rolling(d=> op.average(d.perc_18), [-3,3])})
        //     .derive({dose1_16 : aq.rolling(d=> op.average(d.dose1_16), [-3,3])})
        //     .derive({perc_16 : aq.rolling(d=> op.average(d.perc_16), [-3,3])})
        //     .derive({dose1_total : aq.rolling(d=> op.average(d.dose1_total), [-3,3])})
        //     .derive({pop_total : aq.rolling(d=> op.average(d.pop_total), [-3,3])})
        //     .derive({dose1_pct_total : aq.rolling(d=> op.average(d.dose1_pct_total), [-3,3])})
        //     .derive({dose1_under50 : aq.rolling(d=> op.average(d.dose1_under50), [-3,3])})
        //     .derive({dose1_pct_under50 : aq.rolling(d=> op.average(d.dose1_pct_under50), [-3,3])})
        //     .derive({dose2_above80 : aq.rolling(d=> op.average(d.dose2_above80), [-3,3])})
        //     .derive({dose2_pct_above80 : aq.rolling(d=> op.average(d.dose2_pct_above80), [-3,3])})
        //     .derive({dose2_70to79 : aq.rolling(d=> op.average(d.dose2_70to79), [-3,3])})
        //     .derive({dose2_pct_70to79 : aq.rolling(d=> op.average(d.dose2_pct_70to79), [-3,3])})
        //     .derive({dose2_60to69 : aq.rolling(d=> op.average(d.dose2_60to69), [-3,3])})
        //     .derive({dose2_pct_60to69 : aq.rolling(d=> op.average(d.dose2_pct_60to69), [-3,3])})
        //     .derive({dose2_50to59 : aq.rolling(d=> op.average(d.dose2_50to59), [-3,3])})
        //     .derive({dose2_pct_50to59 : aq.rolling(d=> op.average(d.dose2_pct_50to59), [-3,3])})
        //     .derive({dose2_40to49 : aq.rolling(d=> op.average(d.dose2_40to49), [-3,3])})
        //     .derive({dose2_pct_40to49 : aq.rolling(d=> op.average(d.dose2_pct_40to49), [-3,3])})
        //     .derive({dose2_25 : aq.rolling(d=> op.average(d.dose2_25), [-3,3])})
        //     .derive({dose2_18 : aq.rolling(d=> op.average(d.dose2_18), [-3,3])})
        //     .derive({dose2_16 : aq.rolling(d=> op.average(d.dose2_16), [-3,3])})
        //     .derive({dose2_total : aq.rolling(d=> op.average(d.dose2_total), [-3,3])})
        //     .derive({dose2_pct_total : aq.rolling(d=> op.average(d.dose2_pct_total), [-3,3])})
        //     .derive({dose2_under50 : aq.rolling(d=> op.average(d.dose2_under50), [-3,3])})
        //     .derive({dose2_pct_under50 : aq.rolling(d=> op.average(d.dose2_pct_under50), [-3,3])})
        //     .derive({pop_under50 : aq.rolling(d=> op.average(d.pop_under50), [-3,3])})
        //     .derive({cases_50to59 : aq.rolling(d=> op.average(d.cases_50to59), [-3,3])})

        //      ///// RELATIVE VALUE V. MAX PEAK /////
        //     .derive({peak_cases_50to59 : d=> (d.cases_50to59/aq.op.max(d.cases_50to59))})
        //     .derive({peak_cases_60to69 : d=> (d.cases_60to69/op.max(d.cases_60to69))})
        //     .derive({peak_cases_70to79 : d=> (d.cases_70to79/op.max(d.cases_70to79))})
        //     .derive({peak_cases_above80 : d=> (d.cases_above80/op.max(d.cases_above80))})
        //     .derive({peak_cases_under50 : d=> (d.cases_under50/op.max(d.cases_under50))})
        //     .derive({peak_deaths_under50 : d=> (d.deaths_under50/op.max(d.deaths_under50))})
        //     .derive({peak_deaths_50to59 : d=> (d.deaths_50to59/op.max(d.deaths_50to59))})
        //     .derive({peak_deaths_60to69 : d=> (d.deaths_60to69/op.max(d.deaths_60to69))})
        //     .derive({peak_deaths_70to79 : d=> (d.deaths_70to79/op.max(d.deaths_70to79))})
        //     .derive({peak_deaths_above80 : d=> (d.deaths_above80/op.max(d.deaths_above80))})
        //     .derive({peak_hosp_under50 : d=> (d.hosp_under50/op.max(d.hosp_under50))})
        //     .derive({peak_hosp_50to59 : d=> (d.hosp_50to59/op.max(d.hosp_50to59))})
        //     .derive({peak_hosp_60to69 : d=> (d.hosp_60to69/op.max(d.hosp_60to69))})
        //     .derive({peak_hosp_70to79 : d=> (d.hosp_70to79/op.max(d.hosp_70to79))})
        //     .derive({peak_hosp_above80 : d=> (d.hosp_above80/op.max(d.hosp_above80))})
        //     .derive({peak_uci_under50 : d=> (d.uci_under50/op.max(d.uci_under50))})
        //     .derive({peak_uci_50to59 : d=> (d.uci_50to59/op.max(d.uci_50to59))})
        //     .derive({peak_uci_60to69 : d=> (d.uci_60to69/op.max(d.uci_60to69))})
        //     .derive({peak_uci_70to79 : d=> (d.uci_70to79/op.max(d.uci_70to79))})
        //     .derive({peak_uci_above80 : d=> (d.uci_above80/op.max(d.uci_above80))})
        //     .derive({peak_pfizer : d=> (d.pfizer/op.max(d.pfizer))})
        //     .derive({peak_moderna : d=> (d.moderna/op.max(d.moderna))})
        //     .derive({peak_astrazeneca : d=> (d.astrazeneca/op.max(d.astrazeneca))})
        //     .derive({peak_janssen : d=> (d.janssen/op.max(d.janssen))})
        //     .derive({peak_entregadas : d=> (d.entregadas/op.max(d.entregadas))})
        //     .derive({peak_administradas : d=> (d.administradas/op.max(d.administradas))})
        //     .derive({peak_admin_entregadas : d=> (d.admin_entregadas/op.max(d.admin_entregadas))})
        //     .derive({peak_dose1 : d=> (d.dose1/op.max(d.dose1))})
        //     .derive({peak_dose2 : d=> (d.dose2/op.max(d.dose2))})
        //     .derive({peak_hasta : d=> (d.hasta/op.max(d.hasta))})
        //     .derive({peak_dose1_above80 : d=> (d.dose1_above80/op.max(d.dose1_above80))})
        //     .derive({peak_dose1_pct_above80 : d=> (d.dose1_pct_above80/op.max(d.dose1_pct_above80))})
        //     .derive({peak_dose1_70to79 : d=> (d.dose1_70to79/op.max(d.dose1_70to79))})
        //     .derive({peak_dose1_pct_70to79 : d=> (d.dose1_pct_70to79/op.max(d.dose1_pct_70to79))})
        //     .derive({peak_dose1_60to69 : d=> (d.dose1_60to69/op.max(d.dose1_60to69))})
        //     .derive({peak_dose1_pct_60to69 : d=> (d.dose1_pct_60to69/op.max(d.dose1_pct_60to69))})
        //     .derive({peak_dose1_50to59 : d=> (d.dose1_50to59/op.max(d.dose1_50to59))})
        //     .derive({peak_dose1_pct_50to59 : d=> (d.dose1_pct_50to59/op.max(d.dose1_pct_50to59))})
        //     .derive({peak_dose1_40to49 : d=> (d.dose1_40to49/op.max(d.dose1_40to49))})
        //     .derive({peak_dose1_pct_40to49 : d=> (d.dose1_pct_40to49/op.max(d.dose1_pct_40to49))})
        //     .derive({peak_dose1_25 : d=> (d.dose1_25/op.max(d.dose1_25))})
        //     .derive({peak_perc_25 : d=> (d.perc_25/op.max(d.perc_25))})
        //     .derive({peak_dose1_18 : d=> (d.dose1_18/op.max(d.dose1_18))})
        //     .derive({peak_perc_18 : d=> (d.perc_18/op.max(d.perc_18))})
        //     .derive({peak_dose1_16 : d=> (d.dose1_16/op.max(d.dose1_16))})
        //     .derive({peak_perc_16 : d=> (d.perc_16/op.max(d.perc_16))})
        //     .derive({peak_dose1_total : d=> (d.dose1_total/op.max(d.dose1_total))})
        //     .derive({peak_pop_total : d=> (d.pop_total/op.max(d.pop_total))})
        //     .derive({peak_dose1_pct_total : d=> (d.dose1_pct_total/op.max(d.dose1_pct_total))})
        //     .derive({peak_dose1_under50 : d=> (d.dose1_under50/op.max(d.dose1_under50))})
        //     .derive({peak_dose1_pct_under50 : d=> (d.dose1_pct_under50/op.max(d.dose1_pct_under50))})
        //     .derive({peak_dose2_above80 : d=> (d.dose2_above80/op.max(d.dose2_above80))})
        //     .derive({peak_dose2_pct_above80 : d=> (d.dose2_pct_above80/op.max(d.dose2_pct_above80))})
        //     .derive({peak_dose2_70to79 : d=> (d.dose2_70to79/op.max(d.dose2_70to79))})
        //     .derive({peak_dose2_pct_70to79 : d=> (d.dose2_pct_70to79/op.max(d.dose2_pct_70to79))})
        //     .derive({peak_dose2_60to69 : d=> (d.dose2_60to69/op.max(d.dose2_60to69))})
        //     .derive({peak_dose2_pct_60to69 : d=> (d.dose2_pct_60to69/op.max(d.dose2_pct_60to69))})
        //     .derive({peak_dose2_50to59 : d=> (d.dose2_50to59/op.max(d.dose2_50to59))})
        //     .derive({peak_dose2_pct_50to59 : d=> (d.dose2_pct_50to59/op.max(d.dose2_pct_50to59))})
        //     .derive({peak_dose2_40to49 : d=> (d.dose2_40to49/op.max(d.dose2_40to49))})
        //     .derive({peak_dose2_pct_40to49 : d=> (d.dose2_pct_40to49/op.max(d.dose2_pct_40to49))})
        //     .derive({peak_dose2_25 : d=> (d.dose2_25/op.max(d.dose2_25))})
        //     .derive({peak_dose2_18 : d=> (d.dose2_18/op.max(d.dose2_18))})
        //     .derive({peak_dose2_16 : d=> (d.dose2_16/op.max(d.dose2_16))})
        //     .derive({peak_dose2_total : d=> (d.dose2_total/op.max(d.dose2_total))})
        //     .derive({peak_dose2_pct_total : d=> (d.dose2_pct_total/op.max(d.dose2_pct_total))})
        //     .derive({peak_dose2_under50 : d=> (d.dose2_under50/op.max(d.dose2_under50))})
        //     .derive({peak_dose2_pct_under50 : d=> (d.dose2_pct_under50/op.max(d.dose2_pct_under50))})
        //     .derive({peak_pop_under50 : d=> (d.pop_under50/op.max(d.pop_under50))})
        //     .derive({peak_cases_50to59 : d=> (d.cases_50to59/op.max(d.cases_50to59))})
        .print()
        // .select(['fecha',aq.matches('peak_')])
        // .select(['fecha',aq.matches('ra_')])
        // .fold(aq.not('fecha',aq.matches('ra_')))
        // .orderby('fecha')
        // .objects()
        // .print({offset:200})
        // console.log(data)
         return data
    }

////////////////////////////////////////////////////////////
/*  Trying to programatically pass values to arquero */
// let dummy = [{ccaa: 23123, cases:"Catalunya"},
//             {ccaa:2123, cases:"Madrid"}]

// function rollup_aq(_data){
//     let rollup_aq ={} 
//     let list = new Object(dummy).map((item, i)=> {
//         rollup_aq[`${Object.keys(item)[i]}`] = `d=> op.sum(d.${Object.keys(item)[i]})`
//         return  {...rollup_aq}
// })
// }

// export function test_aq(_data){
//     let data =  aq.from(_data.reverse())
//     .groupby('fecha')
//     .rollup(rollup_aq(_data))
//     .select(aq.all())
//     .print()
//     console.log(_data)
//     return data
// }





 







// export function multiline_data(_data){
//     let data = aq.from(_data.reverse())
//         .select(['ccaa','fecha',aq.matches('cases'), aq.matches('deat'), aq.matches('hosp'),aq.matches('uci')])
//         .fold(aq.not('fecha','ccaa'))
//         // .derive({value: aq.rolling(d=> op.average(d.value))})
//         .groupby('fecha')
//         .pivot('key',{value:d => op.sum(d.value) })
//         .orderby(aq.desc('fecha'))
//         .objects()
//         // .print({offset:100})
//     // console.log(data)
//     return data}




// export function nationalValues(_data){
//     /* compute ABSOLUTE values */
//     let data_sum = aq.from(_data.reverse())
//         .select(aq.not(aq.startswith('admin_'), aq.matches('pct')))
//         .fold(aq.not(['ccaa','fecha']))
//         // .reify()
//         // .derive({value: aq.rolling(d=> op.average(d.value))})
//         .groupby('fecha')
//         .pivot( 'key' ,{values: d=> op.sum(d.value)})
//         .print()

//     /* compute relative values */
//     let data_pct = aq.from(_data.reverse())
//         .select(['ccaa','fecha',aq.startswith('admin_'), aq.matches('pct')])
//         .fold(aq.not(['ccaa','fecha']))
//         // // .reify()
//         // // .derive({value: aq.rolling(d=> op.average(d.value))})
//         .groupby('fecha','ccaa')
//         .pivot( 'key' ,{values: d=> op.average(d.value)})
//         // // .columnNames()
//         // // .objects()
//         // // console.log(data_sum)
//         .orderby(aq.desc('fecha'))
//         .print()    

//     let data = data_pct.join(data_sum)
//         // console.log(data)
//     return data
// }

// export function allAges(_data){
//     let data = aq.from(_data.reverse())
        
//         .fold(aq.not(['ccaa','fecha']))
//         .derive({value: aq.rolling(d=> op.average(aq.not(aq.startswith('admin_'),aq.matches('pct')).value))})
//         // .reify()
//         .groupby('fecha','ccaa')
//         .pivot('key','value')
//         .objects()
//         // .print()
//     // console.log(data)
//     return data
// }

