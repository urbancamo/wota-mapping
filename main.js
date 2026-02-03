const isMobile = window.innerWidth <= 768;
let scaleFactorForDot = isMobile ? 0.25 : 0.4;
const screenRes = Math.sqrt((window.screen.availHeight * window.screen.availHeight) + (window.screen.availWidth * window.screen.availWidth));
let dotScale = window.devicePixelRatio * scaleFactorForDot;
const scaleFactorForHitTolerance = isMobile ? 1 / 50 : 1 / 100;
const hitTol = screenRes * scaleFactorForHitTolerance;
let textLabels = false;
let largeMarkers = false;

const featureStyle = function (feature) {
    const matchesFilter = feature.get('matchesFilter');
    const markerColor = matchesFilter === false ? '#cccccc' : feature.get("marker-color");

    const imageStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            color: markerColor,
            crossOrigin: 'anonymous',
            src: 'data/dot.png',
            scale: dotScale,
            opacity: matchesFilter === false ? 0.5 : 1.0
        }))
    });

    let labelFillColor = '#fff';
    if (matchesFilter === false) {
        labelFillColor = '#999';
    } else if (feature.get('bookId') === 'NW' || feature.get('bookId') === 'OF' || feature.get('bookId') === 'S') {
        labelFillColor = '#444';
    }
    let yOffset = -12 * window.devicePixelRatio;
    if (largeMarkers) {
        yOffset = -18 * window.devicePixelRatio;
    }
    const labelStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            color: markerColor,
            crossOrigin: 'anonymous',
            src: 'data/dot.png',
            scale: dotScale,
            opacity: matchesFilter === false ? 0.5 : 1.0
        })),
        text: new ol.style.Text({
            font: "" + window.devicePixelRatio * 14 + "px Calibri,sans-serif",
            overflow: true,
            fill: new ol.style.Fill({
                color: labelFillColor
            }),
            stroke: new ol.style.Stroke({
                color: markerColor,
                width: 2
            }),
            offsetX: 0,
            offsetY: yOffset,
            text: feature.get('wotaId')
        })
    });

    let style = imageStyle;
    if (textLabels) {
        style = labelStyle;
    }
    return style;
};

const summits = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: featureStyle
});

const openLandscapeMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
        attributions: [
            'All maps © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        ],
        url: 'https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=c08210aeeb8644feb553d1982c78ec9b'
    })
});

const scaleLineControl = new ol.control.ScaleLine({
    minWidth: 128
});
let units = "metric";

const map = new ol.Map({
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

const popupElement = document.getElementById('popup');
let popupActive = false;

const popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: true,
    offset: [0, 0]
});
map.addOverlay(popup);

map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
            return feature;
        }, {
            hitTolerance: hitTol
        });
    if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        popup.setPosition(coordinates);
        const wotaId = feature.get("wotaId");
        let wotaPageRef = wotaId;

        const wotaFields = wotaId.split('-');
        const wotaSeries = wotaFields[0];
        if (wotaSeries === "LDO") {
            let wotaRefNumber = Number(wotaFields[1]);
            wotaRefNumber = wotaRefNumber + 214;
            wotaPageRef = wotaSeries + "-" + wotaRefNumber;
        }

        const tableHead = "<table><tbody>";
        const body = "<tr><td style='color: " + feature.get("marker-color") + "'>" + feature.get('book') + "</td></tr>" +
            "<tr><td><a href='http://wota.org.uk/MM_" + wotaPageRef + "' target='_blank' rel='noopener noreferrer'>" + feature.get('wotaId') + ": " + feature.get('title') + "</a></td></tr>" +
            "<tr><td>Height: " + feature.get('height') + ", Locator: " + feature.get('qthLocator') + "</td></tr>" +
            "<tr><td>Grid: " + feature.get('gridRef') + "</td></tr>";

        let activation = "";
        const lastActBy = feature.get('last_act_by');
        const lastActDate = feature.get('last_act_date');
        if (lastActBy && lastActDate) {
            activation = "<tr><td><em>Last activated by " + lastActBy + " on " + lastActDate + "</em></td></tr>";
        } else if (feature.get('matchesFilter') !== false) {
            activation = "<tr><td><em>Never activated</em></td></tr>";
        }

        let sota = "";
        if (feature.get('sotaId') !== "") {
            sota = "SOTA ID: <a href='https://summits.sota.org.uk/summit/" + feature.get('sotaId') + "' target='_blank' rel='noopener noreferrer'>" + feature.get('sotaId') + "</a>";
        }
        let hump = "";
        if (feature.get('humpId') !== "") {
            hump = "Hump ID: <a href='http://hema.org.uk/fullSummit.jsp?summitKey=" + feature.get('hillBaggingId') + "' target='_blank' rel='noopener noreferrer'>" + feature.get('humpId') + "</a>";
        }
        let refs = "";
        if (sota !== "" || hump !== "") {
            refs = "<tr><td>";
            if (sota !== "") {
                refs = refs + sota;
                if (hump !== "") {
                    refs = refs + ", ";
                }
            }
            refs = refs + hump + "</td></tr>";
        }
        const tableFoot = "</tbody></table>";
        const content = tableHead + body + activation + refs + tableFoot;
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
map.on('pointermove', function (e) {
    if (e.dragging) {
        $(popupElement).popover('destroy');
        popupActive = false;
    }
});

