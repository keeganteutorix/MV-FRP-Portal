/* Query tool for the M.V corp fuel reimbursement spreadsheet
 *
 * Graph.gs - Builds a graph based on the provided filters.
 */

function makeGraphPanel(charName, state, afterDate, beforeDate) {
  //get the app and display panel
  var app = UiApp.getActiveApplication();
  var response = app.getElementById('queryResponsePanel');
  
  //create a panel to hold the graphs
  var graphPanel = app.createVerticalPanel();
  
  //build the provided parameters into query syntax
  var charNameStr = 'lower(B) like lower(\''+charName+'%\')';
  var afterDateStr = ' ';
  if (afterDate != undefined && afterDate != "") {
    afterDateStr += 'and todate(A) >= date \'' + afterDate + '\' ';
  } 
  var beforeDateStr = ' ';
  if (beforeDate != undefined && beforeDate != "") {
    beforeDateStr += 'and todate(A) <= date \'' + beforeDate + '\' ';
  } 
  var stateStr = ' ';
  if (state != "All") {
    stateStr += resolveState(state);
  }
  
  //encode the query language into a URI (to be added to a url)
  var query = encodeURIComponent('select todate(A), SUM(D) where ' 
                                 + charNameStr + afterDateStr + beforeDateStr + stateStr
                                 + ' group by todate(A)');
  
  // Build url to peform query
  var url = 'http://spreadsheets.google.com/tq?key=%KEY%&tq=%QUERY%'
          .replace('%KEY%',ssKey)
          .replace('%QUERY%',query);
  
  //create a vertical bar chart for displaying use by day
  var chartBuilder = Charts.newColumnChart()
      .setTitle('Fuel Use by Day')
      .setXAxisTitle('Date')
      .setYAxisTitle('Amount')
      .setDimensions(500, 400)
      .setLegendPosition(Charts.Position.NONE)
  //give it the url with query string so it can fetch the information
      .setDataSourceUrl(url);
  //turn it into an actual, displayable chart
  var columnChart = chartBuilder.build();

  
  //do it all again for the pie chart of fuel types
  
  //encode the query parameters 
  query = encodeURIComponent('select C, SUM(D) where ' 
                             + charNameStr + afterDateStr + beforeDateStr + stateStr
                             + ' group by C');

  //build the url
  url = 'http://spreadsheets.google.com/tq?key=%KEY%&tq=%QUERY%'
    .replace('%KEY%',ssKey)
    .replace('%QUERY%',query);
  
  //create the pie chart
  var pieChartBuilder = Charts.newPieChart()
    .setTitle('Fuel Used by Type')
    .setDimensions(500, 400)
    .set3D()
    .setDataSourceUrl(url);
  var pieChart = pieChartBuilder.build();

  //add both graphs to the display panel
  graphPanel.add(columnChart);
  graphPanel.add(pieChart);
  
  //pass the display panel back
  return graphPanel;
}

//Changes a state string into equivalent query language
function resolveState(state) {
  var retStr = "";
  if (state == "Unseen") {
    retStr += "and G = \'\' ";
  } else if (state == "Denied") {
    retStr += "and G = \'n\' ";
  } else if (state == "Approved") {
    retStr += "and G = \'y\' and H != \'y\' ";
  } else if (state == "Paid") {
    retStr += "and G = \'y\' and H = \'y\' ";
  } 
  return retStr;
}