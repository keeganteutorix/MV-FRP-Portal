/* Query tool for the M.V corp fuel reimbursement spreadsheet
 *
 * Table.gs - Builds a table of requests based on the provided filters.
 */ 

function makeTable(charName, reqState, afterDate, beforeDate) {
  //get the app and import data from the spreadsheet
  var app = UiApp.getActiveApplication();
  var doc = SpreadsheetApp.openById(ssKey);
  doc.setActiveSheet(doc.getSheetByName("FormResponses"));
  var data = doc.getDataRange().getValues();
  
  //create a table to put the filtered data into
  var table = app.createFlexTable();
  table.setStyleAttributes(css.table).setBorderWidth(3).setCellPadding(6)
  
  var count = 0;
  //add a title row to the table
  table.insertRow(count);
  table.setText(count, 0, "DateTime");
  table.setText(count, 1, "Character");
  table.setText(count, 2, "Fuel Type");
  table.setText(count, 3, "Amount");
  table.setText(count, 4, "State");
  table.setText(count, 5, "Notes");
  count++;

  //loop through the imported spreadsheet data
  for (var i in data) {
    //filter based on the parameters passed into the function
    //filter by character name
    if (charName == "" || data[i][1].toLowerCase().indexOf(charName.toLowerCase()) > -1) {
      //filter by the state of the request
      var state = getStateString(data[i][6], data[i][7]);
      if ((reqState == state || reqState == "All")) {
        //filter by date of the request
        if (data[i][0].valueOf() >= parseDate(afterDate).valueOf() || (afterDate == undefined || afterDate == "")) {
          if (data[i][0].valueOf() <= (parseDate(beforeDate).valueOf() + 86400000) || (beforeDate == undefined || beforeDate == "")) {
            //if an entry matches all the filters, add it to the table
            table.insertRow(count);
            table.setText(count, 0, data[i][0].format("UTC:yyyy-mm-dd HH:MM:ss"));
            table.setText(count, 1, data[i][1]);
            table.setText(count, 2, data[i][2]);
            //fun color stuff for fuel type
            table.setStyleAttribute(count, 2, 'backgroundColor', colorByFuelType(data[i][2]));
            table.setStyleAttribute(count, 2, 'color', "black");
            table.setText(count, 3, data[i][3]);
            table.setText(count, 4, state);
            table.setWidget(count, 5, app.createLabel(data[i][8]));
            count++;
          }
        }
      }
    }
  }
  //and pass the table back
  return table;
}

//Changes two status variables into a single word state for clearer display
function getStateString(isApproved, isPaid) {
  if (isApproved == 'y') {
    if (isPaid == 'y') {
      return "Paid"; 
    } else {
      return "Approved"; 
    }
  } else if (isApproved == 'n') {
    return "Denied";
  } else {
    return "Unseen";
  }
}

//returns the background color associated with each fuel type
function colorByFuelType(fuelType) {
  var color = "white";
  if (fuelType == "Nitrogen") {
    color = "red";
  } else if (fuelType == "Helium") {
    color = "orange";
  } else if (fuelType == "Oxygen") {
    color = "yellow";
  } else if (fuelType == "Hydrogen") {
    color = "lime";
  }
  return color;
}
