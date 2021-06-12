const fetch = require('node-fetch');
const xlsx = require('xlsx');

const d3time = require('d3-time-format');
const fs = require('fs');
const {writeCSV, writeJSON} = require('./utils/write');
const {listDates, find, download, dateDiff} = require('./utils/utils');

const aq = require('arquero')
const d2lIntl = require('d2l-intl');



// CONSTANTS
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

//////// SANITIZE SPREADSHEETS
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

////// PARSE VALUES AND DATA TYPES
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

//Number parser for Spanish numbers like -> 1.000,00
const parser = new d2lIntl.NumberParse('es-ES');

//Output folder in the Svelte app
const pathTo = '../app/public/'

////// PARSE SPREADSHEETS
Promise.all(
  // loop into the date list and for each fetch the url with the vaccines ods file
    days.reverse().map(date => 
        fetch(`${baseUrl}${date.replace(/-/g,'')}.ods`)
            .then(res => res.buffer())
            .then(data => {
              const workbook = xlsx.read(data, {type:'buffer'});
              
              const headers = find(schema, d => d.date <= new Date(date)).header;

              const vacTotals = xlsx.utils.sheet_to_json(workbook.Sheets.Hoja3||workbook.Sheets.Comunicación, {raw: false, range: 1, header:headers});
              const vacDose1 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_al_menos_1_dosis, {raw: false, range: 1, header:schema_ages_1dose[0].header})
              const vacDose2 = xlsx.utils.sheet_to_json(workbook.Sheets.Etarios_con_pauta_completa, {raw: false, range: 1, header:schema_ages_complete[0].header})
              
              ////// PROCESS COLUMNS
              vacTotals.map(d=> {
                d = sanitizeObject(d, date);
                d.fecha = new Date(d3time.utcParse('%Y-%m-%d')(date))
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                
                return {...d}
              })
              // console.log(vacTotals.filter(d=> d.fecha ==='2021-01-19T22:00:00.000Z'))
              
              vacDose1.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = new Date(d3time.utcParse('%Y-%m-%d')(date));
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                d.dose1_under50 = d.dose1_25 + d.dose1_18 + d.dose1_16;
                d.dose1_perc_under50 = d.perc_25 + d.perc_18 + d.perc_16;
                return {...d}
              })
              
              vacDose2.map(d=>{
                d = sanitizeObject(d, date);
                d.fecha = new Date(d3time.utcParse('%Y-%m-%d')(date));
                d.hasta = d3time.timeParse('%d/%m/%Y')(d.hasta);
                d.hasta = sanitizeDate(d.hasta, d.fecha);
                d.dose2_under50 = d.dose2_25 + d.dose2_18 + d.dose2_16;
                d.dose2_perc_under50 = d.perc_25 + d.perc_18 + d.perc_16;
                d.pop_under50 = d.pop_25 + d.pop_18 + d.pop_16
                return {...d}
              })
              // console.log(vacDose2)
              

              const a = {date:date,values:{vacTotals,vacDose1,vacDose2}}
              // console.log(a)
              // take the data outside the date loop to have it as a whole. 
              return a
          })
  )).then(json => {
    const joined_vacc = json.map(d=> {
      //////// Merge entries for each objecgt objects
      // https://stackoverflow.com/questions/46849286/merge-two-array-of-objects-based-on-a-key
      arr = d.values.vacTotals.map((item, i) => Object.assign({}, item, d.values.vacDose1[i]));
      const grouped = arr.map((item, i) => Object.assign({}, item, d.values.vacDose2[i]));
          
      return grouped
    })

    // const keys = Object.keys(data[0]).filter(key=> !key.includes('_2'))//.filter(({key})=> !key.includes('_1'))))
    

    ////// COVID INDICES DATA
    // Uses Arquero to fetch the csv and pivot age factors as columns. Renames age columns. Calculates under50group
    const main = async () => {
      let url ='https://cnecovid.isciii.es/covid19/resources/casos_hosp_uci_def_sexo_edad_provres.csv'
        const covid_data = aq.fromCSV(await fetch(url).then(res => res.text()), { parse: { fecha: d3time.utcParse('%Y-%m-%d') }})
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
            
        ////// GATHER OUTPUT DATA
        // Only 2021 because vaccination data only covers that period
        const covid = covid_data.objects().flat().filter(d=>d.fecha.getFullYear() === 2021)
        const flatvac = joined_vacc.flat();
        
        ////// JOIN VACCINES AND INDICES DATA. 
        //This is necessary since covid and flatvac arrays haven't the same order
        const full_data = covid.map(item => ({...item, ...flatvac.find(item2 => item2.ccaa === item.ccaa && item2.fecha.getTime() === item.fecha.getTime())}))
        //const full_data = covid.map((item, i) => Object.assign({}, item, joined_vacc.flat()[i]));
        
        // console.log(full_data)
        
        writeJSON(full_data, 'data', pathTo);
        console.log('json data created')
        writeCSV(full_data, 'data', pathTo);
        console.log('csv data created')
        return full_data
          }
          main().then(data => { }) 
});