document.getElementById('export-png').addEventListener('click', function () {
    map.once('rendercomplete', function (event) {
        const canvas = event.context.canvas;
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
        } else {
            canvas.toBlob(function (blob) {
                saveAs(blob, 'map.png');
            });
        }
    });
    map.renderSync();
});

const dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148]
};
const exportPdfButton = document.getElementById('export-pdf');
exportPdfButton.addEventListener('click', function () {

    exportPdfButton.disabled = true;
    document.body.style.cursor = 'progress';

    const format = "a4";
    const resolution = 150;
    const dim = dims[format];
    const width = Math.round(dim[0] * resolution / 25.4);
    const height = Math.round(dim[1] * resolution / 25.4);
    const size = map.getSize();
    const extent = map.getView().calculateExtent(size);

    map.once('rendercomplete', function (event) {
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
    const printSize = [width, height];
    map.setSize(printSize);
    map.getView().fit(extent, {size: printSize});

}, false);

const unitsButton = document.getElementById('set-units');
unitsButton.addEventListener('click', function () {
    if (units === "metric") {
        units = "imperial";
    } else {
        units = "metric";
    }

    scaleLineControl.setUnits(units);
});

const markerSizeButton = document.getElementById('marker-size');
markerSizeButton.addEventListener('click', function () {
    let zoom = 1;
    if (largeMarkers) {
        largeMarkers = false;
        scaleFactorForDot = isMobile ? 0.25 : 0.4;
        zoom = -1;
    } else {
        scaleFactorForDot = isMobile ? 0.45 : 0.75;
        largeMarkers = true;
    }
    dotScale = parseFloat(window.devicePixelRatio * scaleFactorForDot);
    map.getView().animate({zoom: map.getView().getZoom() + zoom});
});

const textLabelsButton = document.getElementById('text-labels');
textLabelsButton.addEventListener('click', function () {
    let zoom = 1;
    if (textLabels) {
        textLabels = false;
        zoom = -1;
    } else {
        textLabels = true;
    }
    map.getView().animate({zoom: map.getView().getZoom() + zoom});
});

const filterButton = document.getElementById('filter');
const filterPanel = document.getElementById('filter-panel');
const filterCloseButton = document.getElementById('filter-close');
const filterIcon = document.getElementById('filter-icon');
const clearFiltersButton = document.getElementById('clear-filters');
const filterCount = document.getElementById('filter-count');
const filterCountMatched = document.getElementById('filter-count-matched');
const filterCountTotal = document.getElementById('filter-count-total');

filterButton.addEventListener('click', function (e) {
    e.preventDefault();
    if (filterPanel.style.display === 'none' || filterPanel.style.display === '') {
        filterPanel.style.display = 'block';
    } else {
        filterPanel.style.display = 'none';
    }
});

filterCloseButton.addEventListener('click', function () {
    filterPanel.style.display = 'none';
});

const filterRadios = document.getElementsByName('summit-filter');
const loadingOverlay = document.getElementById('loading-overlay');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');

const API_BASE_URL = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.protocol === 'file:' ||
                     window.location.hostname === ''
    ? 'http://localhost:3006/api'
    : '/wota-mapping/api';

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'block';
    setTimeout(function () {
        errorAlert.style.display = 'none';
    }, 5000);
}

function updateFilterIcon(isActive) {
    if (isActive) {
        filterIcon.classList.add('active');
        filterButton.classList.add('active');
    } else {
        filterIcon.classList.remove('active');
        filterButton.classList.remove('active');
    }
}

const validFilterTypes = [
    'activated-year', 'activated-ever', 'not-activated-year', 'not-activated-ever',
    'chased-year', 'chased-ever', 'not-chased-year', 'not-chased-ever'
];

// Maps each filterType to the GeoJSON property name that holds the boolean flag.
// "not-" variants use the same flag but invert it client-side.
const filterFlagMap = {
    'activated-ever':      'activated_ever',
    'activated-year':      'activated_year',
    'not-activated-ever':  'activated_ever',
    'not-activated-year':  'activated_year',
    'chased-ever':         'chased_ever',
    'chased-year':         'chased_year',
    'not-chased-ever':     'chased_ever',
    'not-chased-year':     'chased_year'
};

// Cached GeoJSON response from the prefetch endpoint. Contains all summits
// with the 4 boolean flags for the cached callsign, allowing filter changes
// without further API calls.
let cachedData = null;
let cachedCallsign = null;

function displayFeatures(data, filterType) {
    const filterApplied = !!filterType;

    const format = new ol.format.GeoJSON();
    const features = format.readFeatures(data, {
        featureProjection: 'EPSG:3857'
    });

    summits.getSource().clear();
    summits.getSource().addFeatures(features);

    updateFilterIcon(filterApplied);

    const matchingCount = features.filter(f => f.get('matchesFilter') !== false).length;
    if (filterApplied) {
        console.log('Loaded ' + features.length + ' summits (' + matchingCount + ' matching filter)');
        filterCountMatched.textContent = matchingCount;
        filterCountTotal.textContent = features.length;
        filterCount.classList.add('active');
    } else {
        console.log('Loaded ' + features.length + ' summits');
        filterCount.classList.remove('active');
    }
}

// Apply a filter to cached data client-side by computing matchesFilter
// from the boolean flags, without hitting the API.
function applyFilterFromCache(filterType) {
    if (!cachedData) return;

    const data = JSON.parse(JSON.stringify(cachedData));
    const flagProp = filterFlagMap[filterType];
    const isNegated = filterType && filterType.startsWith('not-');

    data.features.forEach(function (f) {
        if (filterType && flagProp) {
            var flagValue = !!f.properties[flagProp];
            f.properties.matchesFilter = isNegated ? !flagValue : flagValue;
        } else {
            f.properties.matchesFilter = true;
        }
    });

    displayFeatures(data, filterType);
}

// Fetch all summits with callsign flags (prefetch), cache the response,
// then optionally apply a filter from the cache.
function fetchSummitsWithCallsign(callsign, filterType) {
    const cs = callsign.trim().toUpperCase();

    // If we already have cached data for this callsign, use it directly
    if (cachedData && cachedCallsign === cs) {
        applyFilterFromCache(filterType);
        return;
    }

    var url = API_BASE_URL + '/summits?callsign=' + encodeURIComponent(cs) +
              '&year=' + new Date().getFullYear();

    showLoading();

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            hideLoading();
            cachedData = data;
            cachedCallsign = cs;
            applyFilterFromCache(filterType);
        },
        error: function (xhr, status, error) {
            hideLoading();
            console.error('Failed to load summits:', error);
            showError('Failed to load summit data. Please try again later.');
        }
    });
}

