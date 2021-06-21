import * as aq from 'arquero';

export function rollingAvg(_data){
    let data = aq.from(_data.reverse())
        .fold(aq.not(['ccaa','fecha']))
        .derive({value: aq.rolling(d=> op.average(d.value))})
        // .reify()
        .groupby('fecha','ccaa')
        .pivot('key','value')
        .objects()
        // .print()
    // console.log(data)
    return data
}

export function nationalValues(_data){
    /* compute ABSOLUTE values */
    let data_sum = aq.from(_data.reverse())
        .select(aq.not(aq.startswith('admin_'), aq.matches('pct')))
        .fold(aq.not(['ccaa','fecha']))
        // .reify()
        // .derive({value: aq.rolling(d=> op.average(d.value))})
        .groupby('fecha')
        .pivot( 'key' ,{values: d=> op.sum(d.value)})
        .print()

    /* compute relative values */
    let data_pct = aq.from(_data.reverse())
        .select(['ccaa','fecha',aq.startswith('admin_'), aq.matches('pct')])
        .fold(aq.not(['ccaa','fecha']))
        // // .reify()
        // // .derive({value: aq.rolling(d=> op.average(d.value))})
        .groupby('fecha','ccaa')
        .pivot( 'key' ,{values: d=> op.average(d.value)})
        // // .columnNames()
        // // .objects()
        // // console.log(data_sum)
        .orderby(aq.desc('fecha'))
        .print()    

        // let data = data_pct.join(data_sum)
        // console.log(data)
        return data_pct
}

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

