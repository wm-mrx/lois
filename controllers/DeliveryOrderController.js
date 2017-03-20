﻿var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var static = require('../utils/static');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.getAll = function (query) {
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

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['transactionStatus']) {
        if (query['transactionStatus'] == 'SJ Balik')
            parameters['confirmed'] = true;
        else if (query['transactionStatus'] == 'Retur')
            parameters['returned'] = true;
        else {
            parameters['confirmed'] = false;
            parameters['returned'] = false;
            parameters['items.status'] = query['transactionStatus'];
        }
    }

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 })
        .populate('sender destination payment.type items.itemType items.packingType returnInfo.modified.user modified.user partner').skip(skip).limit(limit).lean().exec();
};

Controller.prototype.getRecapData = function (shippingId) {
    return schemas.shippings.aggregate([
        { "$match": { "_id": ObjectId(shippingId) } },
        { "$unwind": "$items" },
        { "$unwind": '$items.recapitulations' },
        { "$lookup": { "from": "trainTypes", "localField": "items.recapitulations.trainType", "foreignField": "_id", "as": "trainType" } },
        { "$lookup": { "from": "drivers", "localField": "items.recapitulations.driver", "foreignField": "_id", "as": "driver" } },
        { "$lookup": { "from": "users", "localField": "items.recapitulations.userUpdated", "foreignField": "_id", "as": "user" } }
    ]).exec();
}

Controller.prototype.getDeliveryData = function (shippingId) {
    return schemas.shippings.aggregate([
        { "$match": { "_id": ObjectId(shippingId) } },
        { "$unwind": "$items" },
        { "$unwind": '$items.deliveries' },
        { "$lookup": { "from": "drivers", "localField": "items.deliveries.driver", "foreignField": "_id", "as": "driver" } },
        { "$lookup": { "from": "users", "localField": "items.deliveries.userUpdated", "foreignField": "_id", "as": "user" } }
    ]).exec();
}

Controller.prototype.getDataReport = function (shipping) {
    var totalColli = 0;

    var result = {
        "title": "SURAT JALAN",
        "template_file": "suratjalan.xlsx",
        "sender": shipping.sender.name,
        "transaction_driver": shipping.driver,
        "destination_city": shipping.destination.name,
        "receiver": shipping.receiver.name,
        "receiver_phone": shipping.receiver.contact,
        "receiver_address": shipping.receiver.address,
        "contents": [],
        "sum_total_coli": totalColli,
        "sum_total_weight": null,
        "bea_tambahan": null,
        "sum_price": shipping.cost.total,
        "payment_method": shipping.payment.type.name,
        "spb_no": shipping.spbNumber,
        "po_no": shipping.notes.po,
        "transaction_date": shipping.date
    };

    result['contents'] = [];
    var totalWeight = 0;
    var additional = 0;

    _.forEach(shipping.items, function (item) {
        result['contents'].push({
            "content": item.content,
            "packing": item.packingType.name,
            "volume": item.dimensions.length + "x" + item.dimensions.width + "x" + item.dimensions.height
        });

        totalColli += item.colli.quantity;
        totalWeight += item.dimensions.weight;
        additional += item.cost.additional;
    });

    result['sum_total_weight'] = totalWeight;
    result['bea_tambahan'] = additional;

    return result;
};

module.exports = new Controller();