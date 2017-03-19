var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;
var static = require('../utils/static');

function Controller() {};

Controller.prototype.getPaid = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    //var parameters = { "inputLocation": ObjectId(query['location']), "payment.status": 'Terbayar' };
    var parameters = {  "payment.status": 'Terbayar' };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['bank'])
        parameters['payment.phases.bank'] = new RegExp(query['bank'], 'i');

    if (query['paymentDate'])
        parameters['payment.phases'] = { "$elemMatch": { "date": { "$gte": date.createLower(query['paymentDate']), "$lte": date.createUpper(query['paymentDate']) } } };

    if (query['transferDate'])
        parameters['payment.phases'] = { "$elemMatch": { "transferDate": { "$gte": date.createLower(query['transferDate']), "$lte": date.createUpper(query['transferDate']) } } };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getPaidReport = function (viewModels, query, user) {
    var self = this;
    var lastPaymentDate = _.map(viewModels[0].payment.phases, "date")[0];

    var result = {
        "title": "LAPORAN SURAT JALAN TERBAYAR",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "reportDate": query['transferDate'],
        "reportBank": query['bank'],
        "dateFrom": query['from'],
        "dateTo": query['to'],
        "headers": ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'CONTENT', 'QTY', 'WEIGHT', 'DELIVERY', 'BANK', 'INVOICE'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        if (query['paymentType']) {
            var paymentType = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();
            result['paymentMethod'] = paymentType ? paymentType.name : " ";
        }
        else result['paymentMethod'] = "";

        if (query['regionSource']) {
            var regionSource = yield schemas.regions.findOne({ "_id": ObjectId(query['regionSource']) }).exec();
            result['regionSource'] = regionSource ? regionSource.name : " ";
        }
        else result['regionSource'] = "";

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var contents = _.map(viewModel.items, "content");
            var transactionDates = _.map(viewModel.payment.phases, "transferDate");
            var paymentDates = _.map(viewModel.payment.phases, "date");
            var banks = _.map(viewModel.payment.phases, "bank");
            var totalColli = _.sumBy(viewModel.items, "colli.quantity");

            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join(', ') : " ",
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "price": viewModel.cost.total,
                "transactionDate": transactionDates,
                "paymentDate": paymentDates.length > 0 ? paymentDates.join(', ') : " ",
                "bank": banks.length > 0 ? banks.join(', ') : " ",
                "invoice": viewModel.invoice.client ? viewModel.invoice.client : viewModel.invoice.all ? viewModel.invoice.all : " "
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;

        return result;
    });
};

Controller.prototype.getUnpaid = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    //var parameters = { "inputLocation": ObjectId(query['location']), "payment.status": { $ne: 'Terbayar' }, "sender": { "$ne": ObjectId(static.client) } };
    var parameters = { "payment.status": { $ne: 'Terbayar' }, "sender": { "$ne": ObjectId(static.client) } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['invoice'])
        parameters['invoice.all'] = new RegExp(query['invoice'], 'i');

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnpaidReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN SURAT JALAN BELUM TERBAYAR",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "date": new Date(),
        "dateFrom": query['from'],
        "dateTo": query['to'],
        "headers": ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'CONTENT', 'QTY', 'WEIGHT', 'DELIVERY', 'PAYMENT', 'INVOICE', 'DATE'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        if (query['regionDest']) {
            var destination = yield schemas.regions.findOne({ "_id": ObjectId(query['regionDest']) }).exec();
            result['destination'] = destination.name;
        }     
        else
            result['destination'] = '';    

        if (query['paymentType']) {
            var paymentType = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();
            result['paymentType'] = paymentType ? paymentType.name : " ";
        }
        else result['paymentType'] = '';

        if (query['regionSource']) {
            var regionSource = yield schemas.regions.findOne({ "_id": ObjectId(query['regionSource']) }).exec();
            result['regionSource'] = regionSource ? regionSource.name : " ";
        }
        else result['regionSource'] = "";

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var contents = _.map(viewModel.items, "content");
            var invoices = [];

            if (viewModel.invoice.all !== null)
                invoices.push(viewModel.invoice.all);
            if (viewModel.invoice.client !== null)
                invoices.push(viewModel.invoice.client);
            if (viewModel.invoice.partner !== null)
                invoices.push(viewModel.invoice.partner);

            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');

            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join(', ') : " ",
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "price": viewModel.cost.total,
                "paymentMethod": viewModel.payment.type.name,
                "invoice": invoices.length > 0 ? invoices.join(', ') : " ",
                "transactionDate": viewModel.date
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;

        return result;
    });
};

