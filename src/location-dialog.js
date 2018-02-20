///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Winter Cover Crop Planting Scheduler
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

;(function(jQuery) {

//bnb dictionary for temporary location, to be shown as yellow markers
//This location appears on the map while user decides whether or not to save it.
//If the location is saved, the marker turns red, and tempLocation is null.
var tempLocation = null;

var isValidPropertyName = function(text) {
    var valid = /^[0-9a-zA-Z_]+$/;
    return valid.test(text);
}

var TheDialogContext = {
    changed: false,
    default_location: { address:"Cornell University, Ithaca, NY", lat:42.45, lng:-76.48, id:"default" },
    hidden_location_attrs: ["infowindow", "marker"],
    initialized: false,
    initial_location: null, // id of the location/marker selected when the dialog was opened
    locations: { }, // dictionary of all locations on the map
    //bnb
    //selected_location: null, // id of the last location/marker selected
    selected_location: "default", // id of the last location/marker selected

    baseLocation: function(loc_obj) {
        var loc_obj = loc_obj;
        if (typeof loc_obj === 'string') {
            if (loc_obj == 'initial') {
                loc_obj = this.locations[this.initial_location];
            } else if (loc_obj == 'selected') {
               loc_obj = this.locations[this.selected_location];
            } else { loc_obj = this.locations[loc_obj]; }
        }
        if (loc_obj) {
            var base_loc = { };
            var hidden = this.hidden_location_attrs;
            jQuery.each(loc_obj, function(key, value) {
                if (hidden.indexOf(key) < 0) { base_loc[key] = value; }
            });
            return base_loc;
        } else { return undefined; }
    },

    deleteLocation: function(loc_obj) {
        var loc_obj = this.locations[loc_obj.id];
        if (typeof loc_obj !== 'undefined') {
            var stuff;
            console.log("request to delete location : " + loc_obj.address);
            loc_obj.marker.setMap(null);
            stuff = loc_obj.infowindow;
            //delete stuff;
            loc_obj.infowindow = null;
            stuff = loc_obj.marker;
            //delete stuff;
            loc_obj.marker = null;
            stuff = loc_obj;
            delete this.locations[loc_obj.id];
            //delete stuff;
            this.changed = true;
        }
    },

    getLocation: function(loc_obj) {
        var loc_obj = loc_obj;
        if (typeof loc_obj === 'string') {
            if (loc_obj == 'initial') { return this.locations[this.initial_location];
            } else if (loc_obj == 'selected') { return this.locations[this.selected_location];
            } else { return this.locations[loc_obj]; }
        }
        if (typeof loc_obj !== 'undefined') { return this.locations[loc_obj.id]; } 
        if (this.selected_location != null) {
            return this.locations[this.selected_location];
        }
        return this.locations["default"];
    },

    initializeDialogs: function(dom_element) {
        var dom = DialogDOM;
        console.log("TheDialogContext.initializeDialogs() was called");
        // this.google.maps.controlStyle = 'azteca'; // use pre v3.21 control set
        jQuery(dom_element).html(dom.dialog_html); // initialze the container for all dialogs
        dom.container = dom_element;
        console.log("dialog root html installed in : " + dom.container);

        // create map dialog
        MapDialog.initializeDialog(dom.map_anchor);
        // create location editor dialog
        EditorDialog.initializeDialog(dom.editor_anchor);

        this.initialized = true;
        return this;
    },

    locationExists: function(loc_obj) {
        return typeof this.locations[loc_obj.id] !== 'undefined';
    },

    publicContext: function() {
        return { initial_location: this.baseLocation("initial"),
                 all_locations: this.publicLocations(),
                 selected_location: this.baseLocation("selected"),
               }
    },

    publicLocation: function(loc_obj) {
        return this.baseLocation(this.getLocation(loc_obj));
    },

    publicLocations: function() {
        var locations = { };
        jQuery.each(this.locations, function(id, loc) {
                    locations[id] = { address:loc.address, id:loc.id, lat:loc.lat, lng:loc.lng }
        });
        return locations;
    },

    saveLocation: function(loc_obj, changed) {
        console.log("request to save location : " + loc_obj.address);
        this.locations[loc_obj.id] = jQuery.extend({}, loc_obj);
        if (typeof changed === 'undefined') { this.changed = false; } else { this.changed = changed; }
    },

    selectLocation: function(loc) {
        //TODO: make sure the map gets updated
        //      previous selected gets generic icon
        //      new location gets selected icon
        if (typeof loc === 'string') { this.selected_location = loc;
        } else { this.selected_location = loc.id; }
        this.changed = true;
    },
}

var DialogDOM = {
    //bnb editor will cover main dialog title bar and address form
    //center_loc_on:"#csftool-map-dialog-map",
    center_loc_on:".csf-map-dialog",
    center_map_on:"#csftool-content",

    container: null,

    dialog_html: [ '<div id="csftool-location-dialogs">',
                   '<div id="csftool-map-dialog-anchor">',
                   '</div> <!-- end of csftool-map-dialog-anchor -->',
                   '<div id="csftool-location-editor-anchor">',
                   '</div> <!-- close csftool-location-editor-anchor -->',
                   '</div> <!-- end of csftool-location-dialogs -->'].join(''),

    editor_anchor: "#csftool-location-editor-anchor",
    editor_content: "#csftool-location-editor-content",
    editor_default_id: "Enter unique id",
    editor_dialog_html: [ '<div id="csftool-location-editor-content">',
                       //bnb no longer need to show ID in editor
                       //'<p class="invalid-location-id">ID must contain only alpha-numeric characters and underscores</p>',
                       //'<label class="dialog-label">ID :</label>',
                       //'<input type="text" id="csftool-location-id" class="dialog-text location-id" placeholder="${editor-default-id}">',
                       '<div id="csftool-location-idcont"><span class="dialog-label dialog-coord">ID :</span>',
                       '<span id="csftool-location-id" class="dialog-text dialog-coord"> </span> </div>',
                       //bnb remove address label
                       //'<div id="csftool-location-place"><label class="dialog-label">Place :</label>',
                       '<div id="csftool-location-place">',
                       //bnb don't allow edit of address when location is obtained from map click
                       //'<input type="text" id="csftool-location-address" class="dialog-text location-address"> </div>',
                       '<input type="text" id="csftool-location-address" class="dialog-text location-address" readonly> </div>',
                       '</div>',
                       '<div id="csftool-location-coords">',
                       //'<span class="dialog-label dialog-coord">Lat : </span>',
                       //'<span id="csftool-location-lat" class="dialog-text dialog-coord"> </span>',
                       //'<span class="dialog-label dialog-coord">, Long : </span>',
                       //'<span id="csftool-location-lng" class="dialog-text dialog-coord"> </span>',
                       '</div> <!--close csftool-location-coords -->',
                       '</div> <!-- close csftool-location-editor-content -->'].join(''),
    editor_dom: { id: "#csftool-location-id", address: "#csftool-location-address",
                    lat: "#csftool-location-lat", lng: "#csftool-location-lng" },

    //bnb don't need br
    //infoaddress: '</br><span class="loc-address">${address_component}</span>',
    infoaddress: '<span class="loc-address">${address_component}</span>',
    infobubble: [ '<div class="locationInfobubble">',
                  //bnb no id needed in editor
                  //'<span class="loc-id">${loc_obj_id}</span>',
                  '${loc_obj_address}',
                  '</br><span class="loc-coords">${loc_obj_lat} , ${loc_obj_lng}</span>', 
                  '</div>'].join(''),

    map_anchor: "#csftool-map-dialog-anchor",
    map_content: "#csftool-map-dialog-content",
    map_dialog_html: [ '<div id="csftool-map-dialog-content">',
                       '<div id="csftool-map-dialog-map" class="map-container"> </div>',
                       //'<div id="csftool-map-dialog-legend"> </div>',
                       '</div> <!-- end of csftool-map-dialog-content -->'].join(''),
    map_element: "csftool-map-dialog-map",
}

// LOCATION DIALOG

var EditorDialog = {
    callbacks: { },
    container: null,
    editor_location: null,
    initialized: false,
    isopen: false,
    supported_events: ["cancel","close","delete","save","select"],

    clear: function() {
        var dom = DialogDOM.editor_dom;
        var loc_obj = this.editor_location;
        this.editor_location = null;
        //delete loc_obj;
        jQuery(dom.id).val("");
        jQuery(dom.address).val("");
        jQuery(dom.lat).text("");
        jQuery(dom.lng).text("");
    },

    close: function() {
        jQuery(this.container).dialog("close");
        this.clear();
        this.isopen = false;
        //bnb center on selected location and go back to original map zoom after editing location
        //MapDialog.centerOnSelected();
        MapDialog.zoomToMarkers();
    },

    oneLocationLeftMessage: function() {
        //bnb2 message if user tries to delete last location on map
        jQuery(this.container).dialog("option", "title", "At least one location is required.");
        jQuery(".csf-editor-dialog").css("background-color","#FFBABA");
        jQuery(".csf-editor-dialog .ui-dialog-titlebar").css("background-color","#D8000C");
        jQuery(".csf-editor-dialog .ui-button").css("background-color","#D8000C");
        jQuery(".csf-editor-dialog .ui-dialog-buttonpane").css("background-color","#FFBABA");
        this.setButtons('Error');
    },

    redifyEditor: function() {
        //bnb2 editor window colors for invalid location
        jQuery(this.container).dialog("option", "title", "Outside Available Area");
        jQuery(".csf-editor-dialog").css("background-color","#FFBABA");
        jQuery(".csf-editor-dialog .ui-dialog-titlebar").css("background-color","#D8000C");
        jQuery(".csf-editor-dialog .ui-button").css("background-color","#D8000C");
        jQuery(".csf-editor-dialog .ui-dialog-buttonpane").css("background-color","#FFBABA");
    },

    greenifyEditor: function() {
        //bnb2 editor window colors for valid location
        jQuery(this.container).dialog("option", "title", "Confirm Location Information");
        jQuery(".csf-editor-dialog").css("background-color","#C8E5BE");
        jQuery(".csf-editor-dialog .ui-dialog-titlebar").css("background-color","#228b22");
        jQuery(".csf-editor-dialog .ui-button").css("background-color","#228b22");
        jQuery(".csf-editor-dialog .ui-dialog-buttonpane").css("background-color","#C8E5BE");
    },

    execCallback: function(event_type, info) {
        if (event_type in this.callbacks) {
            console.log("executing call back for " + event_type + " event");
            if (typeof info !== 'undefined') {
                this.callbacks[event_type](event_type, info);
            } else {
                var dom = DialogDOM.editor_dom;
                var _location = { id:jQuery(dom.id).val(), address:jQuery(dom.address).val(),
                                  lat:jQuery(dom.lat).val(), lng:jQuery(dom.lng).val() };
                this.callbacks[event_type](event_type, _location);
            }
        }
    },

    changes: function() {
        var after = this.getLocation();
        var before = this.getLocationBeforeEdit();
        var changed = false;
        var loc_obj = jQuery.extend({}, before);
        if (after.address != before.address) { loc_obj.address = after.address; changed = true; }
        if (after.lat != before.lat) { loc_obj.lat = after.lat; changed = true; }
        if (after.lng != before.lng) { loc_obj.lng = after.lng; changed = true; }
        if (after.id != before.id) { loc_obj.id = after.id; changed = true; }
        return [changed, loc_obj];
    },

    getLocation: function() {
        var dom = DialogDOM.editor_dom;
        var loc_obj = {
            address: jQuery(dom.address).val(),
            lat: this.editor_location.lat,
            lng: this.editor_location.lng,
            id: jQuery(dom.id).val()
        };
        //!TODO: add check for valid values for id and address
        return loc_obj
    },

    getLocationBeforeEdit: function() {
        var dom = DialogDOM.editor_dom;
        return { address: this.editor_location.address,
                 lat: this.editor_location.lat,
                 lng: this.editor_location.lng,
                 id: this.editor_location.id };
    },

    initializeDialog: function(dom_element) {
        // create map dialog
        var dom = DialogDOM;
        this.container = dom.editor_content;
        console.log("EditorDialog.initializeDialog() was called");
        // initialze the location container html
        var editor_html = dom.editor_dialog_html.replace("${editor-default-id}", dom.editor_default_id);
        jQuery(dom_element).html(editor_html);
        console.log("location editor html installed in : " + dom_element);
        var options = jQuery.extend({}, EditorDialogOptions);
        jQuery(this.container).dialog(options);
        this.initialized = true;
        return this;
    },

    open: function(loc_obj) {
        console.log("EditorDialog.open() was called");
        //bnb close editor dialog if it is open already
        //if (this.isopen == true) { EditorDialog.close() };
        var origID = loc_obj.id;
        //bnb create the ID
        if (origID == null) { loc_obj.id = this.createID()  };
        //bnb find index of USA in address
        var index = loc_obj.address.indexOf(", USA");
        if (origID != null || index > 0) {
            //bnb remove USA from visible address in editor window
            loc_obj.address = loc_obj.address.replace(", USA","");
            this.setLocation(loc_obj);
            console.log("attempting to open dialog at " + this.container);
            //jQuery("p.invalid-location-id").hide();
            jQuery(this.container).dialog("open");
            //bnb hiding the id on editor dialog
            jQuery("#csftool-location-idcont:visible").hide();
            //bnb hiding the location coordinates
            jQuery("#csftool-location-coords:visible").hide();
            //bnb choosing and showing appropriately buttons for the dialog window conditionally
            this.setButtons(origID);
            //bnb make sure window is greenified
            this.greenifyEditor();
            // bnb add temporary marker on map
            // bnb first, clear tempLocation if necessary. This is required if user click on a different map location without using editor buttons.
            if (tempLocation != null) {
                if (jQuery.inArray(tempLocation.id,Object.keys(TheDialogContext.locations)) == -1) {
                    tempLocation.marker.setMap(null);
                }
                tempLocation = null;
            }
            // bnb now add the temporary marker if this is a valid location
            MapDialog.mappableLocation(loc_obj);
        } else {
            //bnb change window to red ... there is a location selected that can't be used
            loc_obj.address = "This location cannot be processed.";
            this.setLocation(loc_obj);
            jQuery(this.container).dialog("open");
            //bnb hiding the id and location coords on editor dialog
            jQuery("#csftool-location-idcont:visible").hide();
            jQuery("#csftool-location-coords:visible").hide();
            //bnb choosing and showing appropriately buttons for the dialog window conditionally
            this.setButtons('Error');
            //bnb make sure window is redified
            this.redifyEditor();
            // bnb clear tempLocation if necessary. This is required if user click on a different map location without using editor buttons.
            if (tempLocation != null) {
                if (jQuery.inArray(tempLocation.id,Object.keys(TheDialogContext.locations)) == -1) {
                    tempLocation.marker.setMap(null);
                }
                tempLocation = null;
            }
        }
        this.isopen = true;
        return false;
    },

    setLocation: function(loc_obj) {
        var dom = DialogDOM.editor_dom;
        var loc_obj = loc_obj;
        console.log("EditorDialog.setLocation() was called");
        if (typeof loc_obj.id !== 'undefined') { jQuery(dom.id).val(loc_obj.id); } else { jQuery(dom.id).val(""); }
        if (typeof loc_obj.address !== 'undefined') { jQuery(dom.address).val(loc_obj.address); } else { jQuery(dom.address).val(""); }
        if (typeof loc_obj.lat !== 'undefined') { jQuery(dom.lat).text(loc_obj.lat.toFixed(6)); } else { jQuery(dom.lat).text(""); }
        if (typeof loc_obj.lng !== 'undefined') { jQuery(dom.lng).text(loc_obj.lng.toFixed(6)); } else { jQuery(dom.lng).text(""); }
        this.editor_location = jQuery.extend({}, loc_obj);
        console.log(this.editor_location);
    },

    //bnb function to show/hide editor buttons conditionally
    setButtons: function(origID) {
        console.log("EditorDialog.setButtons() was called");
        if (origID === null) {
            //bnb if location is new and hasn't been saved yet
            jQuery(".csftool-loc-dialog-cancel:hidden").show();
            jQuery(".csftool-loc-dialog-delete:visible").hide();
            jQuery(".csftool-loc-dialog-save:hidden").show();
            jQuery(".csftool-loc-dialog-select:visible").hide();
            jQuery(".csftool-loc-dialog-saveselect:hidden").show();
            jQuery(".csftool-loc-dialog-close:visible").hide();
        } else if (origID === 'Error') {
            //bnb2 if location is selected outside of data
            jQuery(".csftool-loc-dialog-cancel:visible").hide();
            jQuery(".csftool-loc-dialog-delete:visible").hide();
            jQuery(".csftool-loc-dialog-save:visible").hide();
            jQuery(".csftool-loc-dialog-select:visible").hide();
            jQuery(".csftool-loc-dialog-saveselect:visible").hide();
            jQuery(".csftool-loc-dialog-close:hidden").show();
        } else {
            //bnb if location already exists
            jQuery(".csftool-loc-dialog-cancel:hidden").show();
            jQuery(".csftool-loc-dialog-delete:hidden").show();
            jQuery(".csftool-loc-dialog-save:visible").hide();
            jQuery(".csftool-loc-dialog-select:hidden").show();
            jQuery(".csftool-loc-dialog-saveselect:visible").hide();
            jQuery(".csftool-loc-dialog-close:visible").hide();
        };
    },

    //bnb create location id based on time. This id is now shown to user - it is only used for location access.
    createID: function() {
        var date = new Date();
        var idComponents = [
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];
        var id = idComponents.join("");
        return id;
    },

}

var EditorDialogOptions = {
    appendTo: DialogDOM.editor_anchor,
    autoOpen:false,
    buttons: { Cancel: { "class": "csftool-loc-dialog-cancel", text:"Cancel",
                         click: function () {
                             console.log("EditorDialog CANCEL button clicked");
                             var loc_obj = EditorDialog.getLocation();
                             //bnb remove marker if it is only a temporary marker
                             if (jQuery.inArray(loc_obj.id,Object.keys(TheDialogContext.locations)) == -1) { 
                                 tempLocation.marker.setMap(null);
                                 tempLocation = null;
                             };
                             EditorDialog.close();
                         },
                   },
               Delete: { "class": "csftool-loc-dialog-delete", text:"Delete",
                         click: function () {
                             console.log("EditorDialog DELETE button clicked");
                             var loc_obj = EditorDialog.getLocation();
                             if (isValidPropertyName(loc_obj.id)) {
                                 if ((Object.keys(TheDialogContext.locations)).length > 1) {
                                     if (TheDialogContext.selected_location != loc_obj.id) {
                                         console.log("attempting to delete location " + loc_obj.id);
                                         TheDialogContext.deleteLocation(loc_obj);
                                         EditorDialog.close();
                                     } else {
                                         //bnb select one of the remaining locations, so that previously selected can be deleted
                                         var locationKeys = Object.keys(TheDialogContext.locations);
                                         jQuery.each(locationKeys, function(idx, val) {
                                             if (val != TheDialogContext.selected_location) {
                                                 TheDialogContext.selectLocation(val);
                                                 TheDialogContext.locations[val].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                                                 return false
                                             }
                                         });
                                         TheDialogContext.deleteLocation(loc_obj);
                                         EditorDialog.close();
                                     }
                                 } else {
                                    EditorDialog.oneLocationLeftMessage();
                                 }
                             //} else { delete loc_obj; }
                             } else { }
                         },
                  },
               Save: { "class": "csftool-loc-dialog-save", text:"Save",
                       click: function () {
                           console.log("EditorDialog SAVE button clicked");
                           var loc_obj = EditorDialog.getLocation();
                           if (isValidPropertyName(loc_obj.id)) {
                               EditorDialog.close();
                               //bnb clear temp location if necessary
                               if (tempLocation != null) {
                                   tempLocation.marker.setMap(null);
                                   tempLocation = null;
                               }
                               //bnb changed from saveLocation to addLocation
                               //MapLocationManager.saveLocation(loc_obj);
                               MapLocationManager.addLocation(loc_obj);
                               // bnb change marker color from yellow to red, now that this location is saved in dialog context.
                               //TheDialogContext.locations[loc_obj.id].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                               TheDialogContext.locations[loc_obj.id].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
                               EditorDialog.execCallback("save", loc_obj);
                           } else { jQuery("p.invalid-location-id").show(); }
                       },
                   },
               Select: { "class": "csftool-loc-dialog-select", text:"Select",
                         click: function () {
                             console.log("EditorDialog SELECT button clicked");
                             var changes = EditorDialog.changes();
                             var loc_obj = changes[1];
                             if (isValidPropertyName(loc_obj.id)) {
                                if (changes[0]) { // if changes[0] === true, then data was changed
                                     MapLocationManager.addLocation(loc_obj);
                                 } else if (!(TheDialogContext.locationExists(loc_obj))) {
                                     MapLocationManager.addLocation(loc_obj);
                                 }
                                 TheDialogContext.selectLocation(loc_obj);
                                 EditorDialog.execCallback("select", loc_obj);
                                 EditorDialog.close();
                                 MapDialog.close();
                             } else { jQuery("p.invalid-location-id").show(); }
                        },
                   },
               SaveSelect: { "class": "csftool-loc-dialog-saveselect", text:"Save & Select",
                         click: function () {
                             console.log("EditorDialog SAVE & SELECT button clicked");
                             var changes = EditorDialog.changes();
                             var loc_obj = changes[1];
                             if (isValidPropertyName(loc_obj.id)) {
                                if (changes[0]) { // if changes[0] === true, then data was changed
                                     MapLocationManager.addLocation(loc_obj);
                                 } else if (!(TheDialogContext.locationExists(loc_obj))) {
                                     MapLocationManager.addLocation(loc_obj);
                                 }
                                 TheDialogContext.selectLocation(loc_obj);
                                 EditorDialog.execCallback("select", loc_obj);
                                 EditorDialog.close();
                                 MapDialog.close();
                             } else { jQuery("p.invalid-location-id").show(); }
                        },
                   },
               Close: { "class": "csftool-loc-dialog-close", text:"Close",
                         click: function () {
                             console.log("EditorDialog CLOSE button clicked");
                                 EditorDialog.close();
                        },
                   },
             },
    close: function(event, ui) {
        console.log("trying to close LOCATION dialog");
        //bnb clear temp location if necessary
        if (tempLocation != null) {
            if (jQuery.inArray(tempLocation.id,Object.keys(TheDialogContext.locations)) == -1) {
                tempLocation.marker.setMap(null);
            }
            tempLocation = null;
        }
        //bnb back to original map zoom and center after editing
        //MapDialog.centerOnSelected();
        MapDialog.zoomToMarkers();
        EditorDialog.execCallback("close");
    },
    draggable: true,
    minHeight: 50,
    minWidth: 450,
    modal: true,
    //bnb new show/hide animation
    show: 'slideDown',
    hide: 'slideUp',
    //bnb change position of editor dialog - less likely to cover marker of interest
    //position: { my: "center center", at: "center center", of: DialogDOM.center_loc_on },
    position: { my: "top top", at: "center top", of: DialogDOM.center_loc_on },
    //bnb this is now just a confirmation box
    title: "Confirm Location Information",
    //title: "Confirm/Edit Location Information",
    //bnb dialogClass to control styling of editor dialog
    dialogClass: "csf-editor-dialog",
}

// MAP DIALOG & OPTIONS

var restrictMapBounds = function() {
    var map_bounds = MapDialog.map_bounds;
    if (!(map_bounds == null)) {
        var lat = null, lng = null;
        var map = MapDialog.map;
        var bounds = map.getBounds();
        var center = bounds.getCenter();
        var map_ne = map_bounds.getNorthEast();
        var map_sw = map_bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        if (sw.lng() < map_sw.lng()) { lng = map_sw.lng() + ((sw.lng() - ne.lng()) / 2.); } 
        else if (ne.lng() > map_ne.lng()) { lng = map_ne.lng() - ((sw.lng() - ne.lng()) / 2.); }
        if (sw.lat() < map_sw.lat()) { lat = map_sw.lat() + ((ne.lat() - sw.lat()) / 2.); }
        else if (ne.lat() > map_ne.lat()) { lat = map_ne.lat() - ((ne.lat() - sw.lat()) / 2.); }

        if (lat != null) {
            if (lng != null) { map.setCenter(new google.maps.LatLng(lat,lng)); } 
            else { map.setCenter(new google.maps.LatLng(lat, center.lng())); }
            console.log("GOOGLE MAPS :: map bounds restricted : " + map.getBounds());
        } else {
            if (lng != null) {
                map.setCenter(new google.maps.LatLng(center.lat(),lng));
                console.log("GOOGLE MAPS :: map bounds restricted : " + map.getBounds());
            }
        } 
    }
}

var MapDialog = {
    callbacks: { }, // map event callbacks
    changed: false,
    container: null,
    current_marker: null,
    default_center: {lat:43.2,lng:-74.17},
    geocoder: null,
    google: null,
    height: null,
    icons: { },
    initialized: false,
    isopen: false,
    map: null,
    map_bounds: null,
    map_center: null,
    root_element: null,
    supported_events: ["close",],
    //supported_events: ["open","close",],
    width: null,
    zoom: null,

    afterClose: function() {
        console.log("     afterClose function called");
        this.isopen = false;
        this.execCloseCallback();
    },

    beforeClose: function() {
        console.log("     beforeClose function called");
        if (EditorDialog.isopen) { 
            console.log("an editor dialog is open");
            EditorDialog.close();
        }
    },

    centerMap: function(location_obj) {
        var center;
        if (typeof location_obj !== 'undefined') { center = this.locAsLatLng(location_obj);
        } else { center = this.locAsLatLng(); }
        this.map.panTo(center);
    },

    close: function() {
        console.log("LOCATION DIALOG :: trying to close locaiton dialog");
        this.beforeClose();
        console.log("     telling jQuery to close the dialog");
        jQuery(this.container).dialog("close");
        this.afterClose();
    },

    execCloseCallback: function(changed) {
        console.log("     execCloseCallback function called : callback exists : " + ("close" in this.callbacks));
        if ("close" in this.callbacks) {
            var context = TheDialogContext.publicContext();
            context["changed"] = TheDialogContext.changed;
            //bnb write current location state to localStorage when map dialog closes
            //MapLocationManager.writeLocationsToStorage();
            this.callbacks["close"]("close",  context);
        }
    },

    //bnb geocode address, get associated lat/lng
    //bnb map is centered and zoomed over this location also
    geocodeAddress: function(dataArea) {
        var loc = jQuery.extend({}, MapLocation);
        var address = jQuery('#over_map').find('input[id="csftool-address-form-text"]').val();
        var callback =
            (function(loc) { var loc = loc; return function(results, status) {
                    if (status === MapDialog.google.maps.GeocoderStatus.OK && results.length > 0) {
                        loc.address = results[0].formatted_address;
                        loc.lat = results[0].geometry.location.lat();
                        loc.lng = results[0].geometry.location.lng();
                        jQuery('#over_map').find('input[id="csftool-address-form-text"]').val("");
                        MapDialog.map.setCenter(results[0].geometry.location);
                        MapDialog.map.setZoom(14);
                        //bnb modify loc id and address if location is outside valid data area. This ensures error dialog pops.
                        if (MapDialog.google.maps.geometry.poly.containsLocation(results[0].geometry.location, dataArea)) {
                            loc.id = null;
                            loc.address = "This location cannot be processed.";
                            var infowindow = new MapDialog.google.maps.InfoWindow({
                                size: new MapDialog.google.maps.Size(150, 50),
                            }); 
                            var contentString = "No data for this location";
                            infowindow.setContent(contentString);
                            infowindow.setPosition(results[0].geometry.location);
                            infowindow.open(MapDialog.map);
                            //MapDialog.google.maps.event.trigger(dataArea,'click',results[0].geometry.location);
                        }
                        EditorDialog.open(loc);
                    };
                }
            })(loc);
        MapDialog.geocoder.geocode( { 'address': address }, callback);
    },

    initializeDialog: function(dom_element) {
        // create map dialog
        var dom = DialogDOM;
        console.log("MAP DIALIG :: initializeDialog() was called");

        // initialze the map container html
        jQuery(dom_element).html(dom.map_dialog_html);
        this.root_element = dom_element;
        console.log("MAP DIALOG :: html installed in : " + this.root_element);

        var options = jQuery.extend({}, MapDialogOptions);
        if (this.height) { options.minHeight = this.height; }
        if (this.width) { options.minWidth = this.width }
        this.container = dom.map_content;
        jQuery(this.container).dialog(options);

        //bnb add address form to dialog titlebar
        var address_form = ['<div id="over_map">',
                            '<form>',
                            '<input id="csftool-address-form-submit" type="button" value="GO">',
                            '<input id="csftool-address-form-text" type="text" placeholder="Enter County, State, Zip Code, or Address">',
                            '</form>',
                            '</div>'].join('');
        jQuery(".csf-map-dialog").children(".ui-dialog-titlebar").after(address_form);

        this.zoom = MapOptions.zoom;
        this.initialized = true;
        return this;
    },

    initializeGoogle: function(google) {
        console.log("MAP DIALOG :: initializing Google : " + google);
        this.google = google;
        // set the options that are dependent of Google Maps being ready
        MapOptions.mapTypeControlOptions = { style: this.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                                              position: this.google.maps.ControlPosition.TOP_RIGHT };
        MapOptions.mapTypeId = this.google.maps.MapTypeId.ROADMAP;
        MapOptions.zoomControlOptions = { style: this.google.maps.ZoomControlStyle.SMALL,
                                          position: this.google.maps.ControlPosition.TOP_LEFT };
        this.map_center = new this.google.maps.LatLng(this.default_center);
    },

    initializeMap: function(loc_obj) {
        //bnb create id from key, if key exists and id doesn't
        if (typeof loc_obj !== 'string') {
            if ((jQuery.inArray('key',Object.keys(loc_obj)) != -1) && (jQuery.inArray('id',Object.keys(loc_obj)) == -1)) { loc_obj['id'] = loc_obj.key };
        }
        var map_loc;
        var options = jQuery.extend( {}, MapOptions);
        if (this.height) { options.minHeight = this.height; }
        if (this.width) { options.minWidth = this.width }
        options.zoom = this.zoom;
        //bnb read locations from localStorage
        //MapLocationManager.readLocationsFromStorage();
        //bnb create infowindow for 'no data' polygon
        var infowindowNoData = new google.maps.InfoWindow({
            size: new google.maps.Size(150, 50)
        });

        var the_context = TheDialogContext;

        if (loc_obj) {
            if (typeof loc_obj === 'string') {
                map_loc = the_context.getLocation(loc_obj);
            } else if (the_context.locationExists(loc_obj)) {
                map_loc = the_context.getLocation(loc_obj);
            } else { map_loc = MapLocationManager.createLocation(loc_obj); }
        } else { map_loc = undefined; }
        // if no location was passed, show default location at center
        if (typeof map_loc === 'undefined') {
            console.log("NO LOCATION PASSED");
            if (the_context.locationExists("default")) {
                map_loc = the_context.getLocation("default");
            } else { map_loc = MapLocationManager.createDefaultLocation(); }
        }
        console.log("    initial location " + map_loc.address);
        console.log("            marker : " + map_loc.marker);
        the_context.initial_location = map_loc.id;
        the_context.selected_location = map_loc.id;
        //options.center = map_loc.marker.getPosition();
        options.center = this.map_center;
        this.map = new this.google.maps.Map(document.getElementById(DialogDOM.map_element), options);
        console.log("    added map : " + this.map);
        var map_dialog = this;
        jQuery.each(the_context.locations, function(event_type, loc_obj) {
               console.log("    setting map for " + loc_obj.id);
               map_dialog.mappableLocation(loc_obj);
               }
        );
        // don't waste time generating urls that will never be used
        this.google.maps.event.clearListeners(this.map, 'url_changed');
        // create new location onclick events
        console.log("    adding map click event listener to " + this.map);

        this.google.maps.event.addListener(this.map, 'click', function(ev) {
            console.log("click event callback : " + ev.toString());
            //bnb2 close info window over 'no data' polygon before creating location
            infowindowNoData.close();
            MapLocationManager.createLocation(ev.latLng);
        });

        this.google.maps.event.addListenerOnce(this.map, 'tilesloaded', function(){
            //bnb center map on selected location when map dialog is first opened
            MapDialog.zoomToMarkers();
            //bnb add legend to map after map is loaded to avoid viewing the legend div flashing below map before it is positioned in right corner
            MapDialog.createLegend();
        });

        // when set, restrict viewing area to map bounds
        if (this.map_bounds != null) {
            this.google.maps.event.addListener(this.map, "dragstart", function() {
                console.log("    adding 'center_changed' listener to " + MapDialog.map);
                MapDialog.google.maps.event.addListener(MapDialog.map, "center_changed", restrictMapBounds);
            });
            this.google.maps.event.addListener(this.map, "dragend", function() {
                console.log("    removing 'center_changed' listeners from " + MapDialog.map);
                MapDialog.google.maps.event.clearListeners(MapDialog.map, "center_changed");
            });
        } else {
            this.google.maps.event.addListener(this.map, "dragend", function() {
                MapDialog.map_center = MapDialog.map.getBounds().getCenter();
            });
        }
        this.google.maps.event.addListener(this.map, "zoom_changed", function() {
            MapDialog.map_center = MapDialog.map.getBounds().getCenter();
            MapDialog.zoom = MapDialog.map.getZoom();
        });

        //bnb shade areas where there is no data available
        // Define the LatLng coordinates for the polygon's  outer path.
        var outerCoords = [
          {lat: 90.000, lng: -180.000}, {lat: 90.000, lng: -90.000}, {lat: 90.000, lng: 0.000}, {lat: 90.000, lng: 90.000},
          {lat: 90.000, lng: 180.000}, {lat: 45.000, lng: 180.000}, {lat: 0.000, lng: 180.000}, {lat: -45.000, lng: 180.000},
          {lat: -90.000, lng: 180.000}, {lat: -90.000, lng: 90.000}, {lat: -90.000, lng: 0.000}, {lat: -90.000, lng: -90.000},
          {lat: -90.000, lng: -180.000}, {lat: -45.000, lng: -180.000}, {lat: 0.000, lng: -180.000}, {lat: 45.000, lng: -180.000},
          {lat: 90.000, lng: -180.000},
        ];

        // Define the LatLng coordinates for the polygon's inner path.
        // Note that the points forming the inner path are wound in the
        // opposite direction to those in the outer path, to form the hole.
        var innerCoords = [
          {lat: 37.125, lng: -82.750}, {lat: 37.125, lng: -76.260}, {lat: 37.917945, lng: -76.30162}, {lat: 38.239992, lng: -76.989998},
          {lat: 38.08326, lng: -76.32933}, {lat: 38.717615, lng: -76.542725}, {lat: 39.15, lng: -76.35}, {lat: 38.319215, lng: -76.23287},
          {lat: 37.93705, lng: -75.72205}, {lat: 37.2566, lng: -76.03127}, {lat: 37.21689, lng: -75.94023}, {lat: 38.01551, lng: -75.37747},
          {lat: 38.40412, lng: -75.05673}, {lat: 38.782032, lng: -75.071835}, {lat: 38.96, lng: -75.32}, {lat: 39.4985, lng: -75.52805},
          {lat: 39.24845, lng: -75.20002}, {lat: 39.1964, lng: -74.98041}, {lat: 38.93954, lng: -74.90604}, {lat: 39.70926, lng: -74.17838},
          {lat: 40.42763, lng: -73.96244}, {lat: 40.47351, lng: -74.25671}, {lat: 40.75075, lng: -73.952325}, {lat: 40.628, lng: -73.982},
          {lat: 40.63, lng: -73.345}, {lat: 40.93, lng: -71.945}, {lat: 41.11948, lng: -72.24126}, {lat: 40.931102, lng: -73.71},
          {lat: 41.22065, lng: -72.87643}, {lat: 41.27, lng: -72.295}, {lat: 41.32, lng: -71.86}, {lat: 41.49445, lng: -71.12039},
          {lat: 41.475, lng: -70.64}, {lat: 41.63717, lng: -69.96503}, {lat: 41.92283, lng: -69.88497}, {lat: 42.145, lng: -70.185},
          {lat: 41.78, lng: -70.08}, {lat: 41.805, lng: -70.495}, {lat: 42.335, lng: -70.82}, {lat: 42.8653, lng: -70.81489},
          {lat: 43.090238, lng: -70.645476}, {lat: 43.68405, lng: -70.11617}, {lat: 43.98, lng: -69.06}, {lat: 44.3252, lng: -68.03252},
          {lat: 44.8097, lng: -66.96466}, {lat: 45.13753, lng: -67.13741}, {lat: 45.70281, lng: -67.79134}, {lat: 47.06636, lng: -67.79046},
          {lat: 47.35486, lng: -68.23444}, {lat: 47.185, lng: -68.905}, {lat: 47.447781, lng: -69.237216}, {lat: 46.69307, lng: -69.99997},
          {lat: 45.915, lng: -70.305}, {lat: 45.46, lng: -70.66}, {lat: 45.30524, lng: -71.08482}, {lat: 45.255, lng: -71.405},
          {lat: 45.0082, lng: -71.50506}, {lat: 45.00738, lng: -73.34783}, {lat: 45.00048, lng: -74.867}, {lat: 44.81645, lng: -75.31821},
          {lat: 44.09631, lng: -76.375}, {lat: 44.018459, lng: -76.5}, {lat: 43.628784, lng: -76.820034}, {lat: 43.629056, lng: -77.737885},
          {lat: 43.625089, lng: -78.72028}, {lat: 43.466339, lng: -79.171674}, {lat: 43.27, lng: -79.01}, {lat: 42.965, lng: -78.92},
          {lat: 42.863611, lng: -78.939362}, {lat: 42.3662, lng: -80.247448}, {lat: 42.209026, lng: -81.277747}, {lat: 41.675105, lng: -82.439278},
          {lat: 41.675105, lng: -82.690089},
        ];

        // Construct the polygon, including both paths.
        var dataArea = new google.maps.Polygon({
          paths: [outerCoords, innerCoords],
          strokeColor: '#A9A9A9',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#A9A9A9',
          fillOpacity: 0.35
        });
        dataArea.setMap(MapDialog.map);

        this.google.maps.event.addListener(dataArea, 'click', function(event) {
            infowindowNoData.close();
            var contentString = "No data for this location";
            infowindowNoData.setContent(contentString);
            infowindowNoData.setPosition(event.latLng);
            infowindowNoData.open(MapDialog.map);
        });

        //bnb add legend to map
        this.createLegend();

        //bnb tried this to allow centering of map over initially selected location when map if first opened
        //bnb It works, but then doesn't allow you to drag map ... as soon as you drag it the map centers over selected location again
        //this.google.maps.event.addListener(this.map, "bounds_changed", function() {
        //    MapDialog.centerOnSelected();
        //});

        console.log("    google map created ... " + this.map);
        if (this.geocoder == null) {
            this.geocoder = new this.google.maps.Geocoder();
            console.log("    gecoder created");
        }

        //bnb handle address form button click
        jQuery('#csftool-address-form-submit').on('click', function() {
            MapDialog.geocodeAddress(dataArea);
        });

        //bnb handle address form on enter key press
        jQuery('#csftool-address-form-text').keypress(function (e) {
            if (e.which == 13) {
                MapDialog.geocodeAddress(dataArea);
                return false;
            }
        });
    },

    locAsLatLng: function(location_obj) {
        var loc;
        var the_context = TheDialogContext;
        if (typeof location_obj !== 'undefined') { loc = location_obj;
        } else if (the_context.selected_location == null) { loc = the_context.default_location;
        } else { loc = the_context.selected_location; }
        return new this.google.maps.LatLng(loc.lat, loc.lng);
    },

    mappableLocation: function(loc_obj) {
        if (loc_obj.marker == null) { MapLocationManager.createMarker(loc_obj);
        } else { loc_obj.marker.setMap(MapDialog.map); }
        if (loc_obj.infowindow == null) { MapLocationManager.createInfoWindow(loc_obj); }
    },

    //bnb function to create legend over map
    createLegend: function() {
        var element = jQuery('#csftool-map-dialog-legend');
        if (!element.length) { element = jQuery('<div id="csftool-map-dialog-legend"></div>').appendTo(DialogDOM.map_content); };
        var legend_html = ['<div><img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png">Selected</div>',
            '<div><img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png">Saved</div>',
            '<div><img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png">Unsaved</div>'].join('');
        jQuery('#csftool-map-dialog-legend').html(legend_html);
        this.map.controls[this.google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('csftool-map-dialog-legend'));
    },

    //bnb function to center map on selected location
    centerOnSelected: function() {
        //MapDialog.map.setZoom(MapOptions.zoom);
        MapDialog.map.setZoom(9);
        var selectedLatLng = {
            'lat': TheDialogContext.locations[TheDialogContext.selected_location].lat,
            'lng': TheDialogContext.locations[TheDialogContext.selected_location].lng
        }
        MapDialog.map.setCenter(selectedLatLng);
    },

    //bnb function to zoom to markers. window will include all markers, but not too close to edge. Also center on geometric center of all markers.
    zoomToMarkers: function() {
        var the_context = TheDialogContext;
        var bounds = new this.google.maps.LatLngBounds();
        jQuery.each(the_context.locations, function(event_type, loc_obj) {
                bounds.extend(loc_obj.marker.getPosition());
            }
        );
        if (Object.keys(the_context.locations).length > 1) {
            this.map.setCenter(bounds.getCenter());
            //bnb when zooming to markers, listen for bounds changes and zoom out a little so markers aren't on edge of window
            this.google.maps.event.addListenerOnce(this.map, 'bounds_changed', function(event) {
                this.setZoom(this.getZoom()-1);
                if (this.getZoom() > MapOptions.maxZoom) {
                    this.setZoom(MapOptions.maxZoom);
                }
                if (this.getZoom() < MapOptions.minZoom) {
                    this.setZoom(MapOptions.minZoom);
                }
            });
            this.map.fitBounds(bounds);
        } else {
            if (jQuery.inArray(the_context.default_location.id,Object.keys(the_context.locations)) == -1) {
                this.centerOnSelected()
            } else {
            }
        }
    },

    open: function(loc_obj) {
        console.log("MAP DIALOG :: attempting to open MAP dialog");
        if (this.isopen) { this.close(); }
        if (this.initialized != true) { this.initializeDialog(this.root_element); }
        jQuery(this.container).dialog("open");
        this.initializeMap(loc_obj);
        //bnb center at selection
        //MapDialog.centerOnSelected();
        this.isopen = true;
        TheDialogContext.changed = false;
        return false;
    },

    removeCallback: function(event_type) { if (event_type in this.callbacks) { delete this.callbacks[event_type]; } },

    setBounds: function(s_lat, w_lng, n_lat, e_lng) {
        console.log("LOCATION DIALOG :: setting map bounds : " + s_lat + "," + w_lng + " : " + n_lat + "," + e_lng);
        var sw = new this.google.maps.LatLng(s_lat, w_lng);
        var ne = new this.google.maps.LatLng(n_lat, e_lng);
        this.map_bounds = new this.google.maps.LatLngBounds(sw, ne);
        console.log("    bounds object : " + this.map_bounds);
        //this.bounds = { sw: { lat: s_lat, lng: w_lng }, ne: { lat: n_lat, lng: e_lng }, };
    },

    setCallback: function(event_type, function_to_call) {
        var index = this.supported_events.indexOf(event_type);
        if (index >= 0) { this.callbacks[event_type] = function_to_call; }
    },

    setDimension: function(dim, size) {
        if (dim == "height") { this.height = size;
        } else if (dim == "width") { this.width = size; }
    },
}

var MapDialogOptions = { appendTo: DialogDOM.map_anchor, autoOpen:false,
    beforeClose: function(event, ui) { MapDialog.beforeClose(); },
    //bnb no longer need buttons at bottom of dialog window ... relying on corner close button (x)
    //buttons: { Done: { "class": "csftool-map-dialog-close", text:"Done",
    //                    click: function () { MapDialog.close(); }
    //                 }
    //},
    close: function(event, ui) { MapDialog.afterClose(); },
    draggable: true,
    minHeight: 400,
    minWidth: 400,
    modal: true,
    position: { my: "center center", at: "center center", of: DialogDOM.center_map_on },
    resizable: false,
    //bnb change title
    //title: "Location Map Dialog",
    //title: "CSF Location Manager",
    title: null,
    //bnb dialogClass for styling precision
    dialogClass: "csf-map-dialog",
}

var MapOptions = {
    backgroundColor: "white",
    center: null,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    draggable: true,
    enableAutocomplete: false,
    //enableReverseGeocode: true,
    mapTypeControl: true,
    mapTypeControlOptions: null,
    mapTypeId: null,
    maxZoom: 18,
    minZoom: 6,
    scaleControl: false,
    scrollwheel: true,
    streetViewControl: false,
    zoom: 6,
    zoomControl: true,
    zoomControlOptions: null,
}

// MANAGE MAP LOCATIONS/MARKERS

var MapLocation = {
    id:null,
    address:null,
    infowindow: null,
    lat: null, lng:null,
    marker:null
}

var MarkerOptions = {
    clickable:true,
    draggable:false,
    //bnb default icon source
    //icon:null,
    //icon:'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    map:null,
    position:null,
    //title:"New Marker"
    title:null
}

var MapLocationManager = {

    addLocation: function(loc_obj) {
        var loc_obj = jQuery.extend({}, MapLocation, loc_obj);
        // add a marker
        loc_obj = this.createMarker(loc_obj);
        // create an info window and add a click event listener to display it
        loc_obj = this.createInfoWindow(loc_obj);
        // add this location to the context manager
        console.log("NEW LOCATION : " + loc_obj.address);
        TheDialogContext.saveLocation(loc_obj);
        return loc_obj;
    },

    addLocations: function(locations) {
        jQuery.each(locations, function(id, loc) {
            TheDialogContext.locations[id] = jQuery.extend({}, MapLocation, loc);
        });
    },

    createDefaultLocation: function() { return this.createLocation(TheDialogContext.default_location); },

    createInfoWindow: function(loc_obj) {
         var content, infowindow;
        // clear old inforwindow when present
        if (typeof loc_obj.infowindow !== 'undefined') {
            infowindow = loc_obj.infowindow;
            //delete infowindow;
            loc_obj.infowindow = null;
        }
        // create a new infowindow based on input location
        content = (function(loc_obj) {
                console.log("for infowindow " + loc_obj.lat);
                console.log("for infowindow " + loc_obj.lng);
                var template = DialogDOM.infobubble;
                //bnb no longer provide id info to user
                //template = template.replace("${loc_obj_id}", loc_obj.id);
                template = template.replace("${loc_obj_lat}", loc_obj.lat.toFixed(5));
                template = template.replace("${loc_obj_lng}", loc_obj.lng.toFixed(5));

                var index = loc_obj.address.indexOf(", USA");
                if (index > 0) { loc_obj.address = loc_obj.address.replace(", USA",""); }
                var parts = loc_obj.address.split(", ");
                if (parts.length > 1) {
                    var address;
                    address = DialogDOM.infoaddress.replace("${address_component}", parts[0]);
                    address = address + '</br>' +  
                              DialogDOM.infoaddress.replace("${address_component}", parts.slice(1).join(", "));
                    return template.replace("${loc_obj_address}", address);
                } else { return template.replace("${loc_obj_address}", loc_obj.address); }
            })(loc_obj);
        infowindow = new MapDialog.google.maps.InfoWindow({ content: content});
        loc_obj.infowindow = infowindow;

        // add listeners to display/hide info window
        var marker = loc_obj.marker
        marker.addListener('mouseover', function() { infowindow.open(MapDialog.map, marker); });
        marker.addListener('mouseout', function() { infowindow.close(); });
        return loc_obj;
    },

    createLocation: function(loc_data) {
        var place = jQuery.extend({}, MapLocation);

        if (loc_data instanceof MapDialog.google.maps.LatLng) {
            console.log("creating map location from google.maps.LatLng");
            place.lat = loc_data.lat();
            place.lng = loc_data.lng();

            var callback =
                (function(place) { var place = place; return function(result, status) {
                        if (status === MapDialog.google.maps.GeocoderStatus.OK && result.length > 0) {
                            place.address = result[0].formatted_address;
                        } else { place.address = "Unable to decode lat/lng to physical address."; }
                        EditorDialog.open(place);
                    }
                })(place);
            MapDialog.geocoder.geocode( { latLng: loc_data }, callback);

        } else {
            var loc_obj = jQuery.extend(place, loc_data);
            // add a marker
            loc_obj = this.createMarker(loc_obj);
            // create an info window and add a click event listener to display it
            loc_obj = this.createInfoWindow(loc_obj);
            // add this location to the location tracker
            TheDialogContext.saveLocation(loc_obj, true);
            console.log("NEW LOCATION : " + loc_obj.address);
            return loc_obj;
        }
    },

    //bnb function to read locations from localStorage
    //readLocationsFromStorage: function() {
    //    var basil = new window.Basil({ namespace: 'CSF-LOC-'+CSFTOOL_NAME, expireDays: 3650, });
    //    jQuery.each(basil.keys(), function(idx,id) {
    //        TheDialogContext.locations[id] = basil.get(id);
    //        if (TheDialogContext.locations[id]['selected'] == 1) {
    //            TheDialogContext.initial_location = id;
    //            TheDialogContext.selected_location = id;
    //        }
    //    });
    //},

    //bnb function to write locations to localStorage
    //writeLocationsToStorage: function() {
    //    var context = TheDialogContext.publicContext();
    //    if (context.selected_location != context.initial_location) {
    //        var loc_obj = context.selected_location;
    //        var selectedID = loc_obj.id
    //    } else {
    //        var selectedID = context.initial_location.id
    //    }
    //    var options = {
    //        namespace: 'CSF-LOC-'+CSFTOOL_NAME,
    //        expireDays: 3650,
    //    }
    //    var basil = new window.Basil(options);
    //    //basil.reset();
    //    var selected = null
    //    var context_ids = Object.keys(context.all_locations)
    //    var basil_keys = basil.keys()
    //    var location_data = {}
    //    jQuery.each(context.all_locations, function(id, loc) {
    //        if (id == selectedID) {
    //            selected = 1
    //        } else {
    //            selected = 0
    //        }
    //        if (jQuery.inArray(id,basil_keys) == -1) {
    //           //bnb id doesn't exist in local storage, so just create entry with necessary vars
    //           //                //basil.set(id, { address:loc.address, id:loc.id, lat:loc.lat, lng:loc.lng, tool:CSFTOOL_NAME, selected:selected } );
    //            basil.set(id, { address:loc.address, id:loc.id, lat:loc.lat, lng:loc.lng, selected:selected } );
    //        } else {
    //            //bnb id already exists, so edit vars individually as not to affect any tool-specific location data that may be in dictionary
    //            location_data = basil.get(id);
    //            location_data['address'] = loc.address;
    //            location_data['id'] = loc.id;
    //            location_data['lat'] = loc.lat;
    //            location_data['lng'] = loc.lng;
    //            //location_data['tool'] = CSFTOOL_NAME;
    //            location_data['selected'] = selected;
    //            basil.set(id,location_data);
    //        }
    //    });
    //    //bnb delete locations from local storage that are no longer needed
    //    jQuery.each(basil_keys, function(idx,id) {
    //        if (jQuery.inArray(id,context_ids) == -1) {
    //            console.log('removing '+id+' from local storage');
    //            basil.remove(id);
    //        };
    //    });
    //},

    createMarker: function(loc_obj) {
        var dialog = MapDialog;
        var marker, marker_ops;
        // create a marker for the location
        marker_ops = jQuery.extend({}, MarkerOptions);
        marker_ops.map = dialog.map;
        marker_ops.position = dialog.locAsLatLng(loc_obj);
        // bnb marker color if user is still deciding if location will be saved.
        if (jQuery.inArray(loc_obj.id,Object.keys(TheDialogContext.locations)) == -1) { marker_ops.icon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' };
        //bnb change marker color if location is currently selected
        //if (TheDialogContext.selected_location == loc_obj.id) { marker_ops.icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' };
        if (TheDialogContext.selected_location == loc_obj.id) { marker_ops.icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' };
        //marker_ops.title = loc_obj.id;
        marker = new dialog.google.maps.Marker(marker_ops);
        marker.addListener('click', function() { EditorDialog.open(loc_obj) });
        loc_obj.marker = marker;
        //bnb tempLocation assigned location data if this is a temporary location
        if (jQuery.inArray(loc_obj.id,Object.keys(TheDialogContext.locations)) == -1) { tempLocation = jQuery.extend({},loc_obj) };
        return loc_obj;
    },
}

var jQueryDialogProxy = function() {
    if (arguments.length == 1) {
        var arg = arguments[0];
        switch(arg) {

            case "close": MapDialog.close(); break;
            case "context": return TheDialogContext.publicContext(); break;
            case "locations": return TheDialogContext.publicLocations(); break;
            case "open": MapDialog.open(); break;
            case "selected": return TheDialogContext.baseLocation("selected"); break;
        }
    } else if (arguments.length == 2) {
        var arg_0 = arguments[0];
        var arg_1 = arguments[1];
        switch(arg_0) {

            case "bind": // bind a list of callbacks
                 var callbacks = arg_1;
                 jQuery.each(callbacks, function(event_type, callback) { MapDialog.setCallback(event_type, callback); });
                 break;

            case "bounds": MapDialog.setBounds(arg_1[0], arg_1[1], arg_1[2], arg_1[3]); break;
            case "default": TheDialogContext.default_location = arg_1; break;
            case "height": case "width": MapDialog.setDimension(arg_0, arg_1); break;

            case "google": // init google map
                 console.log("OPTION :: setting Google API");
                 MapDialog.initializeGoogle(arg_1);
                 break;

            case "location":
                // when string, return the location info
                if (typeof arg_1 === 'string') {
                    return TheDialogContext.getLocation(arg_1);
                // when object, set the selected location
                } else { TheDialogContext.selectLocation(arg_1); }
                break;

            case "locations": return MapLocationManager.addLocations(arg_1); break;
            case "open": MapDialog.open(arg_1); break;
            case "title": MapDialog.setTitle(arg_1); break;
        }
    } else if (arguments.length == 3) {
        if (arguments[0] == "bind") { MapDialog.setCallback(arguments[1], arguments[2]); 
        } else if (arguments[0] == "bounds") { var sw = arguments[1]; var ne = arguments[2]; MapDialog.setBounds(sw[0],sw[1],ne[0],ne[1]); }
    } else if (arguments.length == 5) {
            if (arguments[0] == "bounds") { MapDialog.setBounds(arguments[1], arguments[2], arguments[3], arguments[4]); }
    }
    return undefined;
}

jQuery.fn.CsfToolLocationDialog = function(options) {
    if (typeof options !== 'undefined') {
        jQuery.each(options, function(key, value) {
            jQueryDialogProxy(key, value);
        });
    } else {
        console.log("jQuery.fn.CsfToolLocationDialog :: initializing map dialog");
        var dom_element = this.get(0);
        TheDialogContext.initializeDialogs(dom_element);
        return jQueryDialogProxy;
    }
}

})(jQuery);

