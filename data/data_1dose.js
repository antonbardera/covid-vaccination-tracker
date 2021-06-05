const fetch = require('node-fetch');
const xlsx = require('xlsx');
const dir = require('node-dir');
const https = require('https');
const d3time = require('d3-time-format');
const fs = require('fs');
const {writeCSV, writeJSON} = require('./utils/write');
const {listDates, find, download, dateDiff, approxDate, sNumber} = require('./utils/utils');
const groupby = require('lodash/groupBy');
const d2lIntl = require('d2l-intl');
// const {extent} = require('d3-array');

//List of days since January 4, 2021, the first date with data
const days = listDates(new Date('2021-03-31'), new Date());

//Total vaccines Pfizer + Moderna
const totalVacc = 5190735;

//Target population for Phase 1
const target = 2447000;

//Base URL of the OpenDocument Spreadsheets
const baseUrl = 'https://www.mscbs.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov/documentos/Informe_Comunicacion_'

//BACKUP SPREADSHEETS
//Only if there's a spreadsheet on that day and check if it exists already in the folder
const outdir = './spreadsheets';
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir);

days.reverse().forEach(date => {
  const filename = `${date.replace(/-/g,'')}.ods`

  if(fs.existsSync(`${outdir}/informe_${filename}`)) {
    console.log(`🛑 informe_${filename} already exists!`)
  } else {
    download(`${baseUrl}${filename}`, `${outdir}/informe_${filename}`, () => {
      console.log('✅ Done!')
    })
  }
})

//SANITIZE SPREADSHEETS
//Unfortunately different days have different numbers of columns (worksheet ranges)
//TODO => make it more resiliant to changes in headers. 
const schema =  [
    {
        date: new Date('2021-03-31'),
        header: [
          'ccaa',
          'dose1_80','pop_80','perc_80',
          'dose1_70', 'pop_70','perc_70',
          'dose1_60', 'pop_70','perc_60', 
          'dose1_50', 'pop_50','perc_50',
          'dose1_25', 'pop_25','perc_25',
          'dose1_18', 'pop_18','perc_18',
          'dose1_16', 'pop_16','perc_16',
          'dose1_total', 'pop_total','perc_total'
        ]
  
    }
  ];

//Some regions' names have extra spaces, missing accents, hyphens ... We should write a better function :/
const sanitizeName = (ccaa) => {
  const original = ['Aragón','Murcia ','Castilla y Leon ','Canarias','Castilla La Mancha','Asturias ','Galicia','Andalucía','Ceuta','Melilla','Baleares','Extremadura','Madrid','Cantabria','C. Valenciana','Navarra','Cataluña','La Rioja','País Vasco', 'Totales']
  const sanitized = ['Aragón','Murcia','Castilla y León','Canarias','Castilla-La Mancha','Asturias','Galicia','Andalucía','Ceuta','Melilla','Baleares','Extremadura','Madrid','Cantabria','Com. Valenciana','Navarra','Cataluña','La Rioja','País Vasco','Totales']
  const i = original.findIndex(d => d === ccaa)
  return (sanitized[i] !== undefined) ? sanitized[i] : ccaa;
}

const sanitizeDate = (date, date2) => {
  if (date !== null) {
    const diff = Math.round(dateDiff(date, date2) / (365/12));
    if (Math.abs(diff) > 1) {
      date = new Date(date);
      date.setMonth(date.getMonth() + diff);
    }
    return date;
  }
  
}

//FETCH THE SPREADSHEETS
//Output folder in the Svelte app
const pathTo = '../app/public/'

//Number parser for Spanish numbers like -> 1.000,00
const parser = new d2lIntl.NumberParse('es-ES');
Promise.all(
    days.reverse().map(date => 
        fetch(`${baseUrl}${date.replace(/-/g,'')}.ods`)
            .then(res => res.buffer())
            .then(data => {
                const headers = find(schema, d => d.date <= new Date(date)).header;
                const workbook = xlsx.read(data, {type:'buffer'});
                
                const json = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_al_menos_1_dosis, {raw: false, range: 1, header:headers});
                json.map(d=> {
                    d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                    // d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                    // d.hasta = sanitizeDate(d.hasta, d.fecha);
                    d.ccaa = sanitizeName(d.ccaa);
                    return {...d}
                })
                //console.log('hey',json)
                return json;
            })
  )).then(json => transform(json));

