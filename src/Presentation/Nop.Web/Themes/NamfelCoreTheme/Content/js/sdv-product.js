// ShapeDiver Viewer Initialisation
var initSdvApp = function (/*event*/) {
  // settings can be defined here or as attributes of the viewport container
  // settings defined here take precedence
  let settings = {
    ticket: 'ad7f8b415e8e520f99133becbc185a08c8929a7540d1405acbb398b41e3fc53315f1bd62cc929101407f71ceb5017c6ffbf54b3762416c1410c11d2d82cc0f2f9b8d44ac947ea2043e501fcd66abc1fc38fb9de036318cd301d42ac943a4e310e57060ec6f0b4c229844f89b87096ea2978c18808293-c1858d6c06b7a0b6532a92750cb740ba',
    modelViewUrl: 'eu-central-1', // or 'us-east-1' or address of your own ShapeDiver model view server
    container: document.getElementById('sdv-container'),
    deferGeometryLoading: true, // tells the CommPlugin to not load default geometry, but wait for the first parameter update
  };
  // provide global access to the ShapeDiver Viewer API returned by the constructor
  window.api = new SDVApp.ParametricViewer(settings);

  // Register an event listener to get notified about the first parameter registration
  var token = api.parameters.addEventListener(api.parameters.EVENTTYPE.REGISTERED, function () {
    // be sure to deregister the event listener
    api.parameters.removeEventListener(token.data);
    // further parameter registrations might be pending in the event queue, therefore we append our first parameter update to the queue as well
    setTimeout(function () {
      api.parameters.updateAsync(getInitialParams());
    }, 0);

    setupUiChangeEvent();
  });
};
// there is a slight chance that loading has been completed already
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSdvApp, false);
} else {
  initSdvApp();
}

function getInitialParams() {

  var uiParams = [];
  var item;
  let parameters = api.parameters.get();

  for (let i = 0; i < parameters.data.length; i++) {
    let param = parameters.data[i];
    var element = $("[sdv-param-name='" + param.name + "']");
    if (element) {
      if (element.is("input")) {
        value = element.val();
      } else if (element.is("select")) {
        value = element.find('option:selected').html();
      } else if (element.is("ul")) {
        if (element.find("li.selected-value .color").css("background-color")) {
          value = rgb2hex(element.find("li.selected-value .color").css("background-color"));
        }
      } else {
        value = null;
      }

      if (value) {
        item = { name: param.name, value: value };
        uiParams.push(item);
      }
    }
  }
  return uiParams;
}

function setupUiChangeEvent() {
  let parameters = api.parameters.get();

  for (let i = 0; i < parameters.data.length; i++) {
    let param = parameters.data[i];
    var element = $("[sdv-param-name='" + param.name + "']");
    if (element) {
      if (element.is("input")) {
        if (param.type === "Int" || param.type === "Float" || param.type === "Even" || param.type === "Odd") {
          element.attr("min", param.min);
          element.attr("max", param.max);
          if (param.type === "Int") element.attr("step", 1);
          else if (param.type === "Even" || param.type === "Odd") element.attr("step", 2);
          else element.attr("step", 1 / Math.pow(10, param.decimalplaces));
        }
      }

      element.change({ id: param.id, elementId: element.attr("id") }, function (event) {
        $('#ddd-tab').trigger('click');
        let value;
        if ($(this).is("input")) {
          value = $(this).val();
          $('#rangelabel-' + event.data.elementId).text(value);
        } else if ($(this).is("select")) {
          value = $(this).find('option:selected').html();
        } else if ($(this).is("ul")) {
          if ($(this).find("li.selected-value .color").css("background-color")) {
            value = rgb2hex($(this).find("li.selected-value .color").css("background-color"));
          }
        }
        if (value) {
          console.log("id=" + event.data.id + " value changed to:" + value);
          api.parameters.updateAsync({
            id: event.data.id,
            value: value
          });
        }
      });
    }
  }
}

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
  var hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