Controller.prototype.getRecapitulations = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };
    var recapParameters = { "items.recapitulations.quantity": { "$gt": 0 } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['trainType'])
        recapParameters['items.recapitulations.trainType'] = ObjectId(query['trainType']);

    if (query['vehicleNumber'])
        recapParameters['items.recapitulations.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        recapParameters['items.recapitulations.driver'] = ObjectId(query['driver'])

    if (query['recapDate'])
        recapParameters['items.recapitulations.updatedDate'] = { "$gte": date.createLower(query['recapDate']), "$lte": date.createUpper(query['recapDate']) };

    if (query['departureDate'])
        recapParameters['items.recapitulations.departureDate'] = { "$gte": date.createLower(query['departureDate']), "$lte": date.createUpper(query['departureDate']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.recapitulations" },
        { "$match": recapParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "trainTypes", "localField": "items.recapitulations.trainType", "foreignField": "_id", "as": "trainType" } },
        { "$lookup": { "from": "drivers", "localField": "items.recapitulations.driver", "foreignField": "_id", "as": "driver" } },
        { "$lookup": { "from": "locations", "localField": "destination", "foreignField": "_id", "as": "destination" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getRecapitulationsReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN REKAP",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "trainType": "",
        "user": user.name,
        "date": query['recapDate'] ? query['recapDate'] : query['departureDate'],
        "driver": null,
        "car": null,
        "printNoPrice": viewModels[0].noPrice,
        "headers": [],
        "rows": []
    };

    if (query.printNoPrice)
        result.headers = ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'CONTENT', 'QTY', 'TOTAL QTY', 'WEIGHT', 'PAYMENT', 'LIMAS', 'RELATION', 'DATE', 'DESTINATION'];
    else
        result.headers = ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'CONTENT', 'QTY', 'TOTAL QTY', 'WEIGHT', 'DELIVERY', 'PAYMENT', 'LIMAS', 'RELATION', 'DATE', 'DESTINATION'];

    return co(function* () {
        var totalColliQuantity = 0;
        var totalRecappedColli = 0;
        var totalWeight = 0;
        var totalPrice = 0;

        var trainType = yield schemas.trainTypes.findOne({ "_id": ObjectId(viewModels[0].items.recapitulations.trainType) }).exec();
        result['trainType'] = trainType.name;

        var paymentType = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();
        result['paymentMethod'] = paymentType ? paymentType.name : " ";

        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield schemas.drivers.findOne({ _id: ObjectId(viewModel.items.recapitulations.driver) });
            var user = yield schemas.users.findOne({ _id: ObjectId(viewModel.items.recapitulations.user) });
            var paymentType = yield schemas.paymentTypes.findOne({ _id: ObjectId(viewModel.payment.type) });

            var price = 0;
            if (viewModel.cost.expeditionType == 'include') {           
                var baseprice = (viewModel.cost.worker / viewModel.itemCount) + ((viewModel.items.cost.shipping / viewModel.items.colli.quantity) * viewModel.items.recapitulations.quantity);
                var ppn = baseprice * viewModel.cost.ppn;
                if (viewModel.cost.pph == 0.98)
                    price = (baseprice / viewModel.cost.pph) + ppn;
                else {
                    var pph = baseprice * viewModel.cost.pph;
                    price = baseprice + pph + ppn;
                }
            }
            else if (viewModel.cost.expeditionType == 'reimburse') {
                var baseprice = (viewModel.cost.expedition / viewModel.itemCount) + (viewModel.cost.worker / viewModel.itemCount) + ((viewModel.items.cost.shipping / viewModel.items.colli.quantity) * viewModel.items.recapitulations.quantity);
                var ppn = baseprice * viewModel.cost.ppn;
                if (viewModel.cost.pph == 0.98)
                    price = (baseprice / viewModel.cost.pph) + ppn;
                else {
                    var pph = baseprice * viewModel.cost.pph;
                    price = baseprice + pph + ppn;
                }
            }

            if (driver)
                result.driver = driver.name;

            result.car = viewModel.items.recapitulations.vehicleNumber;

            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "content": viewModel.items.content,
                "totalColli": viewModel.items.colli.quantity,
                "colli": viewModel.items.recapitulations.quantity,
                "weight": viewModel.items.recapitulations.weight,
                "price": price,
                "paymentMethod": paymentType.name,
                "recapLimasColor": viewModel.items.recapitulations.limasColor,
                "recapRelationColor": viewModel.items.recapitulations.relationColor,
                "transactionDate": viewModel.date,
                "destination": viewModel.destination[0].name
            });

            totalColliQuantity += _.parseInt(viewModel.items.colli.quantity);
            totalRecappedColli += _.parseInt(viewModel.items.recapitulations.quantity);
            totalWeight += parseFloat(viewModel.items.recapitulations.weight);
            totalPrice += parseFloat(price);
        });

        result['sumTotalColli'] = totalColliQuantity;
        result['sumColli'] = totalRecappedColli;
        result['sumWeight'] = totalWeight;
        result['sumPrice'] = totalPrice;
        return result;
    });
};

