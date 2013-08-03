/* Query tool for the M.V corp fuel reimbursement spreadsheet
 *
 * UI.gs - Handles the display functions that determine what the user sees.
 */ 

var ssKey = *sekrit*;

//Called when the site recieves a get request (entry point)
function doGet(e) {
  //create the ui application
  var app = UiApp.createApplication().setTitle('M.V Feul Request Portal')
  //set the background color
  app.setStyleAttribute('backgroundColor', 'black');
  
  //add the M.V banner
  var logo = app.createImage('http://www.macabre-votum.com/forums/styles/eMuza2/theme/images/logo.jpg');
  logo.setStyleAttributes(css.image);
  app.add(logo);
  
  //Add the title text
  var title = app.createLabel("M.V Feul Request Portal");
  title.setStyleAttributes(css.title).setHorizontalAlignment(UiApp.HorizontalAlignment.CENTER);
  app.add(title);
  
  //create the ui panel that holds all other ui elements
  var appPanel = app.createVerticalPanel().setId('appPanel');
  appPanel.setStyleAttributes(css.body);
  app.add(appPanel);
  
  //build and display the query form
  displayForm();
  
  return app;
}

//Builds the form used to enter query parameters
function displayForm() {
  //get the app and display panel
  var app = UiApp.getActiveApplication();
  var appPanel = app.getElementById('appPanel');
  appPanel.clear();
  appPanel.setHorizontalAlignment(UiApp.HorizontalAlignment.LEFT);

  //create the form and submit button
  var form = app.createFormPanel();
  var summbitButton = app.createSubmitButton('Run Query');
  summbitButton.setEnabled(false).setStyleAttributes(css.button3);
  
  //create an element for entering character name
  var reqLabel = app.createLabel(' * Required (Min 3 letters)').setStyleAttributes(css.label_note);
  var charLabel = app.createLabel('Character ').setStyleAttributes(css.label);
  var charTextBox = app.createTextBox().setName('characterName');
  //require the entry to be at least 3 characters long before the form can be submitted
  charTextBox.addChangeHandler(app.createClientHandler().validateLength(charTextBox, 3, 100)
             .forTargets(summbitButton).setEnabled(true).forTargets(reqLabel).setVisible(false));
  charTextBox.addChangeHandler(app.createClientHandler().validateNotLength(charTextBox, 3, 100)
             .forTargets(summbitButton).setEnabled(false).forTargets(reqLabel).setVisible(true));
  //put the note about required length next to the character name label
  var charLabelPanel = app.createHorizontalPanel();
  charLabelPanel.setSpacing(1).setVerticalAlignment(UiApp.VerticalAlignment.MIDDLE)
                .add(charLabel).add(app.createLabel("")).add(app.createLabel(""))
                .add(app.createLabel("")).add(app.createLabel("")).add(reqLabel);
  
  //create an element for selecting the state of requests
  var stateLabel = app.createLabel('State').setStyleAttributes(css.label);
  var stateDropDown = app.createListBox(false).setName('reqState');
  stateDropDown.addItem("All")
               .addItem("Unseen")
               .addItem("Denied")
               .addItem("Approved")
               .addItem("Paid");
  
  //create elements for entering bounding dates
  var afterDateBoxLabel = app.createLabel('On or After').setStyleAttributes(css.label);
  var afterDateBox = app.createDateBox().setName('afterDatebox');
  
  var beforeDateBoxLabel = app.createLabel('Before or On').setStyleAttributes(css.label);
  var beforeDateBox = app.createDateBox().setName('beforeDatebox');
  
  //create check boxes for selecting what you see as a result of the query
  var showGraphs = app.createCheckBox("Graphs").setStyleAttribute('color', 'white');
  showGraphs.setName('graphCB').setValue(false);
  var showTable = app.createCheckBox("Table").setStyleAttribute('color', 'white')
  showTable.setName('tableCB').setValue(true);
  var showLabel = app.createLabel("Show").setStyleAttributes(css.label);
  var showPanel = app.createHorizontalPanel().setSpacing(3);
  showPanel.add(showGraphs).add(showTable);
  
  //create panel for everything to sit in
  var formContent = app.createVerticalPanel().setSpacing(12);
  
  //add all the stuff to that panel
  formContent.add(charLabelPanel);
  formContent.add(charTextBox);
  
  formContent.add(app.createLabel(""));
  formContent.add(app.createLabel(""));
  
  formContent.add(stateLabel);
  formContent.add(stateDropDown);
  
  formContent.add(app.createLabel(""));
  formContent.add(app.createLabel(""));
  
  formContent.add(afterDateBoxLabel);
  formContent.add(afterDateBox);
  
  formContent.add(app.createLabel(""));
  formContent.add(app.createLabel(""));
  
  formContent.add(beforeDateBoxLabel);
  formContent.add(beforeDateBox);

  formContent.add(app.createLabel(""));
  formContent.add(app.createLabel(""));
  
  formContent.add(showLabel);
  formContent.add(showPanel);
  
  formContent.add(app.createLabel(""));
  formContent.add(app.createLabel(""));
  
  formContent.add(summbitButton);
  
  //add the content panel to the form
  form.add(formContent);
  
  //add the form to the display panel
  appPanel.add(form);
  return app;
}

//Called when the user sumbits the form (by click the sumbit button labelled "Run Query")
function doPost(e) {
  //get the app and display panel
  var app = UiApp.getActiveApplication();
  var appPanel = app.getElementById('appPanel');
  //clear the display panel of the form to make way for the response
  appPanel.clear()
  
  //add a button to go back to the beginning and run another query
  var buttonPanel = app.createHorizontalPanel();
  var newQueryButton = app.createButton('Run Another Query', app.createServerClickHandler('displayForm'));
  newQueryButton.setStyleAttributes(css.button2);
  buttonPanel.add(newQueryButton);
  appPanel.add(buttonPanel);
  appPanel.setHorizontalAlignment(UiApp.HorizontalAlignment.CENTER);
  
  //create a panel to organize and display the response on
  var queryResponsePanel = app.createVerticalPanel().setId('queryResponsePanel');
  queryResponsePanel.setHorizontalAlignment(UiApp.HorizontalAlignment.CENTER);
  
  //get the relevant inforamtion from the form (passed in as 'e')
  var charName = e.parameter.characterName;
  var reqState = e.parameter.reqState;
  var afterDate = e.parameter.afterDatebox;
  var beforeDate = e.parameter.beforeDatebox;
  
  //if the user asked for graphs, make graphs
  if (e.parameter.graphCB == "on") {
    //see file "Graph.gs"
    var graphPanel = makeGraphPanel(charName, reqState, afterDate, beforeDate);
    queryResponsePanel.add(graphPanel);
  }
  
  //if the user asked for a table, make the table
  if (e.parameter.tableCB == "on") {
    //see file "Table.gs"
    var table = makeTable(charName, reqState, afterDate, beforeDate);
    queryResponsePanel.add(table);
  }

  //add the response panel to the display panel so the user can see it
  appPanel.add(queryResponsePanel);
  return app;
}
