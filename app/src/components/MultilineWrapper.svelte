<script>
	import locale from "@reuters-graphics/d3-locale";
	import Multiline from "../components/charts/Multiline.svelte";
	import {curveMonotoneX} from 'd3-shape'
	import {multiline_data, test_aq} from '../utils.js'
	
	import * as csv from "../../public/data.csv"
	let data = csv.default
	
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%B %e'),
		y: loc.format(',.2f'),
	}
	
	let mldata = multiline_data(data) 
	$: mldata = multiline_data(data) 

</script>

<div class="narrowColumn">
	<Multiline 
	data={mldata}
	options={
		{
			key:{x: 'fecha', y: ['peak_cases_50to59', 'peak_cases_60to69','peak_cases_70to79','peak_cases_above80']},
			// key:{x: 'fecha', y: ['ra_cases_50to59', 'ra_cases_60to69','ra_cases_70to79','ra_cases_above80']},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ['#fc0', '#ccc','#dcc011','#000','#1bf011'],
			layout: 'col',
			title:'Title',
			desc:'Description',
			curve: curveMonotoneX
		}
	}
	/>
	</div>
	
	<div class="narrowColumn">
	<Multiline 
	data={mldata.filter(d=>  new Date(d.fecha) > new Date("2021-04-01"))}
	options={
		{
			key:{x: 'fecha', y: ['peak_cases_50to59', 'peak_cases_60to69','peak_cases_70to79','peak_cases_above80']},
			// key:{x: 'fecha', y: ['ra_cases_50to59', 'ra_cases_60to69','ra_cases_70to79','ra_cases_above80']},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ['#fc0', '#ccc','#dcc011','#cdf011','#1bf011'],
			layout: 'col',
			title:'Title',
			desc:'Description',
			curve: curveMonotoneX
		}
	}
	/>
	</div>