Controller.prototype.getDeliveries = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": ObjectId(query['region']) };
    var deliveryParameters = { "items.deliveries.quantity": { "$gt": 0 } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['deliveryCode'])
        deliveryParameters['items.deliveries.deliveryCode'] = new RegExp(query['deliveryCode'], 'i');

    if (query['vehicleNumber'])
        deliveryParameters['items.deliveries.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        deliveryParameters['items.deliveries.driver'] = ObjectId(query['driver'])

    if (query['deliveryDate'])
        deliveryParameters['items.deliveries.updatedDate'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.deliveries" },
        { "$match": deliveryParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "paymentType" } },
        { "$lookup": { "from": "drivers", "localField": "items.deliveries.driver", "foreignField": "_id", "as": "driver" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getDeliveriesReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN PENGANTAR BARANG",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "date": viewModels[0].items.deliveries.date ? viewModels[0].items.deliveries.date : viewModels[0].items.deliveries.createdDate ? viewModels[0].items.deliveries.createdDate : '',
        "driver": null,
        "deliveryDate": query['deliveryDate'],
        "carFilter": query['vehicleNumber'],
        "car": null,
        "headers": ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'ADDRESS', 'PHONE', 'CONTENT', 'QTY', 'TOTAL QTY', 'DELIVERY', 'PAYMENT', 'REMARKS'],
        "rows": [],
        "destinations": []
    };

    return co(function* () {

        if (query['driver']) {
            var driverFilter = yield schemas.drivers.findOne({ "_id": ObjectId(query['driver']) }).exec();
            result['driverFilter'] = driverFilter.name;
        }
        else
            result['driverFilter'] = '';

        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield schemas.drivers.findOne({ _id: ObjectId(viewModel.items.deliveries.driver) });

            var price = 0;
            if (viewModel.cost.expeditionType == 'include') {
                var baseprice = (viewModel.cost.worker / viewModel.itemCount) + ((viewModel.items.cost.shipping / viewModel.items.colli.quantity) * viewModel.items.deliveries.quantity);
                var ppn = baseprice * viewModel.cost.ppn;
                if (viewModel.cost.pph == 0.98)
                    price = (baseprice / viewModel.cost.pph) + ppn;
                else {
                    var pph = baseprice * viewModel.cost.pph;
                    price = baseprice + pph + ppn;
                }                               
            }
            else if (viewModel.cost.expeditionType == 'reimburse') {
                var baseprice = (viewModel.cost.expedition / viewModel.itemCount) + (viewModel.cost.worker / viewModel.itemCount) + ((viewModel.items.cost.shipping / viewModel.items.colli.quantity) * viewModel.items.deliveries.quantity);
                var ppn = baseprice * viewModel.cost.ppn;
                if (viewModel.cost.pph == 0.98)
                    price = (baseprice / viewModel.cost.pph) + ppn;
                else {
                    var pph = baseprice * viewModel.cost.pph;
                    price = baseprice + pph + ppn;
                }                               
            }

            if (driver)
                result.driver = driver.name;

            result.car = viewModel.items.deliveries.vehicleNumber;
            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "receiverAddress": viewModel.receiver.address,
                "receiverContact": viewModel.receiver.contact,
                "content": viewModel.items.content,
                "totalColli": viewModel.items.colli.quantity,
                "colli": viewModel.items.deliveries.quantity,
                "price": price,
                "notes": '',
                "paymentMethod": viewModel.paymentType[0].name
            });

            var destination = yield schemas.locations.findOne({ _id: ObjectId(viewModel.destination) });
            if (destination)
                result.destinations.push(
                    destination.name
                );

        });

        return result;
    });
};

