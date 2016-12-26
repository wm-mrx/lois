var router = require('express').Router();
var config = require('../configurator').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/HomeController');

router.get('/lois/home', function (req, res) {
    res.redirect('/lois');
});

router.get(config.api + 'home/getAll', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getAll(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getOverall', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getOverall(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getOverallByDate', auth.isAuthenticated, function (req, res) {
    controller.getOverallByDate(req.session.user.location._id, req.query.date).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getTotalBelumTerekap', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['inputLocationId'] = req.session.user.location._id;

    controller.getTotalBelumTerekap(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getTotalTerekap', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['inputLocationId'] = req.session.user.location._id;

    controller.getTotalTerekap(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getTotalTerkirim', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['inputLocationId'] = req.session.user.location._id;

    controller.getTotalTerkirim(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getDestinations', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getDestinations(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getSenders', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getSenders(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getPaymentTypes', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getPaymentTypes(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getPaymentStatuses', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getPaymentStatuses(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

router.get(config.api + 'home/getRegions', auth.isAuthenticated, function (req, res) {
    var query = JSON.parse(req.query['query']);
    query['location'] = req.session.user.location._id;

    controller.getRegions(query).then(function (result) {
        return res.status(200).send(result);
    }).catch(function (error) {
        return res.status(500).send(error.message);
    });
});

module.exports = router;
