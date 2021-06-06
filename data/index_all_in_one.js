const fetch = require('node-fetch');
const xlsx = require('xlsx');
const dir = require('node-dir');
const https = require('https');
const d3time = require('d3-time-format');
const fs = require('fs');
const {writeCSV, writeJSON} = require('./utils/write');
const {listDates, find, download, dateDiff, approxDate, sNumber} = require('./utils/utils');
const groupby = require('lodash/groupBy');
const aq = require('arquero')
const d2lIntl = require('d2l-intl');
// const {extent} = require('d3-array');

//List of days since January 4, 2021, the first date with data
const days = listDates(new Date('2021-01-04'), new Date());

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
        header: ['ccaa', 'pfizer', 'moderna', 'entregadas', 'administradas', 'admin_entregadas', 'dose2', 'hasta']
    },
    {
      date: new Date('2021-02-09'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'entregadas', 'administradas', 'admin_entregadas', 'dose2', 'hasta']
    },
    {
      date: new Date('2021-04-06'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'entregadas', 'administradas', 'admin_entregadas', 'dose1', 'dose2', 'hasta']
    },
    {
      date: new Date('2021-04-22'),
      header: ['ccaa', 'pfizer', 'moderna', 'astrazeneca', 'janssen', 'entregadas', 'administradas', 'admin_entregadas', 'dose1', 'dose2', 'hasta']
    }
];

const schema_ages_1dose = [
  {
      date: new Date('2021-03-31'),
      header: [
        'ccaa',
        'dose1_above80','pop_above80','dose1_pct_above80',
        'dose1_70to79', 'pop_70to79','dose1_pct_70to79',
        'dose1_60to69', 'pop_60to69','dose1_pct_60to69', 
        'dose1_50to59', 'pop_50to59','dose1_pct_50to59',
        'dose1_25', 'pop_25','perc_25',
        'dose1_18', 'pop_18','perc_18',
        'dose1_16', 'pop_16','perc_16',
        'dose1_total', 'pop_total','dose1_perc_total'
      ]
  }];

