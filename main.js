

var scaleFactorForDot = 0.4;
var screenRes = Math.sqrt ((window.screen.availHeight*window.screen.availHeight)+(window.screen.availWidth*window.screen.availWidth));
var dotScale = parseFloat(window.devicePixelRatio*scaleFactorForDot);
var scaleFactorForHitTolerance=1/100;
var hitTol = parseFloat(screenRes*scaleFactorForHitTolerance);
var textLabels = false;
var largeMarkers = false;

var featureStyle = function(feature) {
  var imageStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
          color: feature.get("marker-color"),
          crossOrigin: 'anonymous',
          src: 'data/dot.png',
          scale: dotScale
        }))
   });
  
  var labelFillColor = '#fff';
  if (feature.get('bookId') == 'NW' || feature.get('bookId') == 'OF' || feature.get('bookId') == 'S') {
  	  labelFillColor = '#444';
  }
  var yOffset = -12 * window.devicePixelRatio;
  if (largeMarkers) {
  	  yOffset = -18 * window.devicePixelRatio;
  }
  var labelStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
          color: feature.get("marker-color"),
          crossOrigin: 'anonymous',
          src: 'data/dot.png',
          scale: dotScale
        })),
        text: new ol.style.Text({
          font: "" + window.devicePixelRatio * 14 + "px Calibri,sans-serif",
          overflow: true,
          fill: new ol.style.Fill({
            color: labelFillColor
          }),
          stroke: new ol.style.Stroke({
            color: feature.get("marker-color"),
            width: 2
          }),
          offsetX: 0,
          offsetY: yOffset,
          text: feature.get('wotaId')
        })
  });
 
  var style = imageStyle;
  if (textLabels) {
  	  style = labelStyle;
  }
  return style;
}

var summits = new ol.layer.Vector({
	source: new ol.source.Vector({
	  url: 'data/summits.json',
	  format: new ol.format.GeoJSON()
	}),
	style: featureStyle
});
     

var openCycleMapLayer = new ol.layer.Tile({
	source: new ol.source.OSM({
	  attributions: [
		'All maps © <a href="https:www.opencyclemap.org/">OpenCycleMap</a>',
		ol.source.ATTRIBUTION
	  ],
	  url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c08210aeeb8644feb553d1982c78ec9b'
	})
});

var openLandscapeMapLayer = new ol.layer.Tile({
	source: new ol.source.OSM({
	  attributions: [
		'All maps © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
	  ],
	  url: 'https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=c08210aeeb8644feb553d1982c78ec9b'
	})
});
 
 var scaleLineControl = new ol.control.ScaleLine({
 	minWidth: 128
 });
 var units = "metric";
 
