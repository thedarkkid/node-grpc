let PROTO_PATH = __dirname + '/route_guide.proto';
let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');
let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

module.exports.routeguide = protoDescriptor.routeguide;