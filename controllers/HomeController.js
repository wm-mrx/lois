var co = require('co');
var _ = require('lodash');
var mongoose = require('mongoose');
var dateUtil = require('../utils/date');
var static = require('../utils/static');
var schemas = require('../models/schemas');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.getOverall = function (query) {
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "_id",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        }
    ]).exec();
};

Controller.prototype.getOverallByDate = function (inputLocationId, date) {
    
    var parameters = { "inputLocation": ObjectId(inputLocationId) };

    parameters['date'] = { "$gte": dateUtil.createLower(date), "$lte": dateUtil.createUpper(date) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "_id",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        }
    ]).exec();
}

Controller.prototype.getTotalTerekap = function (query) {
    var date = query['date'];
    var inputLocationId = query['inputLocationId'];

    var parameters = { "inputLocation": ObjectId(inputLocationId), "date": { "$gte": dateUtil.createLower(date), "$lte": dateUtil.createUpper(date) } };
    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        { "$match": { "items.status": "Terekap" } },
        {
            "$group": {
                "_id": "_id",
                "total": { "$sum": 1 }
            }
        }
    ]).exec();
}

Controller.prototype.getTotalBelumTerekap = function (query) {
    var date = query['date'];
    var inputLocationId = query['inputLocationId'];

    var parameters = { "inputLocation": ObjectId(inputLocationId), "date": { "$gte": dateUtil.createLower(date), "$lte": dateUtil.createUpper(date) } };
    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        { "$match": { "items.status": "Belum Terekap" } },
        {
            "$group": {
                "_id": "_id",
                "total": { "$sum": 1 }
            }
        }
    ]).exec();
}

Controller.prototype.getTotalTerkirim = function (query) {
    var date = query['date'];
    var inputLocationId = query['inputLocationId'];

    var parameters = { "inputLocation": ObjectId(inputLocationId), "date": { "$gte": dateUtil.createLower(date), "$lte": dateUtil.createUpper(date) } };
    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        { "$match": { "items.status": "Terkirim" } },
        {
            "$group": {
                "_id": "_id",
                "total": { "$sum": 1 }
            }
        }
    ]).exec();
}


Controller.prototype.getDestinations = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$destination",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$items.cost.shipping" },
                "shippings": { "$sum": 1 },
            }
        },
        {
            "$project": {
                "_id": "$_id",
                "colli": "$colli",
                "weight": "$weight",
                "price": "$price",
                "shippings": "$shippings",
                "setNgModel": { "$literal": "ctrl.filters.destination" }
            }
        },
        { "$lookup": { "from": "locations", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]);
};

Controller.prototype.getSenders = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$sender",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$items.cost.shipping" },
                "shippings": { "$sum": 1 }
            }
        },
        {
            "$project": {
                "_id": "$_id",
                "colli": "$colli",
                "weight": "$weight",
                "price": "$price",
                "shippings": "$shippings",
                "setNgModel": { "$literal": "ctrl.filters.sender" }
            }
        },
        { "$lookup": { "from": "clients", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getPaymentTypes = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$payment.type",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$items.cost.shipping" },
                "shippings": { "$sum": 1 }
            }
        },
        {
            "$project": {
                "_id": "$_id",
                "colli": "$colli",
                "weight": "$weight",
                "price": "$price",
                "shippings": "$shippings",
                "setNgModel": { "$literal": "ctrl.filters.paymentType" }
            }
        },
        { "$lookup": { "from": "paymentTypes", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getPaymentStatuses = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$payment.status",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$items.cost.shipping" },
                "shippings": { "$sum": 1 }
            }
        },
        {
            "$project": {
                "_id": "$_id",
                "colli": "$colli",
                "weight": "$weight",
                "price": "$price",
                "shippings": "$shippings",
                "setNgModel": { "$literal": "ctrl.filters.paymentStatus" }
            }
        },
        { "$sort": { "payment.status": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getRegions = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$regions.destination",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$items.cost.shipping" },
                "shippings": { "$sum": 1 }
            }
        },
        {
            "$project": {
                "_id": "$_id",
                "colli": "$colli",
                "weight": "$weight",
                "price": "$price",
                "shippings": "$shippings",
                "setNgModel": { "$literal": "ctrl.filters.regionDest" }
            }
        },
        { "$lookup": { "from": "regions", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['date'])
        parameters['date'] = { "$gte": dateUtil.createLower(query['date']), "$lte": dateUtil.createUpper(query['date']) };

    return schemas.shippings.find(parameters).populate('sender destination payment.type').skip(skip).limit(limit).exec();
};

module.exports = new Controller();