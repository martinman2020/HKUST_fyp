import React, { useState, useEffect, Component } from "react";
import { Doughnut, Line, Bar, Pie } from "react-chartjs-2";
import moment from 'moment';
// import { Pie } from "react-chartjs-2";
// import { Bar } from "react-chartjs-2";
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES, FIN_FORM_MODE } from '../../api/CollectionFinanceAPI'
import axios from 'axios'
import { CollectionExpenseCatAPI, EXPENSE_CATEGORY_ATTRIBUTES } from "../../api/CollectionExpenseCatAPI";
import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    layouts,
    SubTitle
  } from 'chart.js';
import { keys } from "@mui/system";
import { plugins } from "pretty-format";
import { INCOME_CATEGORY_ATTRIBUTES } from "../../api/CollectionIncomeCatAPI";

Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
  );


  export function ExpenseChat (){
    const db_Finance = new CollectionFinanceAPI();
    const db_ExpenseCat = new CollectionExpenseCatAPI();

    const [finance, setFinance] = useState();
    const [ExpenseCatData, setExpenseCatData] = useState([]);
    const [cata_mapping, setcata_mapping] = useState([]);

    const chartData = [];

    const [chartLabel, setChartLabel] = useState([]);
    const [amountOfexpense, setAmountOfexpense] = useState([]);

    // 1. Fetch the data from Expense category from localbase
    // 2. And store in state (cat_mapping)
    var checkALL = false;
    if (cata_mapping.length !== undefined) {
        ExpenseCatData.forEach(_keys => {
            if ((cata_mapping.length === 0 || cata_mapping.length < ExpenseCatData.length) && checkALL !== true) {
                cata_mapping.push({
                    // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: _keys.data[EXPENSE_CATEGORY_ATTRIBUTES.VALUE],
                    [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: _keys.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL],
                    amount: 0,
                })
            }
        })
    }

    // 3. Fetch finance record data from localbase (finance state)
    //      and use finance.category attribute to do the comparsion
    // 4. Do the comparison, and count 
    // !!!!!!TODO: check the date (monthly)
    var count = 0;
    if (cata_mapping.length > 0) {
        cata_mapping.forEach((_cat, idx) => (finance.forEach(_finance => {
            if (idx < cata_mapping.length) {
              if ((_cat[INCOME_CATEGORY_ATTRIBUTES.LABEL] === _finance.data[FINANCE_ATTRIBUTES.CATEGORY]) && (checkALL === false)) {
                if ((moment().month() === moment(_finance.data[FINANCE_ATTRIBUTES.DATE]).month()) && moment().year() === moment(_finance.data[FINANCE_ATTRIBUTES.DATE]).year()) {
                  console.log("Now Month: ", moment().month(), ", ", "Year: ", moment().year());
                   console.log("Category: ", _finance.data[FINANCE_ATTRIBUTES.CATEGORY], ", "
                                ,"Special Month: ", new Date (_finance.data[FINANCE_ATTRIBUTES.DATE]).getMonth(), ", "
                                ,"financedata Year: ", moment(_finance.data[FINANCE_ATTRIBUTES.DATE]).year()
                  );
                  // moment().month() ==> 0 === Jan
                  // moment().month() = 0 + 1 ==> 1 === Feb 
                  // moment().month() ==> 0 + 2 = 2 Feb
                  // moment(finance.data.Date).month() ==>  0 === Jan, 1===Feb , 2=== Mar, 3=== Apr ......
                  // 0 + 2
                  count++;
                  let items = [...cata_mapping];
                  items[idx].amount += parseFloat(_finance.data[FINANCE_ATTRIBUTES.AMOUNT]);
                  setcata_mapping({Arr: items});
                }
              }
              if (count === finance.length) {
                  checkALL = true;
              }
              else {
                  checkALL = false;
              }
          }
        })))
    }

    Object.keys(cata_mapping).map((item, idx) => 
        {
            if (chartData.length < cata_mapping.length) {
                chartData.push(cata_mapping[item]);
            }
        }
    )

    const financeRecordIsZero = [{category: 'none of expense record', amount: 1}];
    // extract chartData label ("e.g Beauty"), push in array state chartLabel
    Object.keys(chartData).map(_keys => {
        if (chartLabel.length < chartData.length) {
            if (chartData[_keys].amount !== 0) {
                chartLabel.push(chartData[_keys][INCOME_CATEGORY_ATTRIBUTES.LABEL]);
            }
        }
    })

    // extract chartData amount, push in array state amountOfexpense
    Object.keys(chartData).map(_keys => {
        if (amountOfexpense.length < chartData.length) {
            if (chartData[_keys].amount !== 0) {
                amountOfexpense.push(chartData[_keys].amount);
            }
        }
    })


    const getData = async () => {
      await db_Finance.getCollection().then(item => {
        setFinance(item)
      })
      await db_ExpenseCat.getCollection().then(item => {
          setExpenseCatData(item)
      })
    }

    useEffect(() => {
      getData()
    }, [])

    const colors = [];
    for (var i = 0; i < chartLabel.length; i++) {
        colors.push('#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'));
    }

    
    return (
        <div>
            <section>
          {/* <canvas width={400} height={500} style="border:1px solid #000000;"> */}
            { ((chartLabel.length && amountOfexpense.length) !== 0) ?
              <Pie
                data={{
                  labels: chartLabel,
                  datasets: [
                    {
                      // label: "# of votes",
                      data: amountOfexpense,
                      backgroundColor: colors,
                      borderAlign: 'center',
                      hoverBorderColor: colors,
                      hoverOffset: 7,
                      hoverBorderWidth: 3
                      // hoverBackgroundColor: ,
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  layout: {
                    padding: {
                      right: 10,
                      bottom: 10
                    }
                  },
                  plugins: {
                    title: {
                      display: true,
                      position: 'top',
                      text: 'Expense Distribution Chart (Monthly)',
                      font:{
                        size: 18,
                        family: 'Raleway',
                      },
                      color: '#FFFFFF',
                      padding: {
                        top: 5,
                        bottom: 5,
                      }
                    },
                    subtitle: {
                      display: true,
                      font: {
                        size: 15,
                        family: 'Raleway',
                      },
                      text: moment().format("MMMM / Y"),
                      color: '#FFFFFF'
                    },
                    legend: {
                      display: true,
                      labels: {
                        color: '#FFFFFF'
                      }
                    }
                  }
                }}
                height={300}
                width={360}
              /> : // else show nono of finance record chart 
              <Pie
                data={{
                  labels: [financeRecordIsZero[0].category],
                  datasets: [
                    {
                      // label: "# of votes",
                      data: [financeRecordIsZero[0].amount],
                      backgroundColor: 'rgb(0,0,0,0.1)',
                      borderAlign: 'center',
                      hoverBorderColor: 'rgb(0,0,0,0.1)',
                      hoverOffset: 7,
                      hoverBorderWidth: 3
                      // hoverBackgroundColor: ,
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  layout: {
                    padding: {
                      right: 10,
                      bottom: 10
                    }
                  },
                  plugins: {
                    title: {
                      display: true,
                      position: 'top',
                      text: 'Expense Distribution Chart (Monthly)',
                      font:{
                        size: 18,
                        family: 'Raleway',
                      },
                      color: '#FFFFFF',
                      padding: {
                        top: 5,
                        bottom: 5,
                        // right: 5,
                      }
                    },
                    subtitle : {
                      display: true,
                      font:{
                        size: 15,
                        family: 'Raleway',
                      },
                      text: moment().format("MMMM / Y"),
                      color: '#FFFFFF'
                    },
                    legend: {
                      display: true,
                      labels: {
                        color: '#FFFFFF'
                      }
                    },
                  }
                }}
                height={300}
                width={360}
              /> 
            }
            {/* </canvas> */}
        </section>
        </div>
    );
  }