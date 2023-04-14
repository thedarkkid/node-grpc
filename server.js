let {routeguide} = require('./loader');
let grpc = require('@grpc/grpc-js');
const _ = require("lodash");

let feature_list = [];
let route_notes = {};

function checkFeature(point) {
    for (const feature of feature_list) {
        if (feature.location.latitude === point.latitude
            && feature.location.longitude === point.longitude) {
            return feature;
        }
    }
    return {
        name: '',
        location: point
    };
}

function getFeature(call, callback) {
    callback(null, checkFeature(call.request));
}

function listFeatures(call) {
    const {lo, hi} = call.request;
    let left = _.min([lo.longitude, hi.longitude]);
    let right = _.max([lo.longitude, hi.longitude]);
    let top = _.max([lo.latitude, hi.latitude]);
    let bottom = _.min([lo.latitude, hi.latitude]);

    feature_list.forEach(feature => {
        if (feature.name === '') return;
        if (feature.location.longitude >= left &&
            feature.location.longitude <= right &&
            feature.location.latitude >= bottom &&
            feature.location.latitude <= top) {
            call.write(feature);
        }
    });
    call.end()
}

function pointKey(point) {
    return point.latitude + ' ' + point.longitude;
}

function routeChat(call) {
    call.on('data', note => {
        let key = pointKey(note.location);
        if (route_notes.hasOwnProperty(key)) {
            route_notes[key].forEach(_note => call.write(_note));
        } else route_notes[key] = [];

        route_notes[key].push(JSON.parse(JSON.stringify(note)));
    })
    call.on('end', () => call.end())
}

function makeServer() {
    let server = new grpc.Server();
    server.addService(routeguide.RouteGuide.service, {
        getFeature,
        listFeatures,
        routeChat,
    });
    return server;
}

let routeServer = makeServer();
routeServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    routeServer.start()
    console.info("server started...");
});