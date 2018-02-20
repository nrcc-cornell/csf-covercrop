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

import { observable, computed, action, extendObservable } from 'mobx';
import jsonp from 'jsonp';

export class CC {
    @observable location_id='';
    @observable lat='';
    @observable lon='';
    @observable address='';
    @observable default_location;
    @observable selected_id='';
    @observable crop='';
    //@observable gdd_thresh='';
    @observable planting_date='';
    @observable crop_data;
    @observable data_probs_por;
    @observable data_probs_30;
    @observable data_probs_15;
    @observable data_probs;
    @observable data_dates;
    @observable data_gdd;
    @observable data_years;
    @observable loader=false;
    @observable animation_prob_chart = false;
    @observable info_modal_is_open = false;
    @observable data_sources_is_open = false;
    @observable map_dialog;
    @observable manage_local_storage;
    @observable chart_label="Mouseover chart to explore planting dates";
    @observable prob15=100;

    // -----------------------------------------------------------------------------------------
    // Display status for Data Sources and References ------------------------------------------
    // For Components: InfoButton & InfoWindow -------------------------------------------------
    // -----------------------------------------------------------------------------------------
    @observable info_status=false;
    @action updatePopupStatus = () => { this.info_status = !this.info_status };
    @computed get popupStatus() { return this.info_status };

    @action openDataSources = () => {
        //console.log('opening data source info');
        this.data_sources_is_open = true;
    }

    @action closeDataSources = () => {
        //console.log('closing data source info');
        this.data_sources_is_open = false;
    }

    @action openInfoModal = () => {
        //console.log('opening data source info');
        this.info_modal_is_open = true;
    }

    @action closeInfoModal = () => {
        //console.log('closing data source info');
        this.info_modal_is_open = false;
    }

    @action updateProbChartAnimationFlag = (b) => {
        this.animation_prob_chart = b;
    }

    @action initStorageManager = () => {
        //console.log('initStorageManager');
        let storage_options = {
            namespace: 'CSF-COVERCROP',
            expireDays: 3650
        }
        jQuery().CsfToolManageLocalStorage(storage_options);
        this.manage_local_storage = jQuery().CsfToolManageLocalStorage();
        this.manage_local_storage("init");
    }

