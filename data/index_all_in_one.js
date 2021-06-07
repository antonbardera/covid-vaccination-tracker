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
const { join } = require('path');
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

            .then(data => {
              const workbook = xlsx.read(data, {type:'buffer'});
              
              const headers = find(schema, d => d.date <= new Date(date)).header;

              const vacTotals = xlsx.utils.sheet_to_json(workbook.Sheets.Hoja3||workbook.Sheets.Comunicación, {raw: false, range: 1, header:headers});
              const vacDose1 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_al_menos_1_dosis, {raw: false, range: 1, header:schema_ages_1dose[0].header})
              const vacDose2 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_pauta_completa, {raw: false, range: 1, header:schema_ages_complete[0].header})

              vacTotals.map(d=> {
                  d = sanitizeObject(d, date);
                  d.fecha = d3time.timeParse('%Y-%m-%d')(date)+1;
                  d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                  d.hasta = sanitizeDate(d.hasta, d.fecha);
                  
                  return {...d}
              })

              vacDose1.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = d3time.timeParse('%Y-%m-%d')(date)+1;
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                d.dose1_under50 = d.dose1_25 + d.dose1_18 + d.dose1_16;
                d.dose1_perc_under50 = d.perc_25 + d.perc_18 + d.perc_16;
                return {...d}
              })
              
              vacDose2.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = d3time.timeParse('%Y-%m-%d')(date)+1;
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                d.dose2_under50 = d.dose2_25 + d.dose2_18 + d.dose2_16;
                d.dose2_perc_under50 = d.perc_25 + d.perc_18 + d.perc_16;
                d.pop_under50 = d.pop_25 + d.pop_18 + d.pop_16
                return {...d}
              })

           
              const fecha = [date]

              aqVacDate = aq.from(fecha);
              aqVacTotals = aq.from(vacTotals);
              const cn_totals = aqVacTotals.columnNames();

              aqVacDose1 = aq.from(vacDose1);
              const cn_Dose1 = aqVacDose1.columnNames();
              // aqVacDose1.print()
              aqVacDose2 = aq.from(vacDose2);
              const cn_Dose2 = aqVacDose2.columnNames();

              // cn_totals[0] === cn_Dose1[0] ? console.log("son iguals"+cn_totals[0]) :console.log("son diferent"+cn_totals[0]);
              // cn_totals[0] === cn_Dose2[0] ? console.log("son iguals"+cn_totals[0]) :console.log("son diferent"+cn_totals[0]);

              // cn_totals[0] === 'ccaa' ? console.log("sson iguals"+cn_totals[0]) :console.log("sson diferent"+cn_totals[0]);
              var  aqJoin = []
            
            
              if(cn_totals[0] === cn_Dose1[0]  &&cn_totals[0] === 'ccaa'){
                aqJoin = aqVacTotals.join(aqVacDose1
                  .select(aq.not('perc_25','perc_18','perc_16','pop_25','pop_18','pop_16','dose1_25','dose1_18','dose1_16'))
                  ,'ccaa')
                // .derive({pop_under50: d => d.pop_25 + d.pop_18 + d.pop_16})
                .join(
                     aqVacDose2
                     .select(aq.not('pop_25','pop_18','pop_16','pop_above80','pop_70to79','pop_60to69','pop_50to59', 'pop_total','perc_25','perc_18','perc_16','dose2_25','dose2_18','dose2_16')),
                     'ccaa')
                .select(aq.not('fecha_1','fecha_2','hasta_1','hasta_2'))
                // .select(aq.not('pop_25','pop_18','pop_16'))
                // .derive({dose1_under50: d => d.dose1_25 + d.dose1_18 + d.dose1_16})
                // .select(aq.not('dose1_25','dose1_18','dose1_16'))
                // .select(aq.not('fecha_2','hasta_2'))

                // .join(
                //   aqVacDose2
                //   .select(aq.not('pop_25','pop_18','pop_16','pop_above80','pop_70to79','pop_60to69','pop_50to59', 'pop_total')),'ccaa')
                // .derive({dose2_under50: d => d.dose2_25 + d.dose2_18 + d.dose2_16})
                // .select(aq.not('dose2_25','dose2_18','dose2_16'))
                // .select(aq.not('pop_25','pop_18','pop_16'))
                // .select(aq.not('fecha_1','hasta_1'))
                .objects()


                //aqVacTotals.print();
                }
              // else{
              //   console.log("*******")
              //   console.log(date)
              //   console.log("Not equal")
              //   console.log(cn_totals)
              //   console.log("--")
              //   console.log(cn_Dose1)
              //   console.log(cn_Dose2)
              //   console.log("*******")
              // }
              
              // console.log(aqJoin);
              
              const a = {date,aqJoin}
              return a
          })
  )).then(json => {
    const age_data = json.map(d=>d.aqJoin).flat()
    // const keys = Object.keys(data[0]).filter(key=> !key.includes('_2'))//.filter(({key})=> !key.includes('_1'))))
    const aqdata = aq.from(age_data).objects()


    const main = async () => {
      let url ='https://cnecovid.isciii.es/covid19/resources/casos_hosp_uci_def_sexo_edad_provres.csv'
        const covid_data = aq.fromCSV(await fetch(url).then(res => res.text()))
            .derive({ccaa: d => { 
              const provToCcaa = { 
                A :'Com. Valenciana', AB: 'Castilla-La Mancha', AL:	'Andalucía', AV: 'Castilla y León', B : 'Cataluña',
                BA:	'Extremadura', BI:	'País Vasco', BU:	'Castilla y León', C : 'Galicia', CA:	'Andalucía', CE:	'Ceuta',
                CC:	'Extremadura', CO: 'Andalucía', CR:	'Castilla-La Mancha', CS: 'Com. Valenciana', CU:	'Castilla-La Mancha',
                GC:	'Canarias', GI:	'Cataluña', GR: 'Andalucía', GU:	'Castilla-La Mancha', H :'Andalucía', HU:	'Aragón', J : 'Andalucía',
                L :	'Cataluña', LE:	'Castilla y León', LO: 'La Rioja', LU:	'Galicia', M :	'Madrid', MA:	'Andalucía', ML: 'Melilla',
                MU:	'Murcia', NA:	'Navarra', O : 'Asturias', OR:	'Galicia', P : 'Castilla y León', PM: 'Baleares',
                PO: 'Galicia', S : 'Cantabria', SA: 'Castilla y León', SE: 'Andalucía', SG: 'Castilla y León', SO: 'Castilla y León',
                SS: 'País Vasco', T : 'Cataluña', TE: 'Aragón', TF:	'Canarias', TO: 'Castilla-La Mancha', V :	'Com. Valenciana', VA: 'Castilla y León',
                VI: 'País Vasco', Z : 'Aragón', ZA:	'Castilla y León'
              };
              return provToCcaa[d.provincia_iso]||"no_ccaa";
            }})
            .groupby('ccaa','fecha')
            .pivot('grupo_edad', { value: d => ({cases:op.sum(d.num_casos),hosp:op.sum(d.num_hosp), uci:op.sum(d.num_uci), deaths:op.sum(d.num_def) })})
            .derive({cases_under50: d=> d['0-9'].cases+ d['10-19'].cases+ d['20-29'].cases+ d['30-39'].cases+ d['40-49'].cases })
            .derive({cases_50to59: d=> d['50-59'].cases})
            .derive({cases_60to69: d=> d['60-69'].cases})
            .derive({cases_70to79: d=> d['70-79'].cases})
            .derive({cases_above80: d=> d['80+'].cases})
            .derive({deaths_under50: d=> d['0-9'].deaths+ d['10-19'].deaths+ d['20-29'].deaths+ d['30-39'].deaths+ d['40-49'].deaths })
            .derive({deaths_50to59: d=> d['50-59'].deaths})
            .derive({deaths_60to69: d=> d['60-69'].deaths})
            .derive({deaths_70to79: d=> d['70-79'].deaths})
            .derive({deaths_above80: d=> d['80+'].deaths})
            .derive({hosp_under50: d=> d['0-9'].hosp+ d['10-19'].hosp+ d['20-29'].hosp+ d['30-39'].hosp+ d['40-49'].hosp })
            .derive({hosp_50to59: d=> d['50-59'].hosp})
            .derive({hosp_60to69: d=> d['60-69'].hosp})
            .derive({hosp_70to79: d=> d['70-79'].hosp})
            .derive({hosp_above80: d=> d['80+'].hosp})
            .derive({uci_under50: d=> d['0-9'].uci+ d['10-19'].uci+ d['20-29'].uci+ d['30-39'].uci+ d['40-49'].uci })
            .derive({uci_50to59: d=> d['50-59'].uci})
            .derive({uci_60to69: d=> d['60-69'].uci})
            .derive({uci_70to79: d=> d['70-79'].uci})
            .derive({uci_above80: d=> d['80+'].uci})
            .select(aq.not('0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80+','NC'))
            //.print({ offset: 5000 })



            return covid_data

    }
  main().then(data=> { 
    const full_data = data.table()

  

  writeJSON(json, 'data_all_in_one', pathTo);
  console.log('json data created')
  writeCSV(json, 'data_all_in_one', pathTo);
  console.log('csv data created')
  })
    });

