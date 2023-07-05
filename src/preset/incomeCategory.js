

// export const incomeCategory = [
//     { value: 'tuition fee', label: 'TuitionFee' },
//     { value: 'part-time', label: 'PartTime' },
//     { value:  'full-time', label: 'FullTime' }
    
//     // {value: ...., label: }
// ]

/**
 *  map() will always return an array.
 *  use reduce() and set accumulator to empty object {}
 *  Use the destructuring and spread syntax to isolate label and other properties.
 *  Set the property of accumulator whose key is "label" property of each object and its value is rest of the object.
 *  The localbase will show e.g. array[0]: Full-Time: {value: 'full-time'}, Part-Time: {value: 'part-time'}, etc...
 *  
 *  @returns each of the object inside the array of incomeCategory
 */
// export const getIncomeCategory = incomeCategory.forEach(item => item)
