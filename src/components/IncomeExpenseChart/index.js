import React, { useState, useReducer, useEffect } from 'react'
import moment from 'moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES, FIN_FORM_MODE } from '../../api/CollectionFinanceAPI'
import { INCOME_CATEGORY_ATTRIBUTES } from '../../api/CollectionIncomeCatAPI';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TYPE = {
    INCOME: true,
    EXPENSE: false,
}

// const reducer = (state, action) => {
//     switch(action.type) {
//         case TYPE.INCOME:
//             console.log("This is INCOME type");
//             return { months: "Jan", income: 1, category: "Test" };
//         case TYPE.EXPENSE:
//             console.log("This is EXPENSE type");
//             return state;
//         default:
//             console.log("This is DEFAULT type");
//             return state;
//     }
// }

export function IncomeExpenseChart (refreshAttr, setRefreshAttr) {
    const db_Finance = new CollectionFinanceAPI();

    const [finance , setFinance] = useState([]);
    // const [incomeData, setIncomeData] = useReducer(
    //     reducer, 
    //     {
    //         months: '',
    //         income: 0,
    //         category: '',
    //     }
    // );

    const incomeData = [];
    const expenseData = [];
    const getFinanceData = async () => {
        await db_Finance.getCollection().then(item => {
            setFinance(item);
        })
    }

    useEffect(() => {
        // db_Finance.getCollection().then(item => {
        //     setFinance(item);
        // })
        // calMonthlyIncome();
        getFinanceData();
        // calMonthlyIncome();
    }, [refreshAttr])

    console.log("INCOME-EXPENSE-CHART finance: ", finance);
    
    // 1. fetch Income and expense data from finance
    finance.forEach(item => {
        if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) {
            incomeData.push({ 
                type: item.data[FINANCE_ATTRIBUTES.IS_INCOME],
                month: moment(item.data[FINANCE_ATTRIBUTES.DATE]).month() + 1,
                year: moment(item.data[FINANCE_ATTRIBUTES.DATE]).year(),
                income_amount: item.data[FINANCE_ATTRIBUTES.AMOUNT],
                category: item.data[FINANCE_ATTRIBUTES.CATEGORY],
            })
        }
        else {
            expenseData.push({
                type: item.data[FINANCE_ATTRIBUTES.IS_INCOME], // isIncome: false
                month: moment(item.data[FINANCE_ATTRIBUTES.DATE]).month() + 1,
                year: moment(item.data[FINANCE_ATTRIBUTES.DATE]).year(),
                expense_amount: item.data[FINANCE_ATTRIBUTES.AMOUNT],
                category: item.data[FINANCE_ATTRIBUTES.CATEGORY],
            })
        }
    })
    console.log("----incomeData arr----", incomeData);
    console.log("----expenseData arr----", expenseData);
    console.log("Moment get finance record Date by Moment: ", moment(1642954920135).format("MMM")); // month() is starting from 0 to 11 ( 0 === Jan, 1 === Feb )
    console.log("Moment startOfyear: ", moment().startOf('year').format()); // start of year (e.g. 2022-01-01T00:00:00+08:00)
    console.log("NOW-YEAR", moment().year()); // now 2022
    console.log("Particular year: ", moment(1674560160492).year()); // 2023
    console.log("This month: ", moment().format("MMM"));
    
    
    // 2. separate the data into two structure for embedded into the chartjs data structure
    // const months = [];
    // var cal = 0;
    var IncomeAmountPerMonth = [];
    // initalize the array
    for (var i = 0; i < 12; i++) {
        IncomeAmountPerMonth[i] = 0;
    }
    for (var i = 0; i < incomeData.length; i++) { //1,2, ... ,12 months
        // console.log("i: ", incomeData[i]);
        for (var j = 0; j < 12; j++) {
            if (incomeData[i].month === j + 1 && incomeData[i].year === moment().year()) {
                IncomeAmountPerMonth[j] += parseFloat(incomeData[i].income_amount);
            }
        }
    }
    console.log("IncomeAmountPerMonth: ", IncomeAmountPerMonth);

    var ExpenseAmountPerMonth = [];
    
    for (var i = 0; i < 12; i++) {
        ExpenseAmountPerMonth[i] = 0;
    }

    for (var i = 0; i < expenseData.length; i++) {
        for (var j = 0; j < 12; j++) {
            if (expenseData[i].month === j + 1 && expenseData[i].year === moment().year()) {
                ExpenseAmountPerMonth[j] += parseFloat(expenseData[i].expense_amount);
            }
        }
    }

    console.log("ExpenseAmountPerMonth: ", ExpenseAmountPerMonth);

    const options = {
        responsive: true,
        layout: {
            padding: {
                // top: 50,
                // right: 50,
                // left: 50,
                // bottom: 5,
            }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            position: 'top',
            text: 'Income-Expense Chart' + ' in ' + moment().year(),
            font:{
              size: 20,
              family: 'Raleway',
            },
            color: '#000000',
            padding: {
                top: 5,
                bottom: 5,
            }
          },
        },

    };
    

    useEffect(() => {
        db_Finance.getCollection().then(item => {
            setFinance(item);
        })
    }, [])

     const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    

    return (
        <div>
            <Bar 
                options={options}
                height={150}
                width={260}
                data={{
                    
                    labels,
                    datasets: [
                        {
                          label: 'Income',
                          data: IncomeAmountPerMonth, // [ ]
                            // data: labels.map(() => faker.datatype.number({ min: 0, max: 10000 })),
                            backgroundColor: 
                            [
                                '#123456'
                                
                            ],
                            borderColor: 
                            [
                                //default value is '#000000' --> blk
                            ],
                            borderWidth: 1
                        },
                        {
                          label: 'Expense',
                          data: ExpenseAmountPerMonth,
                          backgroundColor: 
                          [
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                // 'rgba(53, 162, 235, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                          ]
                        },
                      ],
                    //   options
                }}
            />
        </div>

    )
}