Controller.prototype.getReturns = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": ObjectId(query['region']), "returned": true };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['returnDate'])
        parameters['returnInfo.modified.date'] = { "$gte": date.createLower(query['returnDate']), "$lte": date.createUpper(query['returnDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender destination').skip(skip).limit(limit).exec();
};

Controller.prototype.getReturnsReport = function (viewModels, query, user) {
    var self = this;
    var result = {
        "title": "LAPORAN RETUR",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "date": query['returnDate'] ? query['returnDate'] : null,
        "headers": ['NO', 'SPB NO.', 'SENDER', 'DELIVERY', 'RELATION NO.', 'LIMAS', 'RELATION', 'DRIVER', 'RECEIVED DATE', 'RECEIVED BY', 'SIGN', 'STAMP', 'RECEIPT'],
        "rows": []
    };

    return co(function* () {
        var destinations = [];

        var payment_method = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();

        if (payment_method)
            result['paymentMethod'] = payment_method.name;

        yield* _co.coEach(viewModels, function* (viewModel) {

            var drivers = [];
            var vehicleNumbers = [];
            var deliveryDates = [];

            destinations.push(viewModel.destination.name);

            yield* _co.coEach(viewModel.items, function* (item) {

                var deliveries = _.filter(item.deliveries, function (delivery) {
                    return delivery.quantity > 0;
                });

                yield* _co.coEach(deliveries, function* (delivery) {
                    var driver = yield schemas.drivers.findOne({ _id: ObjectId(delivery.driver) });

                    if (driver)
                        drivers.push(driver.name);

                    vehicleNumbers.push(delivery.vehicleNumber);
                    deliveryDates.push(delivery.date ? delivery.date : delivery.createdDate);
                });
            });

            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "price": viewModel.cost.total,
                "limasColor": viewModel.returnInfo.limasColor,
                "relationColor": viewModel.returnInfo.relationColor,
                "partnerNumber": viewModel.returnInfo.relationCode,
                "driver": drivers.length > 0 ? drivers[drivers.length - 1] : " ",
                "car": vehicleNumbers.length > 0 ? vehicleNumbers.join(', ') : " ",
                "deliveryDate": deliveryDates.length > 0 ? deliveryDates.join(', ') : " ",
                "signature": viewModel.returnInfo.signed ? 'v' : 'x',
                "stamp": viewModel.returnInfo.stamped ? 'v' : 'x',
                "receivedBy": viewModel.returnInfo.concernedPerson,
                "porterReceipt": viewModel.returnInfo.receipt ? 'v' : 'x'
            });
        });

        result['destination'] = destinations;

        return result;
    });
};

