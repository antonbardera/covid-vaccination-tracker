import {aq,op} from "@arquero"

export function rollingAvg(_data){
    let data = aq.from(_data)
        .print()
    return data
}
