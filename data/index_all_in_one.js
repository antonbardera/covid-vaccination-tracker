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
const days = listDates(new Date('2021-01-04'), new Date());

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

let all_data = []

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
const schema = [
    {
        date: new Date('2021-01-04'),
        header: ['ccaa', 'entregadas', 'administradas', 'admin_entregadas', 'hasta']
    },
    {
        date: new Date('2021-01-14'),
        header: ['ccaa', 'pfizer', 'moderna', 'entregadas', 'administradas', 'admin_entregadas', 'hasta']
    },
    {
        date: new Date('2021-01-17'),
        header: ['ccaa', 'pfizer', 'moderna', 'entregadas', 'administradas', 'admin_entregadas', 'vacuna_completa', 'hasta']
    },
    {
      date: new Date('2021-02-09'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'entregadas', 'administradas', 'admin_entregadas', 'vacuna_completa', 'hasta']
    },
    {
      date: new Date('2021-04-06'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'entregadas', 'administradas', 'admin_entregadas', 'vacuna_1dosis', 'vacuna_completa', 'hasta']
    },
    {
      date: new Date('2021-04-22'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'janssen', 'entregadas', 'administradas', 'admin_entregadas', 'vacuna_1dosis', 'vacuna_completa', 'hasta']
    }
];