// Fetch all summits without any callsign context (basic load)
function fetchSummitsBasic() {
    var url = API_BASE_URL + '/summits';

    updateFilterIcon(false);
    showLoading();

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            hideLoading();
            displayFeatures(data, null);
        },
        error: function (xhr, status, error) {
            hideLoading();
            console.error('Failed to load summits:', error);
            showError('Failed to load summit data. Please try again later.');
        }
    });
}

const callsignInput = document.getElementById('callsign-input');

// Restore callsign from localStorage
const storedCallsign = localStorage.getItem('wota-callsign');
if (storedCallsign) {
    callsignInput.value = storedCallsign;
}

filterRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
        const filterValue = this.value;
        const callsign = callsignInput.value;
        console.log('Filter changed to:', filterValue);

        if (validFilterTypes.includes(filterValue)) {
            if (!callsign || callsign.trim() === '') {
                showError('Please enter your callsign to use filters.');
                updateFilterIcon(false);
                return;
            }
            fetchSummitsWithCallsign(callsign, filterValue);
        } else {
            fetchSummitsBasic();
        }
    });
});

callsignInput.addEventListener('input', function () {
    const callsign = this.value;

    // Persist callsign to localStorage
    if (callsign.trim() !== '') {
        localStorage.setItem('wota-callsign', callsign.trim().toUpperCase());
    } else {
        localStorage.removeItem('wota-callsign');
    }

    // Invalidate cache when callsign changes
    if (cachedCallsign !== callsign.trim().toUpperCase()) {
        cachedData = null;
        cachedCallsign = null;
    }

    const selectedFilterRadio = document.querySelector('input[name="summit-filter"]:checked');
    if (!selectedFilterRadio) {
        return;
    }
    const selectedFilter = selectedFilterRadio.value;
    if (validFilterTypes.includes(selectedFilter)) {
        if (callsign.trim() !== '') {
            fetchSummitsWithCallsign(callsign, selectedFilter);
        }
    }
});

clearFiltersButton.addEventListener('click', function () {
    // Clear callsign input and stored value
    callsignInput.value = '';
    localStorage.removeItem('wota-callsign');

    // Uncheck all radio buttons
    filterRadios.forEach(function (radio) {
        radio.checked = false;
    });

    // Invalidate cache and load all summits
    cachedData = null;
    cachedCallsign = null;
    fetchSummitsBasic();

    console.log('Filters cleared');
});

// Initial load: if a callsign is stored, prefetch all filter data in one
// query so subsequent filter changes are instant. Otherwise basic load.
if (storedCallsign) {
    fetchSummitsWithCallsign(storedCallsign, null);
} else {
    fetchSummitsBasic();
}