Controller.prototype.getUnconfirmed = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "items.recapitulations.quantity": { "$gt": 0 }, "confirmed": false };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "date": -1 }).populate('sender').populate('destination').populate('regions.destination').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnconfirmedReport = function (viewModels, user) {
    var self = this;
    var result = {
        "title": "LAPORAN SURAT JALAN BELUM KEMBALI",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "headers": ['NO', 'DATE', 'SPB NO.', 'SENDER', 'RECEIVER', 'AREA', 'STATUS'],
        "rows": []
    };

    return co(function* () {

        var region = yield schemas.regions.findOne({ "_id": ObjectId(viewModels[0].destination.region) }).exec();
        result['destination'] = region.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "transactionDate": viewModel.date,
                "receiver": viewModel.receiver.name,
                "destination": viewModel.destination.name
            });
        });

        return result;
    });
};

Controller.prototype.getDeliveryList = function (query) {
    return co(function* () {      
        var limit = query['limit'] ? query['limit'] : 10;
        var skip = query['skip'] ? query['skip'] : 0;
        var parameters = {};

        if (query['spbNumberStart'] && query['spbNumberStart']) {
            var Start = yield schemas.shippings.findOne({ 'spbNumber': query['spbNumberStart'] });
            var End = yield schemas.shippings.findOne({ 'spbNumber': query['spbNumberEnd'] });
            if (Start && End)
            parameters['number'] = { "$gte": Start.number, "$lte": End.number };
        }

        if (query['regionDest'])
            parameters['regions.destination'] = ObjectId(query['regionDest']);

        if (query['regionSource']) {
            parameters['regions.source'] = ObjectId(query['regionSource']);
            parameters['regions.destination'] = ObjectId(query['locationRegion']);
        }
        else
            parameters['inputLocation'] = ObjectId(query['location']);

        if (query['spbNumber'])
            parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

        if (query['sender'])
            parameters['sender'] = ObjectId(query['sender']);

        if (query['receiverName'])
            parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

        if (query['destination'])
            parameters['destination'] = ObjectId(query['destination']);

        if (query['paymentType'])
            parameters['payment.type'] = ObjectId(query['paymentType']);

        if (query['from'] && query['to'])
            parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

        return yield schemas.shippings.find(parameters).sort({ "number": 1 }).populate('sender destination regions.destination payment.type').skip(skip).limit(limit).exec();
    });
};

Controller.prototype.getDeliveryListReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN DAFTAR KIRIM",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "startDate": query['from'] ? query['from'] : " ",
        "endDate": query['to'] ? query['to'] : " ",
        "headers": ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'CONTENT', 'QTY', 'WEIGHT', 'DELIVERY', 'PAYMENT', 'REGION', 'DATE'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        var payment_method = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();

        if (payment_method)
            result['paymentMethod'] = payment_method.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');
            var contents = _.map(viewModel.items, "content");

            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join(', ') : " ",
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "price": viewModel.cost.total,
                "paymentMethod": viewModel.payment.type.name,
                "destinationRegion": viewModel.regions.destination.name,
                "transactionDate": viewModel.date,
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;

        return result;
    });
};