    @action initLocationState = () => {
        //console.log('initLocationState');
        let selected_id = this.manage_local_storage("read","selected");
        let locations = this.manage_local_storage("read","locations");
        let loc_obj = null;
        if (locations != undefined) {
            loc_obj = locations[selected_id]
        } else {
            loc_obj = null
        }
        this.updateDefaultLocation();
        if (loc_obj) {
            this.updateLocationId(loc_obj.id);
            this.updateAddress(loc_obj.address);
            this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());
        } else {
            this.updateLocationId(this.default_location.id);
            this.updateAddress(this.default_location.address);
            this.updateLocation(this.default_location.lat.toString(),this.default_location.lng.toString());
            // WRITE DEFAULT LOCATION IF NO LOCATIONS EXIST
            this.manage_local_storage("write","locations",{default: this.default_location});
            this.manage_local_storage("write","selected",this.default_location.id);
        }
    }

    @action initMapDialog = () => {
            //console.log('initMapDialog');
            //var default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:"default"};
            //var default_location = this.getDefaultLocation
            var default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:"default"};
            var options = { width:600, height:500, google:google, default:default_location };
            jQuery(".csftool-location-dialog").CsfToolLocationDialog(options);
            this.map_dialog = jQuery(".csftool-location-dialog").CsfToolLocationDialog();
        }

    @action mapInit = () => {
            let locations = this.manage_local_storage("read","locations");
            let selected_id = this.manage_local_storage("read","selected");
            this.map_dialog("locations", locations);
            this.map_dialog("open", selected_id);
            this.map_dialog("bind", "close", (ev, context) => {
                let loc_obj = context.selected_location;
                this.updateLocationId(loc_obj.id);
                this.updateAddress(loc_obj.address);
                this.updateLocation(loc_obj.lat.toString(),loc_obj.lng.toString());

                // WRITE LOCATIONS THE USER HAS SAVED
                this.manage_local_storage("write","locations",context.all_locations);
                this.manage_local_storage("write","selected",this.getLocationId);

                // REMOVE LOCATIONS THE USER HAS DELETED
                var idsToDelete = this.manage_local_storage("getExtraKeys", "locations", context.all_locations);
                this.manage_local_storage("delete", "locations", idsToDelete);

            });
        }

    @action updateDefaultLocation = () => {
            this.default_location = {address:this.getAddress, lat:parseFloat(this.getLat), lng:parseFloat(this.getLon), id:this.getLocationId};
        }

    @action updateCropData = (d) => {
            this.crop_data = d;
        }

    @action updateLocation = (lt,ln) => {
            if ((this.getLat !== lt) || (this.getLon!==ln) || 
               ((this.getDefaultLocation.lat.toString()===lt) && (this.getDefaultLocation.lng.toString()===ln)) ) {
                this.lat = lt;
                this.lon = ln;
                this.downloadChartData();
            }
        }

    @action updateLocationId = (i) => {
            if ((this.getLocationId !== i) || (this.getLocationId === this.getDefaultLocation.id)) {
                this.location_id = i;
            }
        }

    @action updateAddress = (a) => {
            this.address = a;
        }

    @action updateLoader = (l) => {
            this.loader = l;
        }

    @action updatePlantingDate = (p) => {
            this.planting_date = p;
        }

    @action updateChartLabel = (b) => {
            this.chart_label = b;
            //if (b) {
            //    this.chart_label = " "
            //} else {
            //    this.chart_label = "Mouseover chart to explore planting dates"
            //}
        }

    @action updateProb15 = (p) => {
            this.prob15 = p;
        }

    @action updateSelectedCrop = (c) => {
            if (this.getCrop !== c) {
                this.crop = c.value;
                this.downloadChartData();
            }
            ////this.updateProbChartAnimationFlag(true); 
            //this.updateProbChartAnimationFlag({ duration: 1000 }); 
            //this.updatePlantingDate(this.getCropData['dates'][0]);
            //this.updateProbChartData(this.getCropData);
            //this.updateBarChartData(this.getCropData);
            //this.updateProb15(100);
        }

    @action updateProbChartData = (c) => {
            //console.log('INSIDE updateProbChartData');
            //console.log(c);
            this.data_probs_por = c['probs_por'];
            this.data_probs_30 = c['probs_30'];
            this.data_probs_15 = c['probs_15'];
            //this.data_probs = c['probs_15'];
            this.data_dates = c['dates'];
            //console.log(this.getProbs15);
        }

    //@action updateProbChartData = (c) => {
    //        //this.data_probs = c['probs'];
    //        //this.data_dates = c['dates'];
    //        //this.data_probs = c['probs'];
    //        //this.data_dates = c['dates'];
    //        this.data_probs = c['probs_15'];
    //        this.data_dates = c['dates'];
    //    }

    @action updateBarChartData = (c) => {
            //this.data_gdd = c['gdd'];
            //this.data_years = c['years'];
            this.data_gdd = c['gdd'];
            this.data_years = c['years'];
        }

    @computed get infoModalOpenStatus() {
            return this.info_modal_is_open
        }

    @computed get dataSourcesOpenStatus() {
            return this.data_sources_is_open
        }

    @computed get getProb15() {
            return this.prob15
        }

    @computed get flattenGDD() {
            let arr = this.getCropData['gdd'].toJS()
            let f = arr.reduce((a, b) => a.concat(b.toJS()), []);
            //let f = [].concat.apply([], this.getCropData['gdd']);
            let mn = Math.min(...f);
            let mx = Math.max(...f);
            //console.log(f);
            //console.log('FLATTEN ' + mn.toString() + ', ' + mx.toString())
            return f
        }

    @computed get getChartLabel() {
            return this.chart_label
        }

    @computed get getDefaultLocation() {
            return this.default_location
        }

    @computed get getProbChartAnimation() {
            return this.animation_prob_chart
        }

    @computed get getLoader() {
            return this.loader
        }

    @computed get getCropData() {
            return this.crop_data
        }

    @computed get getLocationId() {
            return this.location_id
        }

    @computed get getLat() {
            return this.lat
        }

    @computed get getLon() {
            return this.lon
        }

    @computed get getAddress() {
            return this.address
        }

    @computed get getCrop() {
            return this.crop
        }

    @computed get getPlantingDate() {
            return this.planting_date
        }

    @computed get getProbs() {
            return this.data_probs
        }

    @computed get getProbsPOR() {
            return this.data_probs_por
        }

    @computed get getProbs30() {
            return this.data_probs_30
        }

    @computed get getProbs15() {
            return this.data_probs_15
        }

    @computed get getDates() {
            return this.data_dates
        }

    @computed get getGdd() {
            return this.data_gdd
        }

    @computed get getGddBase() {
            return this.data_gdd_base
        }

    @computed get getYears() {
            return this.data_years
        }

    @computed get probChartDataPOR() {
            let probs = this.getProbsPOR;
            let dates = this.getDates;
            const dataToDisplay = [];
            const dlen = probs.length;
            for (var i=0; i<dlen; i++) {
                let d = dates[i].split('/')
                dataToDisplay.push({
                    //x: Date.parse("2017/"+dates[i]),
                    x: Date.UTC(2017,parseInt(d[0])-1,parseInt(d[1])),
                    y: this.data_probs_por[i],
                })
            }
            return dataToDisplay
        }

    @computed get probChartData30() {
            let probs = this.getProbs30;
            let dates = this.getDates;
            const dataToDisplay = [];
            const dlen = probs.length;
            for (var i=0; i<dlen; i++) {
                let d = dates[i].split('/')
                dataToDisplay.push({
                    //x: Date.parse("2017/"+dates[i]),
                    x: Date.UTC(2017,parseInt(d[0])-1,parseInt(d[1])),
                    y: this.data_probs_30[i],
                })
            }
            return dataToDisplay
        }

    @computed get probChartData15() {
            let probs = this.getProbs15;
            let dates = this.getDates;
            const dataToDisplay = [];
            const dlen = probs.length;
            for (var i=0; i<dlen; i++) {
                let d = dates[i].split('/')
                dataToDisplay.push({
                    //x: Date.parse("2017/"+dates[i]),
                    x: Date.UTC(2017,parseInt(d[0])-1,parseInt(d[1])),
                    y: this.data_probs_15[i],
                })
            }
            return dataToDisplay
        }

    @computed get probChartData() {
            let probs = this.getProbs;
            let dates = this.getDates;
            const dataToDisplay = [];
            const dlen = probs.length;
            for (var i=0; i<dlen; i++) {
                dataToDisplay.push({
                    //x: Date.UTC(2017,7,28+i),
                    x: Date.parse("2017/"+dates[i]),
                    y: this.data_probs[i],
                })
            }
            return dataToDisplay
        }

    @computed get chartTitle() {
            let t = ''
            if (this.getCrop=='Rye') {
                t = 'Probability of cover crop establishment before end of season (' + this.getCrop + ')'
            } else if (this.getCrop=='Buckwheat') {
                t = 'Probability of biomass > 1 ton/acre before hard freeze (' + this.getCrop + ')'
            } else if (this.getCrop=='Hairy Vetch') {
                t = 'Probability of cover crop establishment before hard freeze (' + this.getCrop + ')'
            } else if (this.getCrop=='Mustard') {
                t = 'Probability of biomass > 1.5 tons/acre before hard freeze (' + this.getCrop + ')'
            } else {
                t = ''
            }
            return t
        }

    @computed get chartSubtitle() {
            return '( Crop: '+ this.getCrop + ', Lat: ' + parseFloat(this.getLat).toFixed(4) +', Lon: ' + parseFloat(this.getLon).toFixed(4) + ' )'
        }

    @computed get chartConfig() {
            return {
                    credits: { enabled: false },
                    legend: {
                        labelFormatter: function () {
                            return '<span style="color:' + this.color + ';">' + this.name + '</span>';
                        },
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        floating: true,
                        x: 0,
                        y: 50,
                        //backgroundColor: '#FFFFFF'
                    },
                    chart: { 
                        height: 300,
                        width: 724,
                        marginTop: 60,
                        backgroundColor: null,
                    },
                    title: {
                        text: this.chartTitle,
                        style: { "fontWeight": "bold", "fontSize": "16px" },
                    },
                    //subtitle: {
                    //    text: this.chartSubtitle,
                    //    style: { "fontWeight": "bold", "fontSize": "12px" },
                    //},
                    plotOptions: {
                        series: {
                            marker: {
                                symbol: 'circle',
                                radius: 4
                            },
                            animation: this.getProbChartAnimation,
                            //events: { 
                            //    afterAnimate: (e) => {
                            //        this.updateChartLabel(false);
                            //    },
                            //    //mouseOver: (e) => {
                            //    //    this.updateChartLabel(true);
                            //    //},
                            //    //mouseOut: (e) => {
                            //    //    this.updateChartLabel(false);
                            //    //},
                            //}
                            point: {
                                events: { 
                                    mouseOver: (e) => {
                                        const d = new Date(e.target.x);
                                        const idx = e.target.index;
                                        this.updatePlantingDate(d.toISOString().slice(5,10).replace('-','/'));
                                        if (this.getChartLabel!=" ") { this.updateChartLabel(" ") }
                                        this.updateProb15(e.target.series.chart.series[0].data[idx].y);
                                    },
                                }
                            }
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        //title: { text: 'Planting Date' },
                        dateTimeLabelFormats: { day: '%b %e', week: '%b %e', year: '%Y' },
                        labels: {
                            align: 'center',
                            x: 0,
                            y: 20 
                        },
                    },
                    yAxis: {
                        title: { text: 'Probability (%)' },
                        min: 0,
                        max: 100,
                        tickInterval: 50,
                    },
                    tooltip: {
                        //enabled: false,
                        useHTML: true,
                        positioner: () => {
                            //return {x:100, y:120};
                            return {x:270, y:25};
                        },
                        shadow: false,
                        borderWidth: 0,
                        backgroundColor: null,
                        style: {"fontSize": "12px"},
                        //headerFormat: '<span style="font-size: 16px"><b>Planting Date: </b>{point.key:%m/%d}</span><br/>',
                        headerFormat: "",
                        pointFormat: "",
                        //pointFormat: "<b>Prob: </b>{point.y:.1f}%",
                        //xDateFormat: "%m/%d",
                        crosshairs: [{
                            width: 1,
                            color: 'gray',
                            dashStyle: 'solid'
                        }],
                    },
                    series: [{
                        type: 'line',
                        name: 'Recent 15-yr Avg',
                        data: this.probChartData15,
                        lineWidth: 4,
                        color: 'rgba(0,0,0,1.0)',
                    },{
                        type: 'line',
                        name: '30-yr Normal',
                        data: this.probChartData30,
                        lineWidth: 2,
                        color: 'rgba(0,0,0,0.2)',
                        enableMouseTracking: false,
                    },{
                        type: 'line',
                        name: 'POR: 1979-2016',
                        data: this.probChartDataPOR,
                        lineWidth: 2,
                        color: 'rgba(0,0,255,0.2)',
                        enableMouseTracking: false,
                    }],
                    //labels: {
                    //    items: [{
                    //        html: "<b>"+this.getChartLabel+"</b>",
                    //        style: {
                    //            //left: '400px',
                    //            //top: '10px',
                    //            left: '220px',
                    //            top: '130px',
                    //            width: '200px',
                    //            fontSize: '16px',
                    //            color: 'rgba(0,0,0,0.2)',
                    //        }
                    //    }]
                    //},
                }
        }

    @computed get gaugeConfig_15yrNormal() {
            return {
                width: 300,
                chartTitle: "Recent 15-yr Avg",
                chartValue: this.getProb15,
                colorData: [{
                        value: 0, // Meaning span is 0 to 0
                        valueLabel: 0,
                        color: '#ff4000'
                    }, {
                        value: 10, // Meaning span is 0 to 10
                        valueLabel: 10,
                        color: '#ff4000'
                    }, {
                        value: 10, // span 10 to 20
                        valueLabel: 20,
                        color: '#ff8000'
                    }, {
                        value: 10, // span 20 to 30
                        valueLabel: 30,
                        color: '#ffbf00'
                    }, {
                        value: 10, // span 30 to 40
                        valueLabel: 40,
                        color: '#ffff00'
                    }, {
                        value: 10, // span 40 to 50
                        valueLabel: 50,
                        color: '#bfff00'
                    }, {
                        value: 10, // span 50 to 60
                        valueLabel: 60,
                        color: '#00ffbf'
                    }, {
                        value: 10, // span 60 to 70
                        valueLabel: 70,
                        color: '#00ffff'
                    }, {
                        value: 10, // span 70 to 80
                        valueLabel: 80,
                        color: '#00bfff'
                    }, {
                        value: 10, // span 80 to 90
                        valueLabel: 90,
                        color: '#0080ff'
                    }, {
                        value: 10, // span 90 to 100
                        valueLabel: 100,
                        color: '#0040ff'
                    }
                ],
            }
        }

    @computed get barChartData() {
            let idx = 0;
            let colorUse = '';
            //let gdd = this.getGdd;
            //let years = this.getYears;
            //let dates = this.getDates;
            let gdd = this.getCropData['gdd'];
            let years = this.getCropData['years'];
            let dates = this.getCropData['dates'];
            let monthday = this.getPlantingDate;
            if (dates.includes(monthday)) {
                // use idx of date of interest
                idx = dates.findIndex(x => x===monthday);
            } else {
                // use idx of first date available
                idx = 0;
            }
            const dataToDisplay = [];
            const dlen = gdd[idx].length;
            for (var i=0; i<dlen; i++) {
                if (gdd[idx][i]>=parseFloat(this.getCropData['gdd_thresh'])) {
                    colorUse = 'rgba(0,0,255,1.0)'
                } else {
                    colorUse = 'rgba(255,0,0,1.0)'
                }
                dataToDisplay.push({
                    //x: Date.UTC(1979+i,1,1),
                    x: Date.UTC(years[i],1,1),
                    y: gdd[idx][i],
                    color: colorUse,
                })
            }
            return dataToDisplay
        }

    @computed get chartTitle_bar() {
            let t = ''
            let c = this.getCropData
            if (this.getCrop=='Rye') {
                t = 'GDDs (base '+c['gdd_base']+') from planting date (' + this.getPlantingDate + ') through end of season'
            } else if (this.getCrop=='Buckwheat') {
                t = 'GDDs (base '+c['gdd_base']+') from planting date (' + this.getPlantingDate + ') through hard freeze'
            } else if (this.getCrop=='Hairy Vetch') {
                t = 'GDDs (base '+c['gdd_base']+') from planting date (' + this.getPlantingDate + ') through hard freeze'
            } else if (this.getCrop=='Mustard') {
                t = 'GDDs (base '+c['gdd_base']+') from planting date (' + this.getPlantingDate + ') through hard freeze'
            } else {
                t = ''
            }
            return t
        }

    @computed get chartSubtitle_bar() {
            return '( Crop: '+ this.getCrop + ', Lat: ' + this.getLat +', Lon: ' + this.getLon + ' )'
        }

    @computed get chartConfig_bar() {
            return {
                    credits: { enabled: false },
                    legend: { enabled: false },
                    chart: { 
                        height: 160,
                        width: 724,
                        //marginTop: 60,
                        marginBottom: 15,
                        //margin: [5,5,5,10],
                    },
                    title: {
                        text: this.chartTitle_bar,
                        //style: { "color": "#0000FF", "fontWeight": "bold", "fontSize": "12px" },
                        style: { "fontWeight": "bold", "fontSize": "16px" },
                        //align: 'left',
                        //x: 20,
                        //y: 8,
                        //floating: true,
                    },
                    subtitle: {
                        //text: this.chartSubtitle,
                        text: '',
                        style: { "fontWeight": "bold", "fontSize": "12px" },
                    },
                    plotOptions: {
                        series: {
                            animation: false,
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        //title: { text: 'Planting Date' },
                        title: { text: '' },
                        dateTimeLabelFormats: { day: '%b %e', week: '%b %e', year: '%Y' },
                        labels: {
                            align: 'center',
                            x: 0,
                            y: 10 
                        },
                    },
                    yAxis: {
                        //title: { text: 'Probability (%)' },
                        title: { text: 'GDD-'+this.getCropData['gdd_base'] },
                        //min: 0,
                        //min: parseInt(this.getCropData['gdd_thresh']) - parseInt(this.getCropData['gdd_thresh'])/2.,
                        min: Math.min(...this.flattenGDD),
                        //max: 800,
                        //max: parseInt(this.getCropData['gdd_thresh'])+700,
                        //max: parseInt(this.getCropData['gdd_thresh']) + parseInt(this.getCropData['gdd_thresh'])/2.,
                        max: Math.max(...this.flattenGDD),
                        startOnTick: false,
                        endOnTick: false,
                        plotLines: [{
                            color: 'black',
                            dashStyle: 'solid',
                            zIndex: 4,
                            width: 2,
                            //value: parseFloat(this.getCropData['gdd_thresh']),
                            value: parseFloat(this.getCropData['gdd_thresh']),
                            label:{
                                text:this.getCropData['gdd_thresh'],
                                style: {
                                    color: 'blue',
                                    fontWeight: 'bold',
                                },
                                x:-33,
                                y:3
                            }
                        }],
                        visible: true,
                    },
                    tooltip: {
                        //pointFormat: "Prob: {point.y:.2f}",
                        pointFormat: "GDD: {point.y:,.0f}",
                        xDateFormat: "%Y",
                        crosshairs: [{
                            width: 1,
                            color: 'gray',
                            dashStyle: 'solid'
                        }],
                    },
                    series: [{
                        type: 'column',
                        name: 'GDD',
                        data: this.barChartData,
                    }],
                }
        }

    @action downloadChartData = () => {
            if (this.getLoader === false) {
                this.updateLoader(true);
            }
            const url = 'http://tools.climatesmartfarming.org/covercrop/data/?lat='+this.getLat+'&lon='+this.getLon+'&crop='+this.getCrop
            jsonp(url, null, (err,data) => {
                if (err) {
                    console.error(err.message);
                    this.updateProbChartData({});
                    this.updateBarChartData({});
                    return
                } else {
                    this.updateCropData(data);
                    this.updatePlantingDate(data['dates'][0]);
                    this.updateProbChartAnimationFlag(false); 
                    this.updateProbChartData(data);
                    this.updateBarChartData(data);
                    this.updateProb15(100);
                    if (this.getLoader === true) {
                        this.updateLoader(false);
                    }
                    return
                }
            });
        }

    @computed get dataSourcesContent() {
            const content = "" +
                "<h2>Data Sources</h2>" +
                "<button onClick={this.closeDataSources}>close</button>"
            return content
        }

    constructor(initialState) {
        extendObservable(this,
            initialState
        );
        //this.downloadChartData()
    }
}