const transform = (json) => {

  json.flat().forEach(d => {
    // d.dose1_80 = (d.dose1_80) ? parser.parse(d.dose1_80):'';
    // d.pop_80 = (d.pop_80) ? parser.parse(d.pop_80):'';
    // d.perc_80 = (d.perc_80) ? parser.parse(d.perc_80):'';
    // d.dose1_70 = (d.dose1_70) ? parser.parse(d.dose1_70):'';
    // d.pop_70 = (d.pop_70) ? parser.parse(d.pop_70):'';
    // d.perc_70 = (d.perc_70) ? parser.parse(d.perc_70):'';
    // d.dose1_60 = (d.dose1_60) ? parser.parse(d.dose1_60):''; 
    // d.dose1_60 = (d.dose1_60) ? parser.parse(d.dose1_60):''; 
    // d.dose1_60 = (d.dose1_60) ? parser.parse(d.dose1_60):''; 
    // d.perc_60 = (d.perc_60) ? parser.parse(d.perc_60):''; 
    // d.dose1_50 = (d.dose1_50) ? parser.parse(d.dose1_50):''; 
    // d.pop_50 = (d.pop_50) ? parser.parse(d.pop_50):''; 
    // d.perc_50 = (d.perc_50) ? parser.parse(d.perc_50):''; 
    // d.dose1_25 = (d.dose1_25) ? parser.parse(d.dose1_25):''; 
    // d.pop_25 = (d.pop_25) ? parser.parse(d.pop_25):''; 
    // d.perc_25 = (d.perc_25) ? parser.parse(d.perc_25):''; 
    // d.dose1_18 = (d.dose1_18) ? parser.parse(d.dose1_18):''; 
    // d.pop_18 = (d.pop_18) ? parser.parse(d.pop_18):''; 
    // d.perc_18 = (d.perc_18) ? parser.parse(d.perc_18):''; 
    // d.dose1_16 = (d.dose1_16) ? parser.parse(d.dose1_16):''; 
    // d.pop_16 = (d.pop_16) ? parser.parse(d.pop_16):''; 
    // d.perc_16 = (d.perc_16) ? parser.parse(d.perc_16):''; 
    // d.dose1_total = (d.dose1_total) ? parser.parse(d.dose1_total):''; 
    // d.pop_total = (d.pop_total) ? parser.parse(d.pop_total):''; 
    // d.perc_total = (d.perc_total) ? parser.parse(d.perc_total):''
    /* d.pfizer = (d.pfizer) ? parser.parse(d.pfizer) : '';
    d.moderna = (d.moderna) ? parser.parse(d.moderna) : '';
    d.astrazeneca = (d.astrazeneca) ? parser.parse(d.astrazeneca) : '';
    d.janssen = (d.janssen) ? parser.parse(d.janssen) : '';
    d.entregadas = (d.entregadas) ? parser.parse(d.entregadas): '';
    // d.entregadas = (d.astrazeneca) ? d.entregadas - d.astrazeneca : d.entregadas;
    d.administradas = (d.administradas)?parser.parse(d.administradas):'';
    // d.administradas = (d.astrazeneca) ? d.administradas - d.astrazeneca : d.administradas;
    d.admin_entregadas = (d.admin_entregadas) ? parser.parse(d.admin_entregadas) : '';
    // d.admin_entregadas = (d.astrazeneca) ? d.administradas/d.entregadas * 100 : d.admin_entregadas;
    d.vacuna_1dosis = (d.vacuna_1dosis) ? parser.parse(d.vacuna_1dosis) : '';
    d.vacuna_completa = (d.vacuna_completa) ? parser.parse(d.vacuna_completa) : ''; */
    return {...d}
});

  // const range = extent(json.flat(), d => d.fecha);
  // const dateRange = dateDiff(range[0], range[1]);
  // const latestNumbers = Object.values(json)
	// 	.flat()
	// 	.sort((a, b) => b.fecha - a.fecha)
  //   .slice(0,20);
    
  // const totalCurrent = latestNumbers.find(d => d.ccaa === 'Totales' ).entregadas;

  // latestNumbers.map(d => {
	// 		const share = d.entregadas / totalCurrent;
	// 		d.poblacion_diana = Math.round(share * target);
	// 		const daily = d.administradas / dateRange;
	// 		const vaccinesLeft = d.poblacion_diana * 2 - d.administradas;
	// 		d.fecha_completa  = new Date(d.fecha);
  //     d.fecha_completa.setDate(d.fecha.getDate() + 1 * (vaccinesLeft / daily ) )
  //     d.fecha_completa = approxDate(d.fecha_completa )
	// 		return {...d}
	// });

  const data = groupby(json.flat(), d => d.ccaa);
  //console.log(json)
  // writeJSON(latestNumbers, 'data_latest', pathTo);
  writeJSON(data, 'data1dose', pathTo);
  console.log('json data created')
  writeCSV(data, 'data1dose', pathTo);
  console.log('csv data created')
}