Controller.prototype.getCommisions = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "sender": { "$ne": ObjectId(static.client) } };

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource']) {
        parameters['regions.source'] = ObjectId(query['regionSource']);
        parameters['regions.destination'] = ObjectId(query['locationRegion']);
    }
    else
        //parameters['inputLocation'] = ObjectId(query['location']);
        parameters['regions.source'] = ObjectId(query['locationRegion']);

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender destination regions.destination payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getCommisionsReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "LAPORAN KOMISI",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "startDate": query['from'],
        "endDate": query['to'],
        "paymentStatus": query['paymentStatus'],
        "headers": ['NO', 'DATE', 'SPB NO.', 'QTY', 'WEIGHT', 'COST', 'ADDITIONAL CHARGES', 'PORTER FEE', 'PPH 23', 'PPN 10%', 'TOTAL'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;
        var sumCost = 0;
        var sumBeaTambahan = 0;
        var sumBeaKuli = 0;
        var sumPph = 0;
        var sumPpn = 0; 

        if (query['regionDest']) {
            var region = yield schemas.regions.findOne({ "_id": ObjectId(query['regionDest']) }).exec();
            result['destination'] = region.name;
        }

        if (query['paymentType']) {
            var paymentType = yield schemas.paymentTypes.findOne({ "_id": ObjectId(query['paymentType']) }).exec();
            result['paymentMethod'] = paymentType.name;
        }

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');
            var totalAdditionalCost = _.sumBy(viewModel.items, 'cost.additional');
            var contents = _.map(viewModel.items, "content");

            var cost = viewModel.cost.base - totalAdditionalCost;
            var pph = viewModel.cost.pph === 0.98 ? (viewModel.cost.base / viewModel.cost.pph) - viewModel.cost.base : viewModel.cost.pph * viewModel.cost.base;
            var ppn = viewModel.cost.ppn * viewModel.cost.base;

            result.rows.push({
                "transactionDate": viewModel.date,
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "receiver": viewModel.receiver.name,
                "content": contents.length > 0 ? contents.join(', ') : " ",
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "cost": cost,
                "price": viewModel.cost.total,
                "additionalCost": totalAdditionalCost,
                "pph": pph,
                "ppn": ppn,
                "workerCost": viewModel.cost.worker
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;

            sumCost += cost;
            sumBeaTambahan += totalAdditionalCost;
            sumBeaKuli += viewModel.cost.worker;
            sumPph += pph;
            sumPpn += ppn;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;

        result['sumCost'] = sumCost;
        result['sumAdditionalCost'] = sumBeaTambahan;
        result['sumWorkerCost'] = sumBeaKuli;
        result['sumPph'] = sumPph;
        result['sumPpn'] = sumPpn;

        return result;
    });
};

