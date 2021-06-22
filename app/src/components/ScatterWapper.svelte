<script>
	import Scatter from "./charts/Scatter2.svelte"
	import * as data_raw from "../../public/data_xavier.json"; // dose2_perc_total
	import {max} from 'd3-array'
    import locale from "@reuters-graphics/d3-locale";

    const loc = new locale('en');
    const format = {
		// x: loc.formatTime('%B %e'),
        x: loc.format(',.0f'),
		y: loc.format(',.0f'),
        // dateText: loc.formatTime('%B %e'),

	}
	/* --------------------  
	   DATA PREPROCESSING 
	-----------------------*/
	// first vaccination date March 31
	// Totales is missing so use "Cataluña" as global value for now
    // TODO: Data range doesn't include 2020 yet
    let DataLongFull = data_raw.default.filter(d => d.ccaa === "Cataluña");
	let DataLong = data_raw.default.filter(d => new Date(d.fecha) > new Date("2021-03-30")).filter(d => d.ccaa === "Cataluña");

    console.log("Scatter wrapper ------------")
    console.log(DataLongFull)
    console.log(max(DataLongFull.map(d=>d.ra_cases_70to79)))

    let ra_case_peak_70to79 = max(DataLongFull.map(d=>d.ra_cases_70to79)) // needs ra func

    // take only needed data
    // filter out undefined or null dose2_pct_70to79; will need an rolling avg as well
    let data = DataLong.map(d => {return{
		date: new Date(d.fecha.split("T")[0]),
        dateStr: loc.formatTime('%B %d')(new Date(d.fecha)),
		ccaa: d.ccaa,
        dose2_pct_70to79: d.dose2_pct_70to79,
        ra_cases_70to79: d.ra_cases_70to79, // needs func
        ra_case_peak_pct_70to79: d.ra_cases_70to79 / ra_case_peak_70to79 * 100// needs ra func
		// fill nan with 0 for value0 
		// value0: (isNaN(d["dose2_pct_total"]))? 0 : Math.round(+d["dose2_pct_total"]) / 100,
		// value1: findValueByDate(d.fecha.split("T")[0])
	};}).filter(d=>d.dose2_pct_70to79 !== undefined && !isNaN(d.dose2_pct_70to79))

    // console.log('checking~~~~~')
    // console.log(data)
    console.log(data.filter(d=>d.dose2_pct_70to79 !== undefined))

    console.log('ScatterWrapper data-----')
    console.log(data)
 
	// let color = ['rgba(92,198,178, 1)', 'rgba(0,0,0, 1)']
    let color = '#59C28E';
</script>

<Scatter 
    data={data}
    key={{x: 'dose2_pct_70to79', y: 'ra_case_peak_pct_70to79'}}
    {format}
    {color}
    layout='col'
/>