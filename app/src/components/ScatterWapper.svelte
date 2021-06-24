<script>
	import Scatter from "./charts/Scatter2.svelte"
	import ScatterStatic from "./charts/ScatterStatic.svelte"

    // import * as data_raw from "../../public/data_xavier.json"; // dose2_perc_total
	import * as data_raw from "../../public/dataScatter.json"; // dose2_perc_total

    import {max, min} from 'd3-array'
    import locale from "@reuters-graphics/d3-locale";

    const loc = new locale('en');
    const format = {
        x: loc.format(',.0f'),
		y: loc.format(',.0f'),
        z: loc.formatTime('%B %e')
	}
	/* --------------------  
	   DATA PREPROCESSING 
	-----------------------*/
	// first vaccination date: March 31
    // missing dates--> do we need impute them? 
    let DataLong = data_raw.default;
   
    let data_ = DataLong.map(d => {return{
		date: new Date(d.date),
        dateStr: loc.formatTime('%B %d')(new Date(d.date)),
		age_group: d.age_group,
        dateDiff: new Date(d.date) - new Date('2021-03-30'),
        dose2_pct: d.dose2_pct,
        cases_peak: d.cases_peak * 100, // needs func
		// fill nan with 0 for value0 
		// value0: (isNaN(d["dose2_pct_total"]))? 0 : Math.round(+d["dose2_pct_total"]) / 100,
		// value1: findValueByDate(d.fecha.split("T")[0])
	};})
    
    let data = data_.sort((a, b) => a.date - b.date)

    // .filter(d=>d.dose2_pct_70to79 !== undefined && !isNaN(d.dose2_pct_70to79))

    // console.log('checking~~~~~')
    // console.log(data)
    // console.log(data.sort((a, b) => a.date - b.date));
    
    // console.log(data.filter(d=>d.dose2_pct === undefined))
    // console.log(data.filter(d=>d.cases_peak === undefined))
    // console.log(data.filter(d=>isNaN(d.cases_peak)))
    // console.log(data.filter(d=>isNaN(d.dose2_pct)))


    let maxDate = max(data.map(d=>d.dateDiff))
    let minDate = min(data.map(d=>d.dateDiff))
    let maxDate2 = max(data.map(d=>d.date))
    let minDate2 = min(data.map(d=>d.date))
    console.log('min max ======')
    console.log(maxDate)
    console.log(minDate)
</script>

<p>70to79</p>
<Scatter 
    data={data.filter(d => d.age_group === "70to79")}
    key={{x: 'dose2_pct', y: 'cases_peak', z: 'dateDiff'}}
    {format}
    {maxDate}
    {minDate}
    layout='col'
/>

<div class='scatter-container'>
<p>above80</p>
<ScatterStatic 
    data={data.filter(d => d.age_group === "above80")}
    key={{x: 'dose2_pct', y: 'cases_peak', z: 'dateDiff'}}
    {format}
    {maxDate}
    {minDate}
    class='scatter-item'
/>

<p>60to69</p>
<ScatterStatic 
    data={data.filter(d => d.age_group === "60to69")}
    key={{x: 'dose2_pct', y: 'cases_peak', z: 'dateDiff'}}
    {format}
    {maxDate}
    {minDate}
    class='scatter-item'
/>

<p>50to59</p>
<ScatterStatic 
    data={data.filter(d => d.age_group === "50to59")}
    key={{x: 'dose2_pct', y: 'cases_peak', z: 'dateDiff'}}
    {format}
    {maxDate}
    {minDate}
    class='scatter-item'
/>
</div>

<style>
    .scatter-container{
        display: grid;
  grid-template-columns: auto auto;
  padding: 10px;

}

.scatter-item{
    width: 300px;

}

</style>