const schema_ages_1dose = [
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

const schema_ages_complete = [
  {
      date: new Date('2021-03-31'),
      header: [
        'ccaa',
        'complete_80','pop_80', 'perc_80',
        'complete_70', 'pop_70', 'perc_70', 
        'complete_60', 'pop_70', 'perc_60', 
        'complete_50', 'pop_50','perc_50',
        'complete_25', 'pop_25','perc_25',
        'complete_18', 'pop_18','perc_18',
        'complete_16', 'pop_16','perc_16',
        'complete_total', 'pop_total','perc_total'
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
let json =[]
// create agregated data
Promise.all(
    days.reverse().map(date => 
        fetch(`${baseUrl}${date.replace(/-/g,'')}.ods`)
            .then(res => res.buffer())
            /* .then(data => {
              const headers = find(schema, d => d.date <= new Date(date)).header;
              const workbook = xlsx.read(data, {type:'buffer'});
              
              const json = xlsx.utils.sheet_to_json(workbook.Sheets.Hoja3||workbook.Sheets.Comunicación, {raw: false, range: 1, header:headers});
              json.map(d=> {
                  d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                  d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                  d.hasta = sanitizeDate(d.hasta, d.fecha);
                  d.ccaa = sanitizeName(d.ccaa);
                  return {...d}
              })
              //console.log('hey',json)
              return json;
          }) */
            .then(data => {
              const workbook = xlsx.read(data, {type:'buffer'});
              
              const headers = find(schema, d => d.date <= new Date(date)).header;

              const vacTotals = xlsx.utils.sheet_to_json(workbook.Sheets.Hoja3||workbook.Sheets.Comunicación, {raw: false, range: 1, header:headers});
              const vacOneDose = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_al_menos_1_dosis, {raw: false, range: 1, header:schema_ages_1dose[0].header})
              const vacComplete = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_pauta_completa, {raw: false, range: 1, header:schema_ages_complete[0].header})

              vacTotals.map(d=> {
                  d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                  d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                  d.hasta = sanitizeDate(d.hasta, d.fecha);
                  d.pfizer = (d.pfizer) ? parser.parse(d.pfizer): 0;
                  d.moderna = (d.moderna) ? parser.parse(d.moderna): 0;
                  d.astrazeneca = (d.astrazeneca) ? parser.parse(d.astrazeneca): 0;
                  d.janssen = (d.janssen) ? parser.parse(d.janssen): 0;
                  d.entregadas = (d.entregadas) ? parser.parse(d.entregadas): 0;
                  d.administradas = (d.administradas) ? parser.parse(d.administradas): 0;
                  d.admin_entregadas = (d.admin_entregadas) ? parser.parse(d.admin_entregadas): 0;
                  d.vacuna_1dosis = (d.vacuna_1dosis) ? parser.parse(d.vacuna_1dosis): 0;
                  d.vacuna_completa = (d.vacuna_completa) ? parser.parse(d.vacuna_completa): 0;
                  d.ccaa = sanitizeName(d.ccaa);

                  return {...d}
              })
              vacOneDose.map(d=>{return {...d}})
              vacComplete.map(d=>{return {...d}})
              
              const json = vacTotals;//date:date}//, ...vacTotals, ages_oneDose: vacOneDose, ages_twoDose: vacComplete}
              
              return json

          })
  )).then(json => transform(json));

// // create 1dose by ccaa data
//  let json_ages_1dose = Promise.all(
//     days.reverse().map(date => 
//         fetch(`${baseUrl}${date.replace(/-/g,'')}.ods`)
//             .then(res => res.buffer())
//             .then(data => {
//                 const headers_ages_1dose = find(schema_ages_1dose, d => d.date <= new Date(date)).header;
//                 const workbook = xlsx.read(data, {type:'buffer'});
//                 const json_ages_1dose = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_almenos_1_dosis, {raw: false, range: 1, header:headers_ages_1dose});
//                 json_ages_1dose.map(d=> {
//                     d.fecha = d3time.timeParse('%Y-%m-%d')(date);
//                     d.ccaa = sanitizeName(d.ccaa);
//                     return {...d}
//                 })
//                 //console.log('hey',json)
//                 return json_ages_1dose;
//             })
//   )).then(json => transform(json));

// // create complete by ccaa data
//  let json_ages_complete = Promise.all(
//     days.reverse().map(date => 
//         fetch(`${baseUrl}${date.replace(/-/g,'')}.ods`)
//             .then(res => res.buffer())
//             .then(data => {
//               const headers_ages_complete = find(schema_ages_complete, d => d.date <= new Date(date)).header;
//                 const workbook = xlsx.read(data, {type:'buffer'});
//                 const json_ages_complete = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_pauta_completa, {raw: false, range: 1, header:headers_ages_complete});
//                 json_ages_complete.map(d=> {
//                     d.fecha = d3time.timeParse('%Y-%m-%d')(date);
//                     d.ccaa = sanitizeName(d.ccaa);
//                     return {...d}
//                   })
//                 return json_ages_complete
//             })
//   )).then(json => transform(json));

  
const transform = (json) => {

  //console.log(json.flat())
  // json.flat().forEach((d,i) => { //if(i===0){console.log(d.values.total_results)}
  //     d.values.total_results.entregadas = (d.values.total_results.entregadas) ? parser.parse(d.values.total_results.entregadas): '';
  //     d.values.total_results.administradas = (d.values.total_results.administradas)?parser.parse(d.values.total_results.administradas):'';
  //     d.values.total_results.admin_entregadas = (d.values.total_results.admin_entregadas) ? parser.parse(d.values.total_results.admin_entregadas) : '';
  //     //if(i===0){console.log(d.values.total_results)}
  // });
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

  //better with arquero
  const data = groupby(json.flat(), d => d.ccaa);

  console.log(data);

  // const data_ages_1dose = groupby(json_ages_1dose.flat(), d => d.ccaa);
  // const data_ages_complete = groupby(json_ages_complete.flat(), d => d.ccaa);

  // writeJSON(latestNumbers, 'data_latest', pathTo);
  writeJSON(data, 'data_all_in_one', pathTo);
  console.log('json data created')
  writeCSV(data, 'data_all_in_one', pathTo);
  console.log('csv data created')
}
//   writeJSON(data_ages_1dose, 'data_ages_1dose', pathTo);
//   console.log('json data_ages_1dose created')
//   writeCSV(data_ages_1dose, 'data_ages_1dose', pathTo);
//   console.log('csv data_ages_1dose created')
  
//   writeJSON(data_ages_complete, 'data_ages_complete', pathTo);
//   console.log('json data_ages_complete created')
//   writeCSV(data_ages_complete, 'data_ages_complete', pathTo);
//   console.log('csv data_ages_complete created')
// 