var map = new ol.Map({
  controls: ol.control.defaults().extend([
	new ol.control.FullScreen(), scaleLineControl
  ]),		
  target: 'map',
  layers: [
    //new ol.layer.Tile({source: new ol.source.OSM()}),
    //openCycleMapLayer,
    openLandscapeMapLayer,
    summits
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-3.03, 54.47]),
    zoom: 10
  })
});

 var popupElement = document.getElementById('popup');
 var popupActive = false;
 var controlElement = document.getElementById('controls');
 
 var popup = new ol.Overlay({
	element: popupElement,
	positioning: 'bottom-center',
	stopEvent: false,
	offset: [0, 0]
 });
 map.addOverlay(popup);

 
 //display popup on click
 map.on('click', function(evt) {
	var feature = map.forEachFeatureAtPixel(evt.pixel,
	  function(feature) {
		return feature;
	  }, {
        hitTolerance: hitTol
      });
	if (feature) {
	  var coordinates = feature.getGeometry().getCoordinates();
	  popup.setPosition(coordinates);
	  var wotaId = feature.get("wotaId");
	  var wotaPageRef = wotaId;
	  
	  var wotaFields = wotaId.split('-');
	  var wotaSeries = wotaFields[0];
	  if (wotaSeries == "LDO") {
		  var wotaRefNumber = Number(wotaFields[1]);
	  	  wotaRefNumber = wotaRefNumber + 214;
	  	  wotaPageRef = wotaSeries + "-" + wotaRefNumber;
	  }
	  
	  var tableHead = "<table><tbody>";
	  var body = "<tr><td style='color: " + feature.get("marker-color") + "'>" + feature.get('book') + "</td></tr>" + 
	   "<tr><td><a href='http://wota.org.uk/MM_" + wotaPageRef + "' target='_blank' rel='noopener noreferrer'>" + feature.get('wotaId') + ": " + feature.get('title') + "</a></td></tr>" +
	   "<tr><td>Height: " + feature.get('height') + ", Locator: " + feature.get('qthLocator') + "</td></tr>" +
	   "<tr><td>Grid: " + feature.get('gridRef') + "</td></tr>";
	   var sota = "";
	   if (feature.get('sotaId') != "") {
	   	   sota = "SOTA ID: <a href='https://summits.sota.org.uk/summit/" + feature.get('sotaId') + "' target='_blank' rel='noopener noreferrer'>" + feature.get('sotaId') + "</a>";
	   }
	   var hump = "";
	   if (feature.get('humpId') != "") {
	   	   hump = "Hump ID: <a href='http://hema.org.uk/fullSummit.jsp?summitKey=" + feature.get('hillBaggingId') + "' target='_blank' rel='noopener noreferrer'>" + feature.get('humpId') + "</a>";
	   }
	   var refs = "";
	   if (sota != "" || hump != "") {
	   	   refs = "<tr><td>";
	   	   if (sota != "") {
	   	   	   refs = refs + sota;
	   	   	   if (hump != "") {
	   	   	   	   refs = refs + ", ";
	   	   	   }
	   	   }
	   	   refs = refs + hump + "</td></tr>";
	   }
	   var tableFoot = "</tbody></table>";
	   var content = tableHead + body + refs + tableFoot;
	  if (popupActive) {
	  	  document.getElementsByClassName("popover-content")[0].innerHTML = content;
	  } else {	  
		  $(popupElement).popover({
			placement: 'top',
			html: true,
			content: content
		  });
		  $(popupElement).popover('show');
		  popupActive = true;
	  }
	} else {
	  $(popupElement).popover('destroy');
	  popupActive = false;
	}
 });
 

 //change mouse cursor when over marker
 map.on('pointermove', function(e) {
	if (e.dragging) {
	  $(popupElement).popover('destroy');
	  popupActive = false;
	  return;
	}
	var pixel = map.getEventPixel(e.originalEvent);
	var hit = map.hasFeatureAtPixel(pixel);
	//map.getTarget().style.cursor = hit ? 'pointer' : '';
 });
 
  document.getElementById('export-png').addEventListener('click', function() {
	map.once('rendercomplete', function(event) {
	  var canvas = event.context.canvas;
	  if (navigator.msSaveBlob) {
		navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
	  } else {
		canvas.toBlob(function(blob) {
		  saveAs(blob, 'map.png');
		});
	  }
	});
	map.renderSync();
  });
  
  var dims = {
	a0: [1189, 841],
	a1: [841, 594],
	a2: [594, 420],
	a3: [420, 297],
	a4: [297, 210],
	a5: [210, 148]
  };
  var exportPdfButton = document.getElementById('export-pdf');
  exportPdfButton.addEventListener('click', function() {

	exportPdfButton.disabled = true;
	document.body.style.cursor = 'progress';

	var format = "a4";
	var resolution = 150;
	var dim = dims[format];
	var width = Math.round(dim[0] * resolution / 25.4);
	var height = Math.round(dim[1] * resolution / 25.4);
	var size = /** @type {module:ol/size~Size} */ (map.getSize());
	var extent = map.getView().calculateExtent(size);

	map.once('rendercomplete', function(event) {
	  var canvas = event.context.canvas;
	  var data = canvas.toDataURL('image/jpeg');
	  var pdf = new jsPDF('landscape', undefined, format);
	  pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
	  pdf.save('map.pdf');
	  // Reset original map size
	  map.setSize(size);
	  map.getView().fit(extent, {size: size});
	  exportPdfButton.disabled = false;
	  document.body.style.cursor = 'auto';
	});

	// Set print size
	var printSize = [width, height];
	map.setSize(printSize);
	map.getView().fit(extent, {size: printSize});

  }, false);
  
  var unitsButton = document.getElementById('set-units');
  unitsButton.addEventListener('click', function() {
		  if (units == "metric") {
			  units = "imperial";
		  } else {
			  units = "metric";
		  }
			 
		  scaleLineControl.setUnits(units);
  });
  
  var markerSizeButton = document.getElementById('marker-size');
  markerSizeButton.addEventListener('click', function() {
  		  var zoom = 1;
		  if (largeMarkers) {
		  	  largeMarkers = false;
		  	  scaleFactorForDot = 0.4;
		  	  zoom = -1;
		  } else {
		  	  scaleFactorForDot = 0.75;
		  	  largeMarkers = true;
		  }
		  dotScale = parseFloat(window.devicePixelRatio*scaleFactorForDot);
		  map.getView().animate({zoom: map.getView().getZoom()+zoom});
  });
  
  var textLabelsButton = document.getElementById('text-labels');
  textLabelsButton.addEventListener('click', function() {
  		  var zoom = 1;
		  if (textLabels) {
		  	  textLabels = false;
		  	  zoom = -1;
		  } else {
		  	  textLabels = true;
		  }
		  map.getView().animate({zoom: map.getView().getZoom()+zoom});
  })