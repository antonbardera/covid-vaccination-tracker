import { csvParse, autoType } from 'd3-dsv';
import { d3, autoType } from 'd3-';
import { aq, op } from 'arquero';


export function setColors(themes, theme) {
  for (let color in themes[theme]) {
    document.documentElement.style.setProperty('--' + color, themes[theme][color]);
  }
}

export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
	let data = await csvParse(string, autoType);
  return data;
}

export async function multiLinesData(data) {
	let data = data.map(d=>d);
  return data;
}

export function rollingAvg(data){
  let aqdata = aq.from(data.reverse())
  aqdata
      .groupby('fecha')
      // .rollup(op.sum(aq.endswith('80')))             
      .print()
}