Controller.prototype.getPayOff = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "sender": { "$ne": ObjectId(static.client) } };

    if (query['from'] && !query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['from']) };

    else if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['transactionStatus'] === "Belum Terekap") {
        return schemas.shippings.aggregate([
            { "$match": parameters },
            { "$match": { "items": { "$elemMatch": { "colli.available": { "$gt": 0 } } } } },
            { "$sort": { "number": -1 } },
            { "$unwind": "$items" },
            { "$match": { "items.colli.available": { "$gt": 0 } } },

            { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
            { "$lookup": { "from": "regions", "localField": "regions.destination", "foreignField": "_id", "as": "regions.destination" } },
            { "$lookup": { "from": "locations", "localField": "destination", "foreignField": "_id", "as": "destination" } },
            { "$lookup": { "from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "payment.type" } },

            { "$skip": skip },
            { "$limit": limit }
        ]).exec();
    } else {
        parameters['payment.type'] = ObjectId("57c46a80398059b414b3784f");
        return schemas.shippings.find(parameters).sort({ "number": 1 }).populate('sender destination regions.destination payment.type').skip(skip).limit(limit).exec();
    }
};

Controller.prototype.getPayOffReport = function (viewModels, query, user) {
    var self = this;

    var title;
    if (query['transactionStatus'] === "Belum Terekap")
        title = "BELUM TEREKAP";
    else
        title = "LUNAS";

    var result = {
        "title": title,
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "startDate": query['from'],
        "headers": ['NO', 'SPB NO.', 'SENDER', 'RECEIVER', 'DESTINATION', 'REGION', 'CONTENT', 'QTY', 'WEIGHT', 'DELIVERY', 'PAYMENT', 'DATE'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');
            var contents = _.map(viewModel.items, "content");

            var content = contents.length > 0 ? contents.join(', ') : " ";

            if (query['transactionStatus'] === "Belum Terekap") {
                totalWeight = viewModel.weight;
                totalColli = viewModel.colli;
                content = viewModel.items.content;
            }
        
            result.rows.push({
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name ? viewModel.sender.name : viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "destinationRegion": viewModel.regions.destination.name ? viewModel.regions.destination.name : viewModel.regions.destination[0].name,
                "destination": viewModel.destination.name ? viewModel.destination.name : viewModel.destination[0].name,
                "content": content,
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "price": viewModel.cost.total,
                "paymentMethod": viewModel.payment.type.name ? viewModel.payment.type.name : viewModel.payment.type[0].name,
                "transactionDate": viewModel.date
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;

        return result;
    });
};

Controller.prototype.getPartner = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "sender": { "$ne": ObjectId(static.client) } };

    if (query['feeType'] == 'worker')
        parameters['cost.worker'] = { "$gt": 0 };
    else
        parameters['cost.expedition'] = { "$gt": 0 };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['partner'])
        parameters['partner'] = ObjectId(query['partner']);

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentDate'])
        parameters['payment.phases'] = { "$elemMatch": { "date": { "$gte": date.createLower(query['paymentDate']), "$lte": date.createUpper(query['paymentDate']) } } };
    

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('sender destination regions.destination payment.type partner').skip(skip).limit(limit).exec();
};

Controller.prototype.getPartnerReport = function (viewModels, query, user) {
    var self = this;

    var result = {
        "title": "PARTNER",
        "token": "a24ef5a6-cc98-41bd-a3b4-5f5b9f878332",
        "location": user.location.name,
        "user": user.name,
        "startDate": query['from'],
        "endDate": query['to'],
        "feeType": query['feeType'] == "" ? "expedition" : query['feeType'],
        "paymentStatus": query['paymentStatus'] || " ",
        "paymentDate": query['paymentDate'] || " ",
        "headers": ['NO', 'SPB NO.', 'SENDER', 'PARTNER', 'CODE', 'QTY', 'WEIGHT', 'PRICE', 'PAYMENT FEE', 'WORKER FEE', 'DESTINATION', 'DATE'],
        "rows": []
    };

    return co(function* () {
        var sumTotalColli = 0;
        var sumTotalWeight = 0;
        var sumPrice = 0;
        var sumPartnerFee = 0;
        var sumWorkerFee = 0;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
            var totalColli = _.sumBy(viewModel.items, 'colli.quantity');

            result.rows.push({
                "transactionDate": viewModel.date,
                "spbNumber": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "totalColli": totalColli,
                "totalWeight": totalWeight,
                "price": viewModel.cost.total,
                "partner": viewModel.partner ? viewModel.partner.name : " ",
                "paymentFee": viewModel.cost.partner ? viewModel.cost.partner : 0,
                "partnerCode": viewModel.returnInfo.relationCode ? viewModel.returnInfo.relationCode : " ",
                "destination": viewModel.destination.name,
                "workerFee": viewModel.cost.worker ? viewModel.cost.worker : 0,
            });

            sumTotalColli += totalColli;
            sumTotalWeight += totalWeight;
            sumPrice += viewModel.cost.total;
            sumPartnerFee += viewModel.cost.partner;
            sumWorkerFee += viewModel.cost.worker;
        });

        result['sumTotalColli'] = sumTotalColli;
        result['sumTotalWeight'] = sumTotalWeight;
        result['sumPrice'] = sumPrice;
        result['sumPartnerFee'] = sumPartnerFee;
        result['sumWorkerFee'] = sumWorkerFee;

        return result;
    });   
};

module.exports = new Controller();