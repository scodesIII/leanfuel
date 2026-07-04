const LB_PER_KG = 2.2046226218;

type PreferredUnits = 'metric' | 'imperial';

export const unitLabel = (units: PreferredUnits): string => {
    return units === 'metric' ? 'kg' : 'lb';
}

export const kgToDisplay = (kg:number, units: PreferredUnits): number => {
    if (units === 'metric') {
        return roundTo1Decimal(kg);
    } else {
        return roundTo1Decimal(kg * LB_PER_KG);
    }
}

export const displayToKg = (value:number, units: PreferredUnits): number => {
    if (units === 'metric') {
        return roundTo1Decimal(value);
    } else {
        return roundTo1Decimal(value / LB_PER_KG);
    }
}

export const roundTo1Decimal = (value: number): number => {
    return Math.round(value * 10) / 10;
}