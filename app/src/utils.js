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

export function allAges(_data){
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

