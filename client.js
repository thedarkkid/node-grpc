let {routeguide} = require('./loader');
let grpc = require('@grpc/grpc-js');
let stub = new routeguide.RouteGuide('localhost:50051', grpc.credentials.createInsecure());

let point = {latitude: 409146138, longitude: -746188906};
let rectangle = {
    lo: {
        latitude: 400000000,
        longitude: -750000000
    },
    hi: {
        latitude: 420000000,
        longitude: -730000000
    }
};

stub.getFeature(point, (err, feature) => {
    if (err) {
        console.error("shit hit the fan", err);
        return;
    }
    console.info("feature", feature);
})

let call = stub.listFeatures(rectangle);
call.on('data', feature => {
    console.info(`Found feature ${feature.name}:`, feature);
})
call.on('end', () => console.log('[List Features]: Stream Ended'));
call.on('error', e => console.error('[List Features]: Error Occurred', e));
call.on('status', status => console.info('[List Features]: stat-', status));