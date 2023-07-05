import React, { useState, useEffect, Component } from "react";
import { Doughnut, Line, Bar, Pie } from "react-chartjs-2";
// import { Pie } from "react-chartjs-2";
// import { Bar } from "react-chartjs-2";
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES, FIN_FORM_MODE } from '../../api/CollectionFinanceAPI'
import axios from 'axios'
import { CollectionIncomeCatAPI, INCOME_CATEGORY_ATTRIBUTES, preset_incomeCategory } from "../../api/CollectionIncomeCatAPI";
import { CollectionExpenseCatAPI } from "../../api/CollectionExpenseCatAPI";
import moment from 'moment';
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
    SubTitle,
  } from 'chart.js';
import { fontSize, fontWeight, keys } from "@mui/system";
import { plugins } from "pretty-format";

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



// const B_Chart = () => {
//     return (
//       <Line
//         data={{
//           labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//           datasets: [
//             {
//               label: "# of votes",
//               data: [12, 19, 3, 5, 2, 3]
//             }
//           ]
//         }}
//         options={{
//           maintainAspectRatio: false,
//           responsive: true,
//         }}
//         height={200}
//         width={100}
        
//       />
//     );
//   };

export function IncomeChart() {
  const db_Finance = new CollectionFinanceAPI();
  const db_IncomeCat = new CollectionIncomeCatAPI();
  // const db_ExpenseCat = new CollectionExpenseCatAPI();


  const [finance, setFinance] = useState([]);
  const [IncomeCatData, setIncomeCatData] = useState([]);

  // const [chartData, setChartData] = useState([]);
  const chartData = [];

  // For show Income Category Name
  const [chartLabel, setChartLabel] = useState([]);
  // For show the number of Income Category
  const [amountOfincome, setAmountOfincome] = useState([]);
  
  // var _Data = IncomeCatData.reduce((obj, item) => (
  //   {...obj, [item.data[INCOME_CATEGORY_ATTRIBUTES.VALUE]]: 0}), {}
  // )

  // for(var i = 0; i < _Data.len)

  
  
  // 1. Fetch data from Income category localbase
  // 2. And store in state (cat_mapping)
  const [cata_mapping, setcata_mapping] = useState([]);
  
  var checkALL = false;
  console.log("_____Income_category_length: ", IncomeCatData.length)
  console.log("______cat_length: ", cata_mapping.length)
  if (cata_mapping.length !== undefined) {
    console.log("222222222222222222")
    var IncomeCatArray = IncomeCatData.forEach(_keys => {
      if ((cata_mapping.length === 0 || cata_mapping.length < IncomeCatData.length) && checkALL !== true) {
        console.log("1111111111111")
        cata_mapping.push({
          // [INCOME_CATEGORY_ATTRIBUTES.VALUE]:_keys.data[INCOME_CATEGORY_ATTRIBUTES.VALUE],
          [INCOME_CATEGORY_ATTRIBUTES.LABEL]:_keys.data[INCOME_CATEGORY_ATTRIBUTES.LABEL],
          amount: 0
        })
      }
    })
  }else{
    console.log("WWWWWWW!!");
  }

  console.log("CAT_MAPPING: ", cata_mapping)
  finance.map(item => {console.log("finance: ", item.data[FINANCE_ATTRIBUTES.CATEGORY])})
  if (cata_mapping.length > 0) {
    cata_mapping.map(item => {console.log("CATMAPPING: ", item[INCOME_CATEGORY_ATTRIBUTES.VALUE])})
  }
  
  
  if (cata_mapping.length > 0){
    console.log("Income_category_length: ", IncomeCatData.length)
    console.log("cat_length: ", cata_mapping.length)
    cata_mapping.map((item, index) => {
      console.log("item value:", item[INCOME_CATEGORY_ATTRIBUTES.VALUE], ", Paricular amount: ", cata_mapping[index].amount);
      // console.log("item: ", item)
    })
    // console.log("p_amount: ", cata_mapping[0].amount)
  }
  //   var string_a = 'Kiwi'
  //   var string_b = 'Martin'
  //   /* Expected Returns:
  //   0:  exact match
  //   -1:  string_a < string_b
  //   1:  string_a > string_b
  //   */
  //   console.log("test compare:", string_a.localeCompare(string_b))

  // 2. Fetch finance record data from localbase (finance state)
  //     and use finance.category attribute to do the comparison
  finance.map(item => {
    console.log("Finance:", item.data[FINANCE_ATTRIBUTES.AMOUNT])
  })
  
  // console.log("____cat_mapping: ", cata_mapping)
  // 3. Do the comparison, and count
  var count = 0;
  if (cata_mapping.length > 0) {
    cata_mapping.forEach((_cat,idx) => (finance.forEach(_finance => {
      // console.log("COMPARE")
      if (idx < cata_mapping.length) {
        if((_cat[INCOME_CATEGORY_ATTRIBUTES.LABEL] === _finance.data[FINANCE_ATTRIBUTES.CATEGORY]) && (checkALL === false)){
          if ((moment().month() === moment(_finance.data[FINANCE_ATTRIBUTES.DATE]).month()) && moment().year() === moment(_finance.data[FINANCE_ATTRIBUTES.DATE]).year()) {
          count++;
          console.log("match")
          // console.log(_finance.data[FINANCE_ATTRIBUTES.CATEGORY], "Find!!!")
          // var newArr = [...cata_mapping];
          // const newArr = [...cata_mapping];
          // newArr[idx].amount = (++cata_mapping[idx].amount);
          // setcata_mapping(newArr); 
          // const newTodos = [...cata_mapping, {[cata_mapping[idx].amount]: 2}]
          // {newTodos[idx].amount: (++cata_mapping[idx].amount)};
          // return {...cata_mapping, amout: (++cata_mapping[idx].amount)}
          //setcata_mapping({


          // 1. Make a shallow copy of the items
          // let items = cata_mapping.slice();
          let items = [...cata_mapping];
          console.log("ITEMS: ", items)
          
          // 2. Make a shallow copy of the item you want to mutate
          // let item = {...cata_mapping[idx]};
          // console.log("item: ", item)
          // 3. Replace the property you're intested in
          items[idx].amount += parseFloat(_finance.data[FINANCE_ATTRIBUTES.AMOUNT]);
          // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
          // items[idx] = item;
          // 5. Set the state to our new copy
          setcata_mapping({Arr: items});
          

          // var stateCopy = Object.assign({}, cata_mapping);
          // stateCopy[idx].amount += 1;
          // setcata_mapping(stateCopy);


            // ...cata_mapping, 
            // [cata_mapping[idx].amount]: (++cata_mapping[idx].amount),
          //});
          console.log("_cat value: ", _cat[INCOME_CATEGORY_ATTRIBUTES.VALUE], ",Paricular amount: ", cata_mapping[idx].amount);
          }
        }
        
        if (count === finance.length) {
          checkALL = true;
          console.log("checkALL is true")
        }
        else {
          checkALL = false;
          console.log("checkALL is false")
        }
      }
    })))
  }
  else {
    console.log("CCCCCCCCCCCCCCC")
  }
  // setcata_mapping(cata_mapping)
  console.log("count", count);
  // if (cata_mapping.Arr.length > 0) {
  if (cata_mapping.length > 0) {
    cata_mapping.map((item,idx) => 
      console.log("updateState: ", item)
    )
  }

  var newArr;
  Object.keys(cata_mapping).map((item,idx) => 
    {
      console.log("KSUDUD: ", cata_mapping[item]);
      // newArr = chartData.concat(cata_mapping[item])
      if (chartData.length < cata_mapping.length){
        // if ()
        chartData.push(cata_mapping[item]);
      }
      // console.log("chartData: ", chartData);
      // chartData.push(cata_mapping[item]);
    }
  )
  // console.log("chartData____: ", chartData.amount);
// extract chartData label ("e.g. Bank"), push in array state chartLabel
  const financeRecordIsZero = [{category: 'none of Income record', amount: 1}];

  Object.keys(chartData).map(_keys => {
    console.log("SHOW CHARDATA ARR: ", chartData[_keys]);
    if (chartLabel.length < chartData.length) {
      if (chartData[_keys].amount !== 0) {
        chartLabel.push(chartData[_keys][INCOME_CATEGORY_ATTRIBUTES.LABEL]);
      }
    }
  })
  console.log("financeRecordIsZero: ",[financeRecordIsZero[0].category]);
  // if (chartLabel.length === 0) {
  //   chartLabel.push(financeRecordIsZero[0].category);
  // }

// extract chartData amount, push in array state amountOfincome
  Object.keys(chartData).map(_keys => {
    if (amountOfincome.length < chartData.length){
      if (chartData[_keys].amount !== 0) {
        amountOfincome.push(chartData[_keys].amount);
      }
    }
  })
  // if (amountOfincome.length === 0) {
  //   amountOfincome.push(financeRecordIsZero[0].amount);
  // }
 
  
  Object.keys(chartData).map(_keys => console.log("Test: ", [chartData[_keys][INCOME_CATEGORY_ATTRIBUTES.VALUE]]))
  // console.log("KEYS_____: ", keys);
  chartData.map((item, idx) => {
    console.log("dIDJIJDI: ", chartData[idx][INCOME_CATEGORY_ATTRIBUTES.VALUE],
      ", AMOUNT: ", chartData[idx].amount
    );
  });
  console.log("CHART: ", chartData.length);
  console.log("CHART___LABEL:", chartLabel);
  console.log("amountOfincome: ", amountOfincome);
  // }
  // console.log("INCOMECATARRY: ", IncomeCatArray)

  // const D_Chart = () => {
  //   return (
  //     <Doughnut
  //       data={{
  //         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  //         datasets: [
  //           {
  //             label: "# of votes",
  //             data: [12, 19, 3, 5, 2, 3]
  //           }
  //         ]
  //       }}
  //       options={{
  //         maintainAspectRatio: false,
  //         responsive: true,
  //         plugins: {
  //           title: {
  //             display: true,
  //             position: 'top',
  //             text: 'Expense Distribution Chart',
  //             font:{
  //               size: 20,
  //               family: 'Raleway',
  //             },
  //             color: '#000000',
  //             // padding: {
  //             //   top: 5,
  //             //   bottom: 10,
  //             // }
  //           },
  //         }
  //       }}
  //       height={300}
  //       width={200}
  //     />
  //   );
  // };
  const getData = async() => {
    await db_Finance.getCollection().then(item => {
      setFinance(item)
    });
    await db_IncomeCat.getCollection().then(item => {
      setIncomeCatData(item)
    });
  }
  useEffect(() => {
    getData()
    // console.log("cata_mapping: ", cata_mapping)
    // console.log("IncomeCatData: ", IncomeCatData)
  }, [])

  // Generate a random colors base on the number of label (category)
  const colors = [];
  for (var i = 0; i < chartLabel.length; i++){
    colors.push('#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'));
  }
 
  return (
    <div>
        <section>
          {/* <canvas width={400} height={500}> */}
          { ((chartLabel.length && amountOfincome.length) !== 0) ?
            <Pie
              data={{
                labels: chartLabel,
                datasets: [
                  {
                    // label: "# of votes",
                    data: amountOfincome,
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
                  padding : {
                    right: 10,
                    bottom: 10
                  }
                },
                plugins: {
                  // legend:{ position: 'right'},
                  title: {
                    display: true,
                    position: 'top',
                    text: 'Income Distribution Chart (Monthly)', //, moment().format("MMMM") + '/' + moment().year()],
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
                  subtitle : {
                    display: true,
                    font:{
                      size: 15,
                      family: 'Raleway',
                    },
                    text: moment().format("MMMM / Y"),
                    color: '#FFFFFF',
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
                  // legend:{ position: 'right'},
                  title: {
                    display: true,
                    position: 'top',
                    text: 'Income Distribution Chart (Monthly)',
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
                      color: '#FFFFFF',
                      // font: {
                      //   size: 12,
                      //   weight: 500
                      // }
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