// ARQUERO WRANGLING
const transform = (json) => {
  // var data = json
  // console.log(data.flat())
  // data.print()
  // console.log(aqDates.map(d=>d.vacTotals))
  // var  aqJoin = aqDates.join
  // if(cn_totals[0] === cn_Dose1[0]  &&cn_totals[0] === 'ccaa'){
  //        aqJoin = aqVacTotals.join(aqVacDose1,'ccaa')
  //         .derive({pct_under50: d => d.perc_25 + d.perc_18 + d.perc_16})
  //         .select(aq.not('perc_25','perc_18','perc_16'))
  //         // .derive({pop_under50: d => d.pop_25 + d.pop_18 + d.pop_16})
  //         // .select(aq.not('pop_25','pop_18','pop_16'))
  //         // .derive({dose1_under50: d => d.dose1_25 + d.dose1_18 + d.dose1_16})
  //         // .select(aq.not('dose1_25','dose1_18','dose1_16'))
  //         // .select(aq.not('fecha_2','hasta_2'))

  //         // .join(
  //         //   aqVacDose2
  //         //   .select(aq.not('pop_25','pop_18','pop_16','pop_above80','pop_70to79','pop_60to69','pop_50to59', 'pop_total')),'ccaa')
  //         // .derive({dose2_under50: d => d.dose2_25 + d.dose2_18 + d.dose2_16})
  //         // .select(aq.not('dose2_25','dose2_18','dose2_16'))
  //         // .select(aq.not('pop_25','pop_18','pop_16'))
  //         // .select(aq.not('fecha_1','hasta_1'))
  //         .objects()
          
  //         } 
  //         // else{
  //         //   console.log("*******")
  //         //   console.log(date)
  //         //   console.log("Not equal")
  //         //   console.log(cn_totals)
  //         //   console.log("--")
  //         //   console.log(cn_Dose1)
  //         //   console.log(cn_Dose2)
  //         //   console.log("*******")
  //         // }
  //         console.log(aqJoin)
  //better with arquero

  // console.log(json)
  // aqVacTotals = aq.from(vacTotals);
  // aqVacOneDose = aq.from(vacOneDose);

  // aqVacTotals.join(aqVacOneDose, ['ccaa'])

  // const data_ages_1dose = groupby(json_ages_1dose.flat(), d => d.ccaa);
  // const data_ages_complete = groupby(json_ages_complete.flat(), d => d.ccaa);

  // writeJSON(latestNumbers, 'data_latest', pathTo);
  // writeJSON(json, 'data_all_in_one', pathTo);
  // console.log('json data created')
  // writeCSV(json, 'data_all_in_one', pathTo);
  // console.log('csv data created')
}