const schema_ages_complete = [
  {
      date: new Date('2021-03-31'),
      header: [
        'ccaa',
        'dose2_above80','pop_above80','dose2_pct_above80',
        'dose2_70to79', 'pop_70to79','dose2_pct_70to79',
        'dose2_60to69', 'pop_60to69','dose2_pct_60to69', 
        'dose2_50to59', 'pop_50to59','dose2_pct_50to59',
        'dose2_25', 'pop_25','perc_25',
        'dose2_18', 'pop_18','perc_18',
        'dose2_16', 'pop_16','perc_16',
        'dose2_total', 'pop_total','dose2_perc_total'
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

const sanitizeObject = (datum, date) => {
  const keys = Object.keys(datum);
  keys.forEach(key =>{
    switch (key) {
      case 'ccaa':
        datum[key] = sanitizeName(datum[key]);
        break;
      default:
        //console.log(key)
        datum[key] = parser.parse(datum[key]);
    }
  })
  return datum;
}

//FETCH THE SPREADSHEETS
//Output folder in the Svelte app
const pathTo = '../app/public/'

//Number parser for Spanish numbers like -> 1.000,00
const parser = new d2lIntl.NumberParse('es-ES');

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
              const vacDose1 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_al_menos_1_dosis, {raw: false, range: 1, header:schema_ages_1dose[0].header})
              const vacDose2 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_pauta_completa, {raw: false, range: 1, header:schema_ages_complete[0].header})

              vacTotals.map(d=> {
                  d = sanitizeObject(d, date);
                  d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                  d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                  d.hasta = sanitizeDate(d.hasta, d.fecha);
                  return {...d}
              })

              vacDose1.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                return {...d}
              })
              
              vacDose2.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = d3time.timeParse('%Y-%m-%d')(date);
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                return {...d}
              })
              //console.log(vacOneDose);
              aqVacTotals = aq.from(vacTotals);
              //console.log("VacTotals!!!")
              //aqVacTotals.print();
              const cn_totals = aqVacTotals.columnNames();
              //console.log("VacOneDose!!!")
              aqVacDose1 = aq.from(vacDose1);
              const cn_Dose1 = aqVacDose1.columnNames();

              aqVacDose2 = aq.from(vacDose2);
              const cn_Dose2 = aqVacDose2.columnNames();

              // cn_totals[0] === cn_Dose1[0] ? console.log("son iguals"+cn_totals[0]) :console.log("son diferent"+cn_totals[0]);
              // cn_totals[0] === cn_Dose2[0] ? console.log("son iguals"+cn_totals[0]) :console.log("son diferent"+cn_totals[0]);
              //aqVacOneDose.print();
              //console.log("***************")
              // cn_totals[0] === 'ccaa' ? console.log("sson iguals"+cn_totals[0]) :console.log("sson diferent"+cn_totals[0]);
              var  aqJoin = {}
              if(cn_totals[0] === cn_Dose1[0]  &&cn_totals[0] === 'ccaa'){
                aqJoin = aqVacTotals.join(aqVacDose1,'ccaa')//.join(aqvacDose2,'ccaa')
                .derive({pct_under50: d => d.perc_25 + d.perc_18 + d.perc_16})
                .select(aq.not('perc_25','perc_18','perc_16'))
                .derive({pop_under50: d => d.pop_25 + d.pop_18 + d.pop_16})
                .select(aq.not('pop_25','pop_18','pop_16'))
                .derive({dose1_under50: d => d.dose1_25 + d.dose1_18 + d.dose1_16})
                .select(aq.not('dose1_25','dose1_18','dose1_16'))
                .select(aq.not('fecha_2','hasta_2'))

                .join(
                  aqVacDose2
                  .select(aq.not('pop_25','pop_18','pop_16','pop_above80','pop_70to79','pop_60to69','pop_50to59', 'pop_total')),'ccaa')
                .derive({dose2_under50: d => d.dose2_25 + d.dose2_18 + d.dose2_16})
                .select(aq.not('dose2_25','dose2_18','dose2_16'))
                .select(aq.not('pop_25','pop_18','pop_16'))
                .select(aq.not('fecha_1','hasta_1'))
                .objects()

                //console.log("VacTotalsJoint!!!")
                //aqVacTotals.print();
              }else{
                console.log("*******")
                console.log(date)
                console.log("Not equal")
                console.log(cn_totals)
                console.log("--")
                console.log(cn_Dose1)
                console.log(cn_Dose2)
                console.log("*******")
              }
              
              console.log(aqJoin);
              writeCSV(aqJoin, 'data_all_in_one', pathTo);
              writeJSON(aqJoin, 'data_all_in_one', pathTo);
              return aqJoin
              // const json = {date:date, vac_Totals: vacTotals, ages_oneDose: vacOneDose, ages_twoDose: vacComplete}
          })
  )).then(json => transform(json));

  
const transform = (json) => {

    
  // const totalCurrent = latestNumbers.find(d => d.ccaa === 'Totales' ).entregadas;

  // latestNumbers.map(d => {
	// 		const share = d.entregadas / totalCurrent;
	// 		d.poblacion_diana = Math.round(share * target);
	// 		const daily = d.administradas / dateRange;
	// 		const vaccinesLeft = d.poblacion_diana * 2 - d.administradas;
	// 		d.fecha_completa  = new Date(d.fecha);
  //    d.fecha_completa.setDate(d.fecha.getDate() + 1 * (vaccinesLeft / daily ) )
  //     d.fecha_completa = approxDate(d.fecha_completa )
	// 		return {...d}
	// });

  //better with arquero
  //console.log(json);
  const data = json.this()
  // aqVacTotals = aq.from(vacTotals);
  // aqVacOneDose = aq.from(vacOneDose);

  // aqVacTotals.join(aqVacOneDose, ['ccaa'])

  // const data_ages_1dose = groupby(json_ages_1dose.flat(), d => d.ccaa);
  // const data_ages_complete = groupby(json_ages_complete.flat(), d => d.ccaa);

  // writeJSON(latestNumbers, 'data_latest', pathTo);
  writeJSON(data, 'data_all_in_one', pathTo);
  console.log('json data created')
  writeCSV(data, 'data_all_in_one', pathTo);
  console.log('csv data